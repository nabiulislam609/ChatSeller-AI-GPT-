import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { generateSalesAgentReply, matchProductFromImage } from '../gemini.ts';
import { runAutomatedTests } from '../tests.ts';

export const apiRouter = Router();

// Middleware helper to get active workspace ID
function getWorkspaceId(req: Request): string {
  return (req.headers['x-workspace-id'] as string) || (req.query.workspaceId as string) || 'ws-aura-dhaka-101';
}

// ---------------- AUTH & SESSIONS ----------------
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = (db as any).data.users[0]; // Active authenticated user
  const workspaces = db.getWorkspaces(user.id);
  const currentWorkspace = db.getWorkspaceById(wsId) || workspaces[0];
  const members = db.getWorkspaceMembers(currentWorkspace.id);
  const userMembership = members.find((m) => m.userId === user.id);

  res.json({
    user: {
      ...user,
      role: userMembership?.role || user.role,
    },
    currentWorkspace,
    workspaces,
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const user = (db as any).data.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || {
    id: `usr-${Date.now()}`,
    email,
    fullName: email.split('@')[0],
    role: 'Admin',
    createdAt: new Date().toISOString(),
  };
  res.json({ success: true, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { fullName, email, storeName } = req.body;
  if (!email || !fullName) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    fullName,
    role: 'Owner' as const,
    createdAt: new Date().toISOString(),
  };
  (db as any).data.users.push(newUser);

  const newWs = db.createWorkspace({
    name: storeName || `${fullName}'s Store`,
    slug: (storeName || fullName).toLowerCase().replace(/[^a-z0-9]/g, '-'),
    ownerId: newUser.id,
    plan: 'Starter',
    currency: 'BDT',
    currencySymbol: '৳',
  });

  res.json({ success: true, user: newUser, workspace: newWs });
});

// ---------------- WORKSPACES ----------------
apiRouter.get('/workspaces', (req: Request, res: Response) => {
  res.json(db.getWorkspaces());
});

apiRouter.post('/workspaces', (req: Request, res: Response) => {
  const { name, currency } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Workspace name is required' });
    return;
  }
  const ws = db.createWorkspace({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    ownerId: 'usr-admin-01',
    plan: 'Starter',
    currency: currency || 'BDT',
    currencySymbol: '৳',
  });
  db.addAuditLog({
    workspaceId: ws.id,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'WORKSPACE_CREATED',
    details: `Created workspace "${ws.name}"`,
  });
  res.json(ws);
});

apiRouter.get('/workspaces/members', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getWorkspaceMembers(wsId));
});

apiRouter.post('/workspaces/members', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { userEmail, userName, role } = req.body;
  if (!userEmail) {
    res.status(400).json({ error: 'Email required' });
    return;
  }
  const member = db.addWorkspaceMember({
    workspaceId: wsId,
    userId: `usr-inv-${Date.now()}`,
    userEmail,
    userName: userName || userEmail.split('@')[0],
    role: role || 'Moderator',
  });
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'MEMBER_INVITED',
    details: `Invited ${userEmail} as ${role}`,
  });
  res.json(member);
});

apiRouter.patch('/workspaces/members/:id/role', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { role } = req.body;
  const updated = db.updateWorkspaceMemberRole(req.params.id, role);
  res.json(updated);
});

apiRouter.delete('/workspaces/members/:id', (req: Request, res: Response) => {
  db.removeWorkspaceMember(req.params.id);
  res.json({ success: true });
});

// ---------------- FACEBOOK PAGES ----------------
apiRouter.get('/facebook-pages', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getFacebookPages(wsId));
});

