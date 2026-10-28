import {
  Workspace,
  WorkspaceMember,
  FacebookPage,
  Product,
  Order,
  Customer,
  Conversation,
  Message,
  AiAgentConfig,
  ShippingSettings,
  KnowledgeDocument,
  AutomationRule,
  AuditLog,
  SubscriptionUsage,
} from '../types/index.ts';

let activeWorkspaceId = localStorage.getItem('ai_agent_active_ws') || 'ws-aura-dhaka-101';

export function setActiveWorkspaceId(id: string) {
  activeWorkspaceId = id;
  localStorage.setItem('ai_agent_active_ws', id);
}

export function getActiveWorkspaceId(): string {
  return activeWorkspaceId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('x-workspace-id', activeWorkspaceId);

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}: ${res.statusText}`;
    try {
      const json = await res.json();
      if (json.error) errorMsg = json.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  getAuthMe: () => request<{ user: any; currentWorkspace: Workspace; workspaces: Workspace[] }>('/api/auth/me'),
  login: (email: string) => request<{ success: boolean; user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
  register: (fullName: string, email: string, storeName: string) =>
    request<{ success: boolean; user: any; workspace: Workspace }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, storeName }),
    }),

  // Workspaces
  getWorkspaces: () => request<Workspace[]>('/api/workspaces'),
  createWorkspace: (name: string, currency: string = 'BDT') =>
    request<Workspace>('/api/workspaces', { method: 'POST', body: JSON.stringify({ name, currency }) }),
  getMembers: () => request<WorkspaceMember[]>('/api/workspaces/members'),
  inviteMember: (userEmail: string, userName: string, role: string) =>
    request<WorkspaceMember>('/api/workspaces/members', {
      method: 'POST',
      body: JSON.stringify({ userEmail, userName, role }),
    }),
  updateMemberRole: (id: string, role: string) =>
    request<WorkspaceMember>(`/api/workspaces/members/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  removeMember: (id: string) => request<{ success: boolean }>(`/api/workspaces/members/${id}`, { method: 'DELETE' }),

  // Facebook Pages
  getFacebookPages: () => request<FacebookPage[]>('/api/facebook-pages'),
  connectFacebookPage: (data: { pageName: string; pageId?: string; isDemoMode?: boolean }) =>
    request<FacebookPage>('/api/facebook-pages/connect', { method: 'POST', body: JSON.stringify(data) }),
  disconnectFacebookPage: (id: string) =>
    request<{ success: boolean }>(`/api/facebook-pages/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => request<Product[]>('/api/products'),
  getProduct: (id: string) => request<Product>(`/api/products/${id}`),
  createProduct: (product: Partial<Product>) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: string, product: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id: string) => request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),
  bulkImportProducts: (products: any[]) =>
    request<{ success: boolean; importedCount: number; created: Product[]; errors: any[] }>(
      '/api/products/bulk-import',
      { method: 'POST', body: JSON.stringify({ products }) }
    ),

  // Orders
  getOrders: () => request<Order[]>('/api/orders'),
  getOrder: (id: string) => request<Order>(`/api/orders/${id}`),
  createOrder: (order: Partial<Order>) => request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateOrderStatus: (
    id: string,
    orderStatus: Order['orderStatus'],
    note?: string,
    paymentStatus?: Order['paymentStatus']
  ) =>
    request<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus, note, paymentStatus }),
    }),

  // Customers
  getCustomers: () => request<Customer[]>('/api/customers'),

  // Conversations & Inbox
  getConversations: () => request<Conversation[]>('/api/conversations'),
  getConversation: (id: string) =>
    request<{ conversation: Conversation; messages: Message[] }>(`/api/conversations/${id}`),
  updateConversation: (id: string, updates: Partial<Conversation>) =>
    request<Conversation>(`/api/conversations/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  sendMessage: (
    conversationId: string,
    text: string,
    sender: 'human_moderator' | 'agent' | 'customer' = 'human_moderator',
    attachments?: any[]
  ) =>
    request<Message>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, sender, attachments }),
    }),
  suggestReply: (conversationId: string) =>
    request<any>(`/api/conversations/${conversationId}/suggest-reply`, { method: 'POST' }),

  // AI & Vision
  matchImage: (imageBase64: string, mimeType: string = 'image/jpeg', note?: string) =>
    request<{
      recognizedDescription: string;
      colorDetected: string;
      categoryDetected: string;
      matchedProducts: { product: Product; similarityScore: number; matchReason: string }[];
      suggestedReplyText: string;
    }>('/api/ai/match-image', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType, note }),
    }),

  // AI Configuration
  getAiConfig: () => request<AiAgentConfig>('/api/ai-config'),
  saveAiConfig: (config: Partial<AiAgentConfig>) =>
    request<AiAgentConfig>('/api/ai-config', { method: 'POST', body: JSON.stringify(config) }),

  // Shipping & Payment Settings
  getShippingSettings: () => request<ShippingSettings>('/api/settings/shipping'),
  saveShippingSettings: (settings: Partial<ShippingSettings>) =>
    request<ShippingSettings>('/api/settings/shipping', { method: 'POST', body: JSON.stringify(settings) }),

  // Knowledge Base
  getKnowledgeDocs: () => request<KnowledgeDocument[]>('/api/knowledge-docs'),
  createKnowledgeDoc: (doc: Partial<KnowledgeDocument>) =>
    request<KnowledgeDocument>('/api/knowledge-docs', { method: 'POST', body: JSON.stringify(doc) }),
  deleteKnowledgeDoc: (id: string) =>
    request<{ success: boolean }>(`/api/knowledge-docs/${id}`, { method: 'DELETE' }),

  // Automation Rules
  getAutomationRules: () => request<AutomationRule[]>('/api/automation-rules'),
  createAutomationRule: (rule: Partial<AutomationRule>) =>
    request<AutomationRule>('/api/automation-rules', { method: 'POST', body: JSON.stringify(rule) }),
  updateAutomationRule: (id: string, updates: Partial<AutomationRule>) =>
    request<AutomationRule>(`/api/automation-rules/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteAutomationRule: (id: string) =>
    request<{ success: boolean }>(`/api/automation-rules/${id}`, { method: 'DELETE' }),

  // Comments Automation
  getCommentsAutomation: () => request<any>('/api/comments-automation'),

  // Analytics
  getAnalytics: () => request<any>('/api/analytics'),

  // Subscription
  getSubscription: () => request<SubscriptionUsage>('/api/subscription'),
  upgradeSubscription: (plan: SubscriptionUsage['plan']) =>
    request<SubscriptionUsage>('/api/subscription/upgrade', { method: 'POST', body: JSON.stringify({ plan }) }),

  // Audit Logs
  getAuditLogs: () => request<AuditLog[]>('/api/audit-logs'),

  // System & Tests
  runAutomatedTests: () => request<any>('/api/system/run-tests'),
  resetDemo: () => request<{ success: boolean; message: string }>('/api/system/reset-demo', { method: 'POST' }),
  simulateWebhook: (data: { customerName?: string; customerPhone?: string; messageText: string; imageUrl?: string }) =>
    request<any>('/api/webhook/simulate-incoming', { method: 'POST', body: JSON.stringify(data) }),
};
