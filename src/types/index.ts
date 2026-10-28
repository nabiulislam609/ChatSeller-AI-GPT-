// Comprehensive Types for AI Sales Agent Multi-Tenant SaaS Platform

export type Role = 'Owner' | 'Admin' | 'Moderator' | 'Viewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: 'Free Trial' | 'Starter' | 'Growth' | 'Pro';
  currency: string; // "BDT"
  currencySymbol: string; // "৳"
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: Role;
  joinedAt: string;
}

export interface FacebookPage {
  id: string;
  workspaceId: string;
  pageId: string;
  pageName: string;
  category: string;
  fanCount: number;
  accessTokenMasked: string;
  connectionStatus: 'connected' | 'disconnected' | 'permission_expired' | 'rate_limited';
  isDemoMode: boolean;
  webhookSubscribed: boolean;
  lastSyncAt: string;
  avatarUrl?: string;
}

export interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  workspaceId: string;
  sku: string;
  name: string;
  nameBn?: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  variants: ProductVariant[];
  stockQuantity: number;
  shippingEligible: boolean;
  faqs?: { question: string; answer: string }[];
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Draft'
  | 'Awaiting Confirmation'
  | 'Confirmed'
  | 'Awaiting Payment'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentMethod = 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Bank Transfer';

export type PaymentStatus =
  | 'Unverified Claim'
  | 'Pending Verification'
  | 'Verified'
  | 'Paid'
  | 'Refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-8942"
  workspaceId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: 'Inside Dhaka' | 'Dhaka Suburbs' | 'Outside Dhaka';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  advancePaymentRequired: boolean;
  advanceAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTrxId?: string;
  paymentSenderNumber?: string;
  orderStatus: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string; updatedBy?: string }[];
  conversationId?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  workspaceId: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  facebookId?: string;
  totalOrders: number;
  totalSpent: number;
  tags: string[]; // e.g. "VIP", "Frequent Buyer", "COD Confirmed"
  notes?: string;
  lastActiveAt: string;
}

export interface MessageAttachment {
  type: 'image' | 'audio' | 'file';
  url: string;
  name?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent' | 'human_moderator' | 'system';
  senderName: string;
  text: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isAiGenerated?: boolean;
  detectedIntent?: string;
  citedSources?: string[];
  suggestedProducts?: string[]; // Product IDs
}

export interface Conversation {
  id: string;
  workspaceId: string;
  facebookPageId: string;
  customerName: string;
  customerProfilePic?: string;
  customerFacebookId: string;
  customerPhone?: string;
  unreadCount: number;
  lastMessageSnippet: string;
  lastMessageTime: string;
  isAiEnabled: boolean;
  isHumanTakeover: boolean;
  assignedModeratorId?: string;
  assignedModeratorName?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  draftReply?: string;
  currentDraftOrderId?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface AiAgentConfig {
  workspaceId: string;
  agentName: string;
  personality: string;
  businessName: string;
  businessDescription: string;
  preferredLanguage: 'auto' | 'bn' | 'en';
  communicationTone: 'friendly' | 'formal' | 'concise';
  businessHoursStart: string; // "09:00"
  businessHoursEnd: string; // "22:00"
  outOfHoursMessage: string;
  outOfHoursAutoReply: boolean;
  recommendationBehavior: 'aggressive' | 'balanced' | 'conservative';
  confidenceThreshold: number; // 0.0 to 1.0
  humanHandoffTriggers: string[];
  enableAutomation: boolean;
  shippingPolicy: string;
  returnPolicy: string;
  paymentPolicy: string;
  customInstructions: string;
  prohibitedClaims: string[];
}

export interface ShippingSettings {
  workspaceId: string;
  insideDhakaFee: number;
  insideDhakaDeliveryDays: string;
  dhakaSuburbsFee: number;
  outsideDhakaFee: number;
  outsideDhakaDeliveryDays: string;
  freeShippingThreshold: number;
  requireAdvanceForCodOutsideDhaka: boolean;
  advanceAmount: number;
  bkashMerchantNumber: string;
  bkashType: 'Merchant' | 'Personal' | 'Agent';
  nagadMerchantNumber: string;
  nagadType: 'Merchant' | 'Personal';
  bankDetails: string;
}

export interface KnowledgeDocument {
  id: string;
  workspaceId: string;
  title: string;
  category: 'policy' | 'faq' | 'product_guide' | 'company_info';
  content: string;
  keywords: string[];
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  workspaceId: string;
  name: string;
  trigger:
    | 'messenger_message'
    | 'price_inquiry'
    | 'stock_inquiry'
    | 'order_intent'
    | 'image_received'
    | 'comment_received'
    | 'outside_hours';
  conditions: { field: string; operator: 'contains' | 'equals' | 'greater_than'; value: string }[];
  action:
    | 'ai_reply'
    | 'send_template'
    | 'recommend_product'
    | 'create_draft_order'
    | 'escalate_human'
    | 'add_tag';
  actionPayload?: string;
  enabled: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SubscriptionUsage {
  workspaceId: string;
  plan: 'Free Trial' | 'Starter' | 'Growth' | 'Pro';
  monthlyMessageLimit: number;
  messagesUsedThisMonth: number;
  aiRepliesUsed: number;
  activePagesLimit: number;
  activePagesCount: number;
  currentPeriodEnd: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
}