apiRouter.post('/facebook-pages/connect', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { pageName, pageId, isDemoMode } = req.body;

  const newPage = db.connectFacebookPage({
    workspaceId: wsId,
    pageId: pageId || `${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
    pageName: pageName || 'New Facebook Store Page',
    category: 'E-commerce Brand',
    fanCount: Math.floor(5000 + Math.random() * 25000),
    accessTokenMasked: 'EAAX7...MASKED_SECRET',
    connectionStatus: 'connected',
    isDemoMode: Boolean(isDemoMode ?? true),
    webhookSubscribed: true,
    avatarUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
  });

  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'PAGE_CONNECTED',
    details: `Connected page ${newPage.pageName} (${newPage.isDemoMode ? 'Demo Mode' : 'Live Meta OAuth'})`,
  });

  res.json(newPage);
});

apiRouter.delete('/facebook-pages/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  db.disconnectFacebookPage(req.params.id, wsId);
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'PAGE_DISCONNECTED',
    details: `Disconnected page ID ${req.params.id} and revoked stored credentials.`,
  });
  res.json({ success: true });
});

// ---------------- PRODUCTS ----------------
apiRouter.get('/products', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getProducts(wsId));
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const prod = db.getProductById(req.params.id, wsId);
  if (!prod) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(prod);
});

apiRouter.post('/products', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const product = db.createProduct({
    ...req.body,
    workspaceId: wsId,
  });
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'PRODUCT_CREATED',
    details: `Created product: ${product.name} (SKU: ${product.sku})`,
  });
  res.json(product);
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const updated = db.updateProduct(req.params.id, wsId, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'PRODUCT_UPDATED',
    details: `Updated product: ${updated.name}`,
  });
  res.json(updated);
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const success = db.deleteProduct(req.params.id, wsId);
  if (success) {
    db.addAuditLog({
      workspaceId: wsId,
      userId: 'usr-admin-01',
      userName: 'Nabin Hasan',
      action: 'PRODUCT_DELETED',
      details: `Deleted product ID ${req.params.id}`,
    });
  }
  res.json({ success });
});

// Bulk Import Products CSV / JSON with duplicate check and validation
apiRouter.post('/products/bulk-import', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { products: rawProducts } = req.body;

  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    res.status(400).json({ error: 'No products provided for import' });
    return;
  }

  const existingProducts = db.getProducts(wsId);
  const existingSkus = new Set(existingProducts.map((p) => p.sku.toUpperCase()));

  const created: any[] = [];
  const errors: { row: number; sku: string; error: string }[] = [];

  rawProducts.forEach((item, index) => {
    const sku = (item.sku || '').trim().toUpperCase();
    if (!sku) {
      errors.push({ row: index + 1, sku: 'N/A', error: 'SKU is required' });
      return;
    }
    if (existingSkus.has(sku)) {
      errors.push({ row: index + 1, sku, error: `Duplicate SKU: ${sku} already exists in catalog` });
      return;
    }
    if (!item.name) {
      errors.push({ row: index + 1, sku, error: 'Product name is required' });
      return;
    }

    const price = Number(item.price) || 0;
    if (price <= 0) {
      errors.push({ row: index + 1, sku, error: 'Price must be greater than 0' });
      return;
    }

    existingSkus.add(sku);

    const newProd = db.createProduct({
      workspaceId: wsId,
      sku,
      name: item.name,
      nameBn: item.nameBn || item.name,
      description: item.description || '',
      category: item.category || 'General',
      price,
      salePrice: item.salePrice ? Number(item.salePrice) : undefined,
      images: Array.isArray(item.images) ? item.images : (item.images ? [item.images] : ['https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80']),
      colors: Array.isArray(item.colors) ? item.colors : (item.colors ? item.colors.split(',') : ['Default']),
      sizes: Array.isArray(item.sizes) ? item.sizes : (item.sizes ? item.sizes.split(',') : ['Standard']),
      variants: item.variants || [
        { id: `v-${Date.now()}-${index}`, sku: `${sku}-STD`, price, stock: Number(item.stockQuantity) || 10 },
      ],
      stockQuantity: Number(item.stockQuantity) || 10,
      shippingEligible: true,
      status: 'active',
    });
    created.push(newProd);
  });

  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'PRODUCTS_IMPORTED',
    details: `Imported ${created.length} products, ${errors.length} skipped with errors.`,
  });

  res.json({
    success: true,
    importedCount: created.length,
    created,
    errors,
  });
});

// ---------------- ORDERS ----------------
apiRouter.get('/orders', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getOrders(wsId));
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const order = db.getOrderById(req.params.id, wsId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const order = db.createOrder({
    ...req.body,
    workspaceId: wsId,
  });
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'ORDER_CREATED',
    details: `Created order #${order.orderNumber} for ${order.customerName} (৳${order.total})`,
  });
  res.json(order);
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { orderStatus, note, paymentStatus } = req.body;
  const updated = db.updateOrderStatus(req.params.id, wsId, orderStatus, note, paymentStatus);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'ORDER_STATUS_CHANGED',
    details: `Order #${updated.orderNumber} changed to ${orderStatus} (Payment: ${updated.paymentStatus})`,
  });
  res.json(updated);
});

