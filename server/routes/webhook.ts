import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { generateSalesAgentReply, SalesAgentResponse } from '../gemini.ts';
import { Conversation, Message, Order } from '../../src/types/index.ts';

export const webhookRouter = Router();

const DEFAULT_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'ai_sales_agent_verify_token_2026';
const APP_SECRET = process.env.FB_APP_SECRET || '';

// In-memory idempotency cache for deduplicating webhook retries
const processedMessageIds = new Set<string>();

/**
 * Shared Multi-Stage Conversational State Engine
 * Handles:
 * 1. Customer intent understanding
 * 2. Product matching & grounded price check
 * 3. Draft order creation in "Awaiting Confirmation"
 * 4. Explicit customer confirmation before "Confirmed"
 * 5. Payment TrxID claim marked as "Unverified Claim" (pending staff verification)
 * 6. Automatic human takeover escalation
 */
export async function processCustomerMessageWorkflow(params: {
  workspaceId: string;
  conv: Conversation;
  customerMessageText: string;
}): Promise<{
  agentMessage: Message;
  aiResponse: SalesAgentResponse;
  updatedOrder?: Order;
}> {
  const { workspaceId, conv, customerMessageText } = params;
  const products = db.getProducts(workspaceId);
  const knowledgeDocs = db.getKnowledgeDocs(workspaceId);
  const shippingSettings = db.getShippingSettings(workspaceId);
  const aiConfig = db.getAiConfig(workspaceId);
  const history = db.getMessages(conv.id);

  // If human moderator has taken over or AI is disabled for this conversation, pause AI auto-replies
  if (conv.isHumanTakeover || !conv.isAiEnabled) {
    const pauseMessage: Message = {
      id: `msg-paused-${Date.now()}`,
      conversationId: conv.id,
      sender: 'system',
      senderName: 'System',
      text: 'Human moderator is assigned to this conversation. AI automated reply is paused.',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      isAiGenerated: false,
    };
    return {
      agentMessage: pauseMessage,
      aiResponse: {
        replyText: 'AI paused due to human moderator takeover.',
        detectedIntent: 'human_takeover_active',
        suggestedProductIds: [],
        confidence: 1.0,
        citedSources: [],
        shouldEscalateToHuman: true,
      },
      updatedOrder: undefined,
    };
  }

  // Call Gemini AI
  const aiResponse = await generateSalesAgentReply({
    customerMessage: customerMessageText,
    conversationHistory: history,
    products,
    knowledgeDocs,
    shippingSettings,
    aiConfig,
    customerName: conv.customerName,
  });

  let updatedOrder: Order | undefined = undefined;

  // 1. Stage: Customer provided order details (name, phone, address) -> Create DRAFT order awaiting confirmation
  if (aiResponse.detectedIntent === 'order_details_provided' && aiResponse.extractedOrderDetails) {
    const details = aiResponse.extractedOrderDetails;
    const topProd = products.find((p) => p.id === details.productId) || products[0];
    const deliveryCity = details.deliveryCity || 'Inside Dhaka';
    const deliveryFee =
      deliveryCity === 'Inside Dhaka'
        ? shippingSettings.insideDhakaFee
        : deliveryCity === 'Dhaka Suburbs'
        ? shippingSettings.dhakaSuburbsFee
        : shippingSettings.outsideDhakaFee;

    const unitPrice = topProd ? (topProd.salePrice || topProd.price) : 2350;
    const qty = details.quantity || 1;
    const subtotal = unitPrice * qty;
    const total = subtotal + deliveryFee;
    const advanceRequired = deliveryCity === 'Outside Dhaka' && shippingSettings.requireAdvanceForCodOutsideDhaka;

    // Check if an order is already awaiting confirmation for this conversation
    const existingOrders = db.getOrders(workspaceId);
    let pendingOrder = existingOrders.find(
      (o) => o.conversationId === conv.id && (o.orderStatus === 'Awaiting Confirmation' || o.orderStatus === 'Draft')
    );

    if (pendingOrder) {
      pendingOrder.customerName = details.customerName || conv.customerName;
      pendingOrder.customerPhone = details.customerPhone || conv.customerPhone || '01712998877';
      pendingOrder.deliveryAddress = details.deliveryAddress || pendingOrder.deliveryAddress;
      pendingOrder.deliveryCity = deliveryCity;
      pendingOrder.subtotal = subtotal;
      pendingOrder.deliveryFee = deliveryFee;
      pendingOrder.total = total;
      pendingOrder.advancePaymentRequired = advanceRequired;
      pendingOrder.advanceAmount = advanceRequired ? shippingSettings.advanceAmount : 0;
      pendingOrder.updatedAt = new Date().toISOString();
      updatedOrder = pendingOrder;
    } else {
      updatedOrder = db.createOrder({
        workspaceId,
        customerName: details.customerName || conv.customerName,
        customerPhone: details.customerPhone || conv.customerPhone || '01712998877',
        deliveryAddress: details.deliveryAddress || 'Uttara, Dhaka',
        deliveryCity,
        items: [
          {
            id: `item-${Date.now()}`,
            productId: topProd?.id || 'prod-01',
            productName: topProd?.name || 'Royal Heritage Semi-Fitted Silk Panjabi',
            sku: details.variantSku || topProd?.variants[0]?.sku || 'AT-P-NV-L',
            variant: details.variantSku || 'Navy Blue / L (42)',
            quantity: qty,
            unitPrice,
            totalPrice: subtotal,
            imageUrl: topProd?.images[0],
          },
        ],
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        advancePaymentRequired: advanceRequired,
        advanceAmount: advanceRequired ? shippingSettings.advanceAmount : 0,
        paymentMethod: details.paymentMethod || 'Cash on Delivery',
        paymentStatus: 'Pending Verification',
        orderStatus: 'Awaiting Confirmation', // Explicitly awaiting customer confirmation
        statusHistory: [
          {
            status: 'Awaiting Confirmation',
            timestamp: new Date().toISOString(),
            note: 'AI captured delivery address; awaiting customer confirmation',
          },
        ],
        conversationId: conv.id,
      });
    }

    conv.currentDraftOrderId = updatedOrder.id;
    if (details.customerPhone) conv.customerPhone = details.customerPhone;
    if (details.customerName) conv.customerName = details.customerName;
  }

  // 2. Stage: Customer explicitly confirmed order ("Confirm" / "ঠিক আছে")
  else if (aiResponse.detectedIntent === 'order_confirmation') {
    const orders = db.getOrders(workspaceId);
    let pendingOrder = orders.find(
      (o) =>
        (conv.currentDraftOrderId && o.id === conv.currentDraftOrderId) ||
        (o.conversationId === conv.id && (o.orderStatus === 'Awaiting Confirmation' || o.orderStatus === 'Draft'))
    );

    if (pendingOrder) {
      updatedOrder = db.updateOrderStatus(
        pendingOrder.id,
        workspaceId,
        'Confirmed',
        'Customer explicitly confirmed order summary via Messenger',
        pendingOrder.paymentStatus
      );
    }
  }

  // 3. Stage: Customer provided payment claim (bKash/Nagad TrxID) -> Keep as "Unverified Claim"
  else if (aiResponse.detectedIntent === 'payment_claim' && aiResponse.extractedOrderDetails?.paymentTrxId) {
    const trxId = aiResponse.extractedOrderDetails.paymentTrxId;
    const orders = db.getOrders(workspaceId);
    let targetOrder = orders.find((o) => o.conversationId === conv.id) || orders[0];

    if (targetOrder) {
      targetOrder.paymentTrxId = trxId;
      targetOrder.paymentStatus = 'Unverified Claim'; // Never verified automatically
      targetOrder.statusHistory.push({
        status: targetOrder.orderStatus,
        timestamp: new Date().toISOString(),
        note: `Customer reported TrxID: ${trxId} (Pending staff ledger verification)`,
        updatedBy: 'AI Sales Agent',
      });
      updatedOrder = targetOrder;
    }
  }

  // 4. Record the agent reply message
  const agentMessage = db.addMessage({
    conversationId: conv.id,
    sender: 'agent',
    senderName: aiConfig.agentName,
    text: aiResponse.replyText,
    status: 'delivered',
    isAiGenerated: true,
    detectedIntent: aiResponse.detectedIntent,
    citedSources: aiResponse.citedSources,
    suggestedProducts: aiResponse.suggestedProductIds,
  });

  // 5. Check if human takeover triggered
  if (aiResponse.shouldEscalateToHuman) {
    db.updateConversation(conv.id, workspaceId, {
      isAiEnabled: false,
      isHumanTakeover: true,
      priority: 'urgent',
      tags: Array.from(new Set([...conv.tags, 'Escalated', 'Human Needed'])),
    });
  }

  return { agentMessage, aiResponse, updatedOrder };
}

