import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { generateSalesAgentReply } from '../gemini.ts';

export const webhookRouter = Router();

const DEFAULT_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'ai_sales_agent_verify_token_2026';
const APP_SECRET = process.env.FB_APP_SECRET || '';

// In-memory idempotency cache for deduplicating webhook retries
const processedMessageIds = new Set<string>();

// Meta Webhook Verification (GET)
webhookRouter.get('/facebook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === DEFAULT_VERIFY_TOKEN) {
    console.log('[Meta Webhook] Successfully verified webhook subscription with token!');
    res.status(200).send(challenge);
    return;
  }

  console.warn('[Meta Webhook] Verification token mismatch or missing');
  res.status(403).json({ error: 'Verification failed' });
});

// Meta Webhook Event Ingestion (POST)
webhookRouter.post('/facebook', async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;

  // Verify HMAC signature if APP_SECRET is configured
  if (APP_SECRET && signature) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const expectedSignature =
      'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
    if (signature !== expectedSignature) {
      console.warn('[Meta Webhook] Invalid signature rejected');
      res.status(401).json({ error: 'Invalid HMAC signature' });
      return;
    }
  }

  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry || []) {
      const pageId = entry.id;
      const messagingEvents = entry.messaging || [];

      for (const event of messagingEvents) {
        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;
        const message = event.message;

        if (!message || !senderId) continue;

        // Idempotency check: Ignore duplicate delivery
        if (message.mid && processedMessageIds.has(message.mid)) {
          console.log(`[Meta Webhook] Duplicate message ${message.mid} skipped via idempotency check.`);
          continue;
        }
        if (message.mid) {
          processedMessageIds.add(message.mid);
          // Keep cache size bounded
          if (processedMessageIds.size > 2000) {
            const first = processedMessageIds.values().next().value;
            if (first) processedMessageIds.delete(first);
          }
        }

        // Find connected Facebook Page in database
        const pages = db.getFacebookPages('ws-aura-dhaka-101');
        const matchedPage = pages.find((p) => p.pageId === pageId || p.isDemoMode) || pages[0];

        if (!matchedPage) continue;

        const workspaceId = matchedPage.workspaceId;

        // Find or create conversation
        let conversations = db.getConversations(workspaceId);
        let conv = conversations.find(
          (c) => c.customerFacebookId === senderId && c.facebookPageId === matchedPage.id
        );

        if (!conv) {
          const newConv = {
            id: `conv-${Date.now()}`,
            workspaceId,
            facebookPageId: matchedPage.id,
            customerName: `Customer #${senderId.slice(-4)}`,
            customerProfilePic:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            customerFacebookId: senderId,
            unreadCount: 1,
            lastMessageSnippet: message.text || '[Attachment]',
            lastMessageTime: new Date().toISOString(),
            isAiEnabled: true,
            isHumanTakeover: false,
            priority: 'normal' as const,
            tags: ['Messenger Webhook'],
            isResolved: false,
            createdAt: new Date().toISOString(),
          };
          (db as any).data.conversations.push(newConv);
          conv = newConv;
        }

        // Save incoming customer message
        const incomingMsg = db.addMessage({
          conversationId: conv.id,
          sender: 'customer',
          senderName: conv.customerName,
          text: message.text || (message.attachments ? '[Image Attachment]' : ''),
          attachments: message.attachments?.map((a: any) => ({
            type: a.type || 'image',
            url: a.payload?.url || '',
          })),
          status: 'read',
        });

        // Trigger AI reply if AI is enabled and not in human takeover
        if (conv.isAiEnabled && !conv.isHumanTakeover) {
          const aiConfig = db.getAiConfig(workspaceId);
          if (aiConfig.enableAutomation) {
            const products = db.getProducts(workspaceId);
            const knowledgeDocs = db.getKnowledgeDocs(workspaceId);
            const shippingSettings = db.getShippingSettings(workspaceId);
            const history = db.getMessages(conv.id);

            const aiReply = await generateSalesAgentReply({
              customerMessage: incomingMsg.text,
              conversationHistory: history,
              products,
              knowledgeDocs,
              shippingSettings,
              aiConfig,
              customerName: conv.customerName,
            });

            db.addMessage({
              conversationId: conv.id,
              sender: 'agent',
              senderName: aiConfig.agentName,
              text: aiReply.replyText,
              status: 'delivered',
              isAiGenerated: true,
              detectedIntent: aiReply.detectedIntent,
              citedSources: aiReply.citedSources,
              suggestedProducts: aiReply.suggestedProductIds,
            });

            if (aiReply.shouldEscalateToHuman) {
              db.updateConversation(conv.id, workspaceId, {
                isAiEnabled: false,
                isHumanTakeover: true,
                priority: 'urgent',
                tags: [...conv.tags, 'Escalated'],
              });
            }
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
    return;
  }

  res.sendStatus(404);
});

// Simulation Webhook route for demo testing & automated integration tests
webhookRouter.post('/simulate-incoming', async (req: Request, res: Response) => {
  try {
    const { workspaceId, customerName, customerPhone, messageText, imageUrl } = req.body;
    const wsId = workspaceId || 'ws-aura-dhaka-101';

    const pages = db.getFacebookPages(wsId);
    const page = pages[0] || { id: 'page-demo-01', pageName: 'Demo Store Page' };

    let conversations = db.getConversations(wsId);
    let conv = conversations.find(
      (c) => c.customerPhone === customerPhone || c.customerName === customerName
    );

    if (!conv) {
      const newConv = {
        id: `conv-sim-${Date.now()}`,
        workspaceId: wsId,
        facebookPageId: page.id,
        customerName: customerName || 'Shamim Rezwan',
        customerPhone: customerPhone || '01712998877',
        customerProfilePic:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        customerFacebookId: `fb_sim_${Date.now().toString().slice(-6)}`,
        unreadCount: 0,
        lastMessageSnippet: messageText || 'Sent photo',
        lastMessageTime: new Date().toISOString(),
        isAiEnabled: true,
        isHumanTakeover: false,
        priority: 'normal' as const,
        tags: ['Live Simulator'],
        isResolved: false,
        createdAt: new Date().toISOString(),
      };
      (db as any).data.conversations.unshift(newConv);
      conv = newConv;
    }

    // Add customer message
    const custMsg = db.addMessage({
      conversationId: conv.id,
      sender: 'customer',
      senderName: conv.customerName,
      text: messageText || 'I am interested in this item',
      attachments: imageUrl ? [{ type: 'image', url: imageUrl }] : undefined,
      status: 'delivered',
    });

    // Check automation
    const aiConfig = db.getAiConfig(wsId);
    let agentReply = null;

    if (conv.isAiEnabled && !conv.isHumanTakeover && aiConfig.enableAutomation) {
      const products = db.getProducts(wsId);
      const knowledgeDocs = db.getKnowledgeDocs(wsId);
      const shippingSettings = db.getShippingSettings(wsId);
      const history = db.getMessages(conv.id);

      const aiRes = await generateSalesAgentReply({
        customerMessage: custMsg.text,
        conversationHistory: history,
        products,
        knowledgeDocs,
        shippingSettings,
        aiConfig,
        customerName: conv.customerName,
      });

      agentReply = db.addMessage({
        conversationId: conv.id,
        sender: 'agent',
        senderName: aiConfig.agentName,
        text: aiRes.replyText,
        status: 'delivered',
        isAiGenerated: true,
        detectedIntent: aiRes.detectedIntent,
        citedSources: aiRes.citedSources,
        suggestedProducts: aiRes.suggestedProductIds,
      });

      // If order details ready to confirm
      if (aiRes.extractedOrderDetails?.isReadyToConfirm) {
        const topProd = products[0];
        const ord = db.createOrder({
          workspaceId: wsId,
          customerName: aiRes.extractedOrderDetails.customerName || conv.customerName,
          customerPhone: aiRes.extractedOrderDetails.customerPhone || conv.customerPhone || '01712998877',
          deliveryAddress: aiRes.extractedOrderDetails.deliveryAddress || 'Mirpur 12, Dhaka',
          deliveryCity: aiRes.extractedOrderDetails.deliveryCity || 'Inside Dhaka',
          items: [
            {
              id: `item-${Date.now()}`,
              productId: topProd.id,
              productName: topProd.name,
              sku: topProd.sku,
              variant: topProd.variants[0]?.sku || 'Default',
              quantity: aiRes.extractedOrderDetails.quantity || 1,
              unitPrice: topProd.salePrice || topProd.price,
              totalPrice: (topProd.salePrice || topProd.price) * (aiRes.extractedOrderDetails.quantity || 1),
              imageUrl: topProd.images[0],
            },
          ],
          subtotal: topProd.salePrice || topProd.price,
          deliveryFee: 70,
          discount: 0,
          total: (topProd.salePrice || topProd.price) + 70,
          advancePaymentRequired: false,
          advanceAmount: 0,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Pending Verification',
          orderStatus: 'Confirmed',
          statusHistory: [{ status: 'Confirmed', timestamp: new Date().toISOString(), note: 'AI captured customer order' }],
          conversationId: conv.id,
        });
      }
    }

    res.json({
      success: true,
      conversationId: conv.id,
      customerMessage: custMsg,
      agentReply,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Simulation error' });
  }
});