// ---------------- CUSTOMERS ----------------
apiRouter.get('/customers', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getCustomers(wsId));
});

// ---------------- CONVERSATIONS & INBOX ----------------
apiRouter.get('/conversations', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getConversations(wsId));
});

apiRouter.get('/conversations/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const conv = db.getConversationById(req.params.id, wsId);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }
  const messages = db.getMessages(conv.id);
  res.json({ conversation: conv, messages });
});

apiRouter.patch('/conversations/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const updated = db.updateConversation(req.params.id, wsId, req.body);
  res.json(updated);
});

apiRouter.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { text, sender, attachments } = req.body;
  const conv = db.getConversationById(req.params.id, wsId);

  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  const senderType = sender || 'human_moderator';
  const newMsg = db.addMessage({
    conversationId: conv.id,
    sender: senderType,
    senderName: senderType === 'human_moderator' ? 'Tahmina Akter (Moderator)' : 'Agent',
    text,
    attachments,
    status: 'delivered',
  });

  res.json(newMsg);
});

// Generate AI suggestion draft for a conversation
apiRouter.post('/conversations/:id/suggest-reply', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const conv = db.getConversationById(req.params.id, wsId);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  const products = db.getProducts(wsId);
  const knowledgeDocs = db.getKnowledgeDocs(wsId);
  const shippingSettings = db.getShippingSettings(wsId);
  const aiConfig = db.getAiConfig(wsId);
  const history = db.getMessages(conv.id);
  const lastCustomerMsg = [...history].reverse().find((m) => m.sender === 'customer');

  const reply = await generateSalesAgentReply({
    customerMessage: lastCustomerMsg?.text || 'Hello, I want to know more about your items',
    conversationHistory: history,
    products,
    knowledgeDocs,
    shippingSettings,
    aiConfig,
    customerName: conv.customerName,
  });

  res.json(reply);
});

// ---------------- AI IMAGE RECOGNITION ----------------
apiRouter.post('/ai/match-image', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { imageBase64, mimeType, note } = req.body;

  if (!imageBase64) {
    res.status(400).json({ error: 'Image base64 data is required' });
    return;
  }

  const products = db.getProducts(wsId);
  const result = await matchProductFromImage({
    imageBase64,
    mimeType: mimeType || 'image/jpeg',
    products,
    customerNote: note,
  });

  res.json(result);
});

// ---------------- AI AGENT CONFIG ----------------
apiRouter.get('/ai-config', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getAiConfig(wsId));
});

apiRouter.post('/ai-config', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const updated = db.saveAiConfig(wsId, req.body);
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'AI_CONFIG_UPDATED',
    details: 'Updated AI agent tone, business hours, and knowledge policies.',
  });
  res.json(updated);
});

// ---------------- SHIPPING & PAYMENTS ----------------
apiRouter.get('/settings/shipping', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getShippingSettings(wsId));
});

apiRouter.post('/settings/shipping', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const updated = db.saveShippingSettings(wsId, req.body);
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'SHIPPING_RULES_UPDATED',
    details: `Updated delivery fees (Inside: ৳${updated.insideDhakaFee}, Outside: ৳${updated.outsideDhakaFee})`,
  });
  res.json(updated);
});

// ---------------- KNOWLEDGE BASE & FAQ ----------------
apiRouter.get('/knowledge-docs', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getKnowledgeDocs(wsId));
});

apiRouter.post('/knowledge-docs', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const doc = db.createKnowledgeDoc({
    ...req.body,
    workspaceId: wsId,
  });
  res.json(doc);
});

apiRouter.delete('/knowledge-docs/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const success = db.deleteKnowledgeDoc(req.params.id, wsId);
  res.json({ success });
});

// ---------------- AUTOMATION RULES ----------------
apiRouter.get('/automation-rules', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getAutomationRules(wsId));
});

apiRouter.post('/automation-rules', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const rule = db.createAutomationRule({
    ...req.body,
    workspaceId: wsId,
  });
  res.json(rule);
});