// Meta Webhook Verification (GET)
webhookRouter.get('/facebook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === DEFAULT_VERIFY_TOKEN) {
    console.log('[Meta Webhook] Successfully verified webhook challenge token!');
    res.status(200).send(challenge);
    return;
  }

  console.warn('[Meta Webhook] Verification token mismatch or missing query');
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
      console.warn('[Meta Webhook] Invalid HMAC signature rejected');
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
        const message = event.message;

        if (!message || !senderId) continue;

        // Idempotency check: Skip duplicate delivery
        if (message.mid && processedMessageIds.has(message.mid)) {
          console.log(`[Meta Webhook] Duplicate message ${message.mid} skipped via idempotency check.`);
          continue;
        }
        if (message.mid) {
          processedMessageIds.add(message.mid);
          if (processedMessageIds.size > 2000) {
            const first = processedMessageIds.values().next().value;
            if (first) processedMessageIds.delete(first);
          }
        }

        // Multi-tenant lookup: Match across all registered Facebook Pages
        const allPages = (db as any).data.facebookPages as any[];
        const matchedPage = allPages.find((p) => p.pageId === pageId || p.isDemoMode) || allPages[0];

        if (!matchedPage) continue;
        const workspaceId = matchedPage.workspaceId;

        // Find or create conversation
        let conversations = db.getConversations(workspaceId);
        let conv = conversations.find(
          (c) => c.customerFacebookId === senderId && c.facebookPageId === matchedPage.id
        );

        if (!conv) {
          const newConv: Conversation = {
            id: `conv-${Date.now()}`,
            workspaceId,
            facebookPageId: matchedPage.id,
            customerName: `Messenger Buyer #${senderId.slice(-4)}`,
            customerProfilePic:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            customerFacebookId: senderId,
            unreadCount: 1,
            lastMessageSnippet: message.text || '[Attachment]',
            lastMessageTime: new Date().toISOString(),
            isAiEnabled: true,
            isHumanTakeover: false,
            priority: 'normal',
            tags: ['Meta Messenger'],
            isResolved: false,
            createdAt: new Date().toISOString(),
          };
          (db as any).data.conversations.unshift(newConv);
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

        // Trigger shared workflow if AI is enabled and not in human takeover
        if (conv.isAiEnabled && !conv.isHumanTakeover) {
          const aiConfig = db.getAiConfig(workspaceId);
          if (aiConfig.enableAutomation) {
            await processCustomerMessageWorkflow({
              workspaceId,
              conv,
              customerMessageText: incomingMsg.text,
            });
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
    return;
  }

  res.sendStatus(404);
});