apiRouter.patch('/automation-rules/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const updated = db.updateAutomationRule(req.params.id, wsId, req.body);
  res.json(updated);
});

apiRouter.delete('/automation-rules/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const success = db.deleteAutomationRule(req.params.id, wsId);
  res.json({ success });
});

// ---------------- COMMENTS AUTOMATION ----------------
apiRouter.get('/comments-automation', (req: Request, res: Response) => {
  // Pre-configured public comment automation presets compliant with Meta policies
  res.json({
    complianceNote: 'Meta Graph API Policy: Public comments can trigger 1 public reply + 1 private Messenger DM only if customer leaves a top-level post comment within 7 days.',
    rules: [
      {
        id: 'comm-1',
        name: 'Auto-reply to "Price koto?" on Facebook Page Posts',
        keyword: 'price, koto, dam, দাম',
        publicReply: 'Inbox check korun please! Details and special offer pathano hoyeche.',
        privateDmAction: 'Send product catalog link with direct discount code',
        enabled: true,
        stats: { commentsProcessed: 1420, privateDmsSent: 1290 },
      },
      {
        id: 'comm-2',
        name: 'Auto-reply to "Size available?" comments',
        keyword: 'size, available, ache, স্টক',
        publicReply: 'জি! আমাদের রেডি স্টক আছে। বিস্তারিত দেখতে ইনবক্স চেক করুন দয়া করে।',
        privateDmAction: 'Send size chart and variant stock list',
        enabled: true,
        stats: { commentsProcessed: 890, privateDmsSent: 840 },
      },
    ],
  });
});

// ---------------- AUDIT LOGS ----------------
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getAuditLogs(wsId));
});

// ---------------- SUBSCRIPTION & USAGE ----------------
apiRouter.get('/subscription', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  res.json(db.getSubscription(wsId));
});

apiRouter.post('/subscription/upgrade', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { plan } = req.body;
  const sub = db.updateSubscriptionPlan(wsId, plan);
  db.addAuditLog({
    workspaceId: wsId,
    userId: 'usr-admin-01',
    userName: 'Nabin Hasan',
    action: 'SUBSCRIPTION_CHANGED',
    details: `Updated subscription plan to ${plan}`,
  });
  res.json(sub);
});

// ---------------- ANALYTICS ----------------
apiRouter.get('/analytics', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const orders = db.getOrders(wsId);
  const conversations = db.getConversations(wsId);
  const messages = (db as any).data.messages;
  const sub = db.getSubscription(wsId);

  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const confirmedOrders = orders.filter(
    (o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing' || o.orderStatus === 'Shipped' || o.orderStatus === 'Delivered'
  ).length;

  const totalConversations = conversations.length;
  const aiHandled = conversations.filter((c) => c.isAiEnabled && !c.isHumanTakeover).length;
  const humanHandled = conversations.filter((c) => c.isHumanTakeover).length;
  const conversionRate = totalConversations > 0 ? ((confirmedOrders / totalConversations) * 100).toFixed(1) : '0';

  res.json({
    totalRevenue,
    ordersCount: orders.length,
    confirmedOrders,
    conversionRate: Number(conversionRate),
    totalConversations,
    aiHandled,
    humanHandled,
    avgResponseTimeSeconds: 1.4,
    escalationRatePercent: totalConversations > 0 ? ((humanHandled / totalConversations) * 100).toFixed(1) : 0,
    messagesUsedThisMonth: sub.messagesUsedThisMonth,
    monthlyLimit: sub.monthlyMessageLimit,
    aiRepliesUsed: sub.aiRepliesUsed,
    recentSales: orders.slice(0, 5),
    topInquiredCategories: [
      { category: 'Panjabi', inquiries: 64, orders: 38 },
      { category: 'Saree', inquiries: 49, orders: 27 },
      { category: 'Kurti', inquiries: 31, orders: 19 },
      { category: 'Polo & Casuals', inquiries: 24, orders: 15 },
    ],
  });
});

// ---------------- SYSTEM / RESET DEMO ----------------
apiRouter.post('/system/reset-demo', (req: Request, res: Response) => {
  db.resetToDemo();
  res.json({ success: true, message: 'Platform demo data successfully restored.' });
});

apiRouter.get('/system/run-tests', async (req: Request, res: Response) => {
  const results = await runAutomatedTests();
  res.json(results);
});