// Simulation Webhook route for demo testing, developer testing & UI Simulator
webhookRouter.post('/simulate-incoming', async (req: Request, res: Response) => {
  try {
    const { workspaceId, customerName, customerPhone, messageText, imageUrl } = req.body;
    const wsId = workspaceId || 'ws-aura-dhaka-101';

    const pages = db.getFacebookPages(wsId);
    const page = pages[0] || { id: 'page-demo-01', pageName: 'Demo Store Page' };

    let conversations = db.getConversations(wsId);
    let conv = conversations.find(
      (c) =>
        (customerPhone && c.customerPhone === customerPhone) ||
        (customerName && c.customerName === customerName)
    );

    if (!conv) {
      const newConv: Conversation = {
        id: `conv-sim-${Date.now()}`,
        workspaceId: wsId,
        facebookPageId: page.id,
        customerName: customerName || 'Shuvo Chowdhury',
        customerPhone: customerPhone || '01712998877',
        customerProfilePic:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        customerFacebookId: `fb_sim_${Date.now().toString().slice(-6)}`,
        unreadCount: 0,
        lastMessageSnippet: messageText || 'Sent photo',
        lastMessageTime: new Date().toISOString(),
        isAiEnabled: true,
        isHumanTakeover: false,
        priority: 'normal',
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

    let agentReply = null;
    let orderResult = undefined;

    // Check automation
    const aiConfig = db.getAiConfig(wsId);
    if (conv.isAiEnabled && !conv.isHumanTakeover && aiConfig.enableAutomation) {
      const outcome = await processCustomerMessageWorkflow({
        workspaceId: wsId,
        conv,
        customerMessageText: custMsg.text,
      });
      agentReply = outcome.agentMessage;
      orderResult = outcome.updatedOrder;
    }

    res.json({
      success: true,
      conversationId: conv.id,
      customerMessage: custMsg,
      agentReply,
      order: orderResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Simulation error' });
  }
});
