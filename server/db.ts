import fs from 'fs';
import path from 'path';
import {
  User,
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
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  facebookPages: FacebookPage[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  conversations: Conversation[];
  messages: Message[];
  aiConfigs: Record<string, AiAgentConfig>;
  shippingSettings: Record<string, ShippingSettings>;
  knowledgeDocs: KnowledgeDocument[];
  automationRules: AutomationRule[];
  auditLogs: AuditLog[];
  subscriptions: Record<string, SubscriptionUsage>;
}

function getInitialData(): DatabaseSchema {
  const defaultWorkspaceId = 'ws-aura-dhaka-101';
  const defaultUserId = 'usr-admin-01';

  return {
    users: [
      {
        id: defaultUserId,
        email: 'nabin.llcg@gmail.com',
        fullName: 'Nabin Hasan',
        role: 'Owner',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'usr-mod-02',
        email: 'tahmina.sales@auratrends.com',
        fullName: 'Tahmina Akter',
        role: 'Moderator',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        createdAt: '2026-02-01T11:00:00Z',
      },
    ],
    workspaces: [
      {
        id: defaultWorkspaceId,
        name: 'Aura Trends Dhaka',
        slug: 'aura-trends-dhaka',
        ownerId: defaultUserId,
        plan: 'Growth',
        currency: 'BDT',
        currencySymbol: '৳',
        createdAt: '2026-01-15T10:00:00Z',
      },
    ],
    workspaceMembers: [
      {
        id: 'wm-1',
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        userEmail: 'nabin.llcg@gmail.com',
        userName: 'Nabin Hasan',
        role: 'Owner',
        joinedAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'wm-2',
        workspaceId: defaultWorkspaceId,
        userId: 'usr-mod-02',
        userEmail: 'tahmina.sales@auratrends.com',
        userName: 'Tahmina Akter',
        role: 'Moderator',
        joinedAt: '2026-02-01T11:00:00Z',
      },
    ],
    facebookPages: [
      {
        id: 'page-aura-01',
        workspaceId: defaultWorkspaceId,
        pageId: '109283748291029',
        pageName: 'Aura Trends Dhaka - Official',
        category: 'Clothing (Brand)',
        fanCount: 48500,
        accessTokenMasked: 'EAAX7...89Z1P',
        connectionStatus: 'connected',
        isDemoMode: true,
        webhookSubscribed: true,
        lastSyncAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80',
      },
    ],
    products: [
      {
        id: 'prod-01',
        workspaceId: defaultWorkspaceId,
        sku: 'AT-PANJABI-ROYAL-NAVY',
        name: 'Royal Heritage Semi-Fitted Silk Panjabi',
        nameBn: 'রয়েল হেরিটেজ সেমি-ফিটেড সিল্ক পাঞ্জাবি',
        description: 'Premium jacquard blended silk panjabi with fine thread embroidery on collar and placket. Perfect for Eid and celebrations.',
        category: 'Panjabi',
        price: 2650,
        salePrice: 2350,
        images: [
          'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
        ],
        colors: ['Navy Blue', 'Maroon', 'Jet Black'],
        sizes: ['M (40)', 'L (42)', 'XL (44)', 'XXL (46)'],
        variants: [
          { id: 'v-01-m-navy', color: 'Navy Blue', size: 'M (40)', sku: 'AT-P-NV-M', price: 2350, stock: 12 },
          { id: 'v-01-l-navy', color: 'Navy Blue', size: 'L (42)', sku: 'AT-P-NV-L', price: 2350, stock: 8 },
          { id: 'v-01-xl-navy', color: 'Navy Blue', size: 'XL (44)', sku: 'AT-P-NV-XL', price: 2350, stock: 15 },
          { id: 'v-01-m-blk', color: 'Jet Black', size: 'M (40)', sku: 'AT-P-BK-M', price: 2350, stock: 6 },
          { id: 'v-01-l-blk', color: 'Jet Black', size: 'L (42)', sku: 'AT-P-BK-L', price: 2350, stock: 10 },
        ],
        stockQuantity: 51,
        shippingEligible: true,
        faqs: [
          { question: 'Size chart kemon?', answer: 'Chest: M=40", L=42", XL=44", XXL=46". Length is 41-43 inches.' },
          { question: 'Dry wash lagbe?', answer: 'Gentle hand wash with mild liquid detergent or dry clean recommended.' },
        ],
        status: 'active',
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-02-15T12:00:00Z',
      },
      {
        id: 'prod-02',
        workspaceId: defaultWorkspaceId,
        sku: 'AT-SAREE-CRIMSON-GEORGETTE',
        name: 'Crimson Velvet Zari Border Georgette Saree',
        nameBn: 'ক্রিমসন ভেলভেট জরি বর্ডার জর্জেট শাড়ি',
        description: 'Flowy weightless pure georgette saree featuring intricate dull-gold antique zari work and matched unstitched blouse piece.',
        category: 'Saree',
        price: 3850,
        salePrice: 3450,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
        ],
        colors: ['Crimson Red', 'Emerald Green', 'Royal Plum'],
        sizes: ['Free Size (12 Haath)'],
        variants: [
          { id: 'v-02-red', color: 'Crimson Red', size: 'Free Size', sku: 'AT-SAR-RED', price: 3450, stock: 9 },
          { id: 'v-02-grn', color: 'Emerald Green', size: 'Free Size', sku: 'AT-SAR-GRN', price: 3450, stock: 5 },
        ],
        stockQuantity: 14,
        shippingEligible: true,
        faqs: [
          { question: 'Blouse piece shathe ache?', answer: 'Haa, matching 80cm unstitched zari worked blouse piece shathe thakbe.' },
        ],
        status: 'active',
        createdAt: '2026-01-22T10:00:00Z',
        updatedAt: '2026-02-14T08:00:00Z',
      },
      {
        id: 'prod-03',
        workspaceId: defaultWorkspaceId,
        sku: 'AT-KURTI-PASTEL-LINEN',
        name: 'Pastel Lilac Embroidered Linen Kurti',
        nameBn: 'প্যাস্টেল লাইলাক এমব্রয়ডারিড লিনেন কুর্তি',
        description: 'Breathable 100% pure organic cotton-linen kurti with delicate Kashmiri inspired floral threadwork across neckline.',
        category: 'Kurti',
        price: 1850,
        salePrice: 1650,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
        ],
        colors: ['Pastel Lilac', 'Mint Sage', 'Peach Rose'],
        sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
        variants: [
          { id: 'v-03-lilac-m', color: 'Pastel Lilac', size: 'M (38)', sku: 'AT-K-LIL-M', price: 1650, stock: 14 },
          { id: 'v-03-lilac-l', color: 'Pastel Lilac', size: 'L (40)', sku: 'AT-K-LIL-L', price: 1650, stock: 18 },
          { id: 'v-03-mint-m', color: 'Mint Sage', size: 'M (38)', sku: 'AT-K-MNT-M', price: 1650, stock: 7 },
        ],
        stockQuantity: 39,
        shippingEligible: true,
        status: 'active',
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-02-18T10:00:00Z',
      },
      {
        id: 'prod-04',
        workspaceId: defaultWorkspaceId,
        sku: 'AT-POLO-PIQUE-LUXE',
        name: 'Supima Cotton Mercerized Polo Shirt',
        nameBn: 'সুপিমা কটন মারসেরাইজড পোলো শার্ট',
        description: 'Ultra-soft 240 GSM combed cotton polo shirt with mother-of-pearl buttons and anti-curl collar.',
        category: 'Polo & Casuals',
        price: 1250,
        salePrice: 990,
        images: [
          'https://images.unsplash.com/photo-1625910513413-722420a3fb1b?auto=format&fit=crop&w=600&q=80',
        ],
        colors: ['Classic Navy', 'Charcoal Grey', 'Olive Moss'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        variants: [
          { id: 'v-04-navy-m', color: 'Classic Navy', size: 'M', sku: 'AT-POLO-NV-M', price: 990, stock: 22 },
          { id: 'v-04-navy-l', color: 'Classic Navy', size: 'L', sku: 'AT-POLO-NV-L', price: 990, stock: 30 },
          { id: 'v-04-char-l', color: 'Charcoal Grey', size: 'L', sku: 'AT-POLO-CH-L', price: 990, stock: 16 },
        ],
        stockQuantity: 68,
        shippingEligible: true,
        status: 'active',
        createdAt: '2026-02-05T10:00:00Z',
        updatedAt: '2026-02-20T10:00:00Z',
      },
    ],
    customers: [
      {
        id: 'cust-01',
        workspaceId: defaultWorkspaceId,
        name: 'Tanjim Ahmed',
        phone: '01719283741',
        address: 'House 14, Road 7, Sector 3, Uttara, Dhaka',
        city: 'Inside Dhaka',
        facebookId: 'fb_cust_91823',
        totalOrders: 3,
        totalSpent: 7150,
        tags: ['VIP', 'Repeat Buyer'],
        notes: 'Prefers evening deliveries after 6 PM.',
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: 'cust-02',
        workspaceId: defaultWorkspaceId,
        name: 'Nusrat Jahan',
        phone: '01812938475',
        address: 'GEC Circle, Nasirabad, Chittagong',
        city: 'Outside Dhaka',
        facebookId: 'fb_cust_48291',
        totalOrders: 1,
        totalSpent: 3580,
        tags: ['COD Confirmed', 'Outside Dhaka'],
        notes: 'Paid bKash delivery fee advance promptly.',
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'cust-03',
        workspaceId: defaultWorkspaceId,
        name: 'Rahat Chowdhury',
        phone: '01928374615',
        address: 'Block C, Mirpur 10, Dhaka',
        city: 'Inside Dhaka',
        facebookId: 'fb_cust_10293',
        totalOrders: 1,
        totalSpent: 2420,
        tags: ['New Customer'],
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ],
    orders: [
      {
        id: 'ord-1001',
        orderNumber: 'ORD-8942',
        workspaceId: defaultWorkspaceId,
        customerName: 'Tanjim Ahmed',
        customerPhone: '01719283741',
        deliveryAddress: 'House 14, Road 7, Sector 3, Uttara, Dhaka',
        deliveryCity: 'Inside Dhaka',
        items: [
          {
            id: 'item-1',
            productId: 'prod-01',
            productName: 'Royal Heritage Semi-Fitted Silk Panjabi',
            sku: 'AT-P-NV-L',
            variant: 'Navy Blue / L (42)',
            quantity: 1,
            unitPrice: 2350,
            totalPrice: 2350,
            imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
          },
        ],
        subtotal: 2350,
        deliveryFee: 70,
        discount: 0,
        total: 2420,
        advancePaymentRequired: false,
        advanceAmount: 0,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending Verification',
        orderStatus: 'Confirmed',
        statusHistory: [
          { status: 'Draft', timestamp: '2026-03-24T14:10:00Z', note: 'AI captured customer intent' },
          { status: 'Awaiting Confirmation', timestamp: '2026-03-24T14:12:00Z', note: 'Order summary presented to buyer' },
          { status: 'Confirmed', timestamp: '2026-03-24T14:13:00Z', note: 'Customer confirmed details via Messenger' },
        ],
        conversationId: 'conv-01',
        internalNotes: 'Customer verified phone number via OTP/Call check.',
        createdAt: '2026-03-24T14:13:00Z',
        updatedAt: '2026-03-24T14:15:00Z',
      },
      {
        id: 'ord-1002',
        orderNumber: 'ORD-8941',
        workspaceId: defaultWorkspaceId,
        customerName: 'Nusrat Jahan',
        customerPhone: '01812938475',
        deliveryAddress: 'House 8, Road 2, GEC Circle, Nasirabad, Chittagong',
        deliveryCity: 'Outside Dhaka',
        items: [
          {
            id: 'item-2',
            productId: 'prod-02',
            productName: 'Crimson Velvet Zari Border Georgette Saree',
            sku: 'AT-SAR-RED',
            variant: 'Crimson Red / Free Size',
            quantity: 1,
            unitPrice: 3450,
            totalPrice: 3450,
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
          },
        ],
        subtotal: 3450,
        deliveryFee: 130,
        discount: 0,
        total: 3580,
        advancePaymentRequired: true,
        advanceAmount: 130,
        paymentMethod: 'bKash',
        paymentStatus: 'Verified',
        paymentTrxId: 'BK9A82J1LK',
        paymentSenderNumber: '01812938475',
        orderStatus: 'Processing',
        statusHistory: [
          { status: 'Draft', timestamp: '2026-03-24T09:00:00Z' },
          { status: 'Awaiting Payment', timestamp: '2026-03-24T09:15:00Z', note: 'bKash ৳130 delivery fee requested' },
          { status: 'Confirmed', timestamp: '2026-03-24T09:30:00Z', note: 'bKash TrxID BK9A82J1LK verified by admin' },
          { status: 'Processing', timestamp: '2026-03-24T10:00:00Z', note: 'Package forwarded to packing dispatch' },
        ],
        conversationId: 'conv-02',
        internalNotes: 'Courier parcel Steadfast ID: ST-99214.',
        createdAt: '2026-03-24T09:30:00Z',
        updatedAt: '2026-03-24T10:00:00Z',
      },
    ],
    conversations: [
      {
        id: 'conv-01',
        workspaceId: defaultWorkspaceId,
        facebookPageId: 'page-aura-01',
        customerName: 'Tanjim Ahmed',
        customerProfilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        customerFacebookId: 'fb_cust_91823',
        customerPhone: '01719283741',
        unreadCount: 0,
        lastMessageSnippet: 'Ami confirm korchi, order ta finalize kore din.',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        isAiEnabled: true,
        isHumanTakeover: false,
        priority: 'high',
        tags: ['Order Completed', 'Panjabi'],
        isResolved: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: 'conv-02',
        workspaceId: defaultWorkspaceId,
        facebookPageId: 'page-aura-01',
        customerName: 'Nusrat Jahan',
        customerProfilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        customerFacebookId: 'fb_cust_48291',
        customerPhone: '01812938475',
        unreadCount: 0,
        lastMessageSnippet: 'TrxID disi: BK9A82J1LK. Check kore janaben please.',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isAiEnabled: true,
        isHumanTakeover: false,
        priority: 'normal',
        tags: ['bKash Advance', 'Saree'],
        isResolved: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
      {
        id: 'conv-03',
        workspaceId: defaultWorkspaceId,
        facebookPageId: 'page-aura-01',
        customerName: 'Sabrina Karim',
        customerProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        customerFacebookId: 'fb_cust_77218',
        customerPhone: '01755123987',
        unreadCount: 1,
        lastMessageSnippet: 'Ami kurti ta exchange korte chai, size choto hoyeche. Kono manush kotha bolte parbe?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        isAiEnabled: false,
        isHumanTakeover: true,
        assignedModeratorId: 'usr-mod-02',
        assignedModeratorName: 'Tahmina Akter',
        priority: 'urgent',
        tags: ['Handoff Escalated', 'Exchange Request'],
        isResolved: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
      },
    ],
    messages: [
      {
        id: 'msg-101',
        conversationId: 'conv-01',
        sender: 'customer',
        senderName: 'Tanjim Ahmed',
        text: 'Royal navy panjabi tar price koto? L size ache?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'read',
      },
      {
        id: 'msg-102',
        conversationId: 'conv-01',
        sender: 'agent',
        senderName: 'Aura AI Sales Agent',
        text: 'Assalamu Alaikum Tanjim bhai! আমাদের Royal Heritage Semi-Fitted Silk Panjabi (Navy Blue)-এর অফার প্রাইস এখন ৳২,৩৫০ (রেগুলার ৳২,৬৫০)।\n\nজি, L (42) সাইজে বর্তমানে ৮টি স্টক আছে! আপনি কি অর্ডার কনফার্ম করতে চান?',
        timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
        status: 'read',
        isAiGenerated: true,
        detectedIntent: 'price_and_stock_inquiry',
        citedSources: ['Product: AT-PANJABI-ROYAL-NAVY (Variant L: 8 in stock)'],
        suggestedProducts: ['prod-01'],
      },
      {
        id: 'msg-103',
        conversationId: 'conv-01',
        sender: 'customer',
        senderName: 'Tanjim Ahmed',
        text: 'Order korbo. Delivery charge koto Uttara te?',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        status: 'read',
      },
      {
        id: 'msg-104',
        conversationId: 'conv-01',
        sender: 'agent',
        senderName: 'Aura AI Sales Agent',
        text: 'ঢাকার ভেতরে (উত্তরা সহ) ডেলিভারি চার্জ মাত্র ৳৭০ এবং হোম ডেলিভারিতে ক্যাশ অন ডেলিভারি (COD) সুবিধা পাবেন।\n\nঅর্ডারটি প্লেস করতে আপনার সম্পূর্ণ নাম, মোবাইল নাম্বার এবং বাসার সঠিক ঠিকানাটি লিখে দিন দয়া করে।',
        timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
        status: 'read',
        isAiGenerated: true,
        detectedIntent: 'order_intent_address_request',
        citedSources: ['Delivery Rule: Inside Dhaka ৳70'],
      },
      {
        id: 'msg-105',
        conversationId: 'conv-01',
        sender: 'customer',
        senderName: 'Tanjim Ahmed',
        text: 'Name: Tanjim Ahmed\nPhone: 01719283741\nAddress: House 14, Road 7, Sector 3, Uttara, Dhaka',
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        status: 'read',
      },
      {
        id: 'msg-106',
        conversationId: 'conv-01',
        sender: 'agent',
        senderName: 'Aura AI Sales Agent',
        text: 'ধন্যবাদ তানজিম ভাই! আপনার অর্ডারের সারসংক্ষেপ:\n\n📦 পণ্য: Royal Heritage Silk Panjabi (Navy Blue / L)\n💰 মূল্য: ৳২,৩৫০\n🚚 ডেলিভারি চার্জ (ঢাকা): ৳৭০\n💵 সর্বমোট প্রদেয়: ৳২,৪২০ (ক্যাশ অন ডেলিভারি)\n📍 ঠিকানা: House 14, Road 7, Sector 3, Uttara, Dhaka\n\nসবকিছু ঠিক থাকলে দয়া করে "Confirm" অথবা "ঠিক আছে" লিখে নিশ্চিত করুন।',
        timestamp: new Date(Date.now() - 1000 * 60 * 13).toISOString(),
        status: 'read',
        isAiGenerated: true,
        detectedIntent: 'order_summary_presentation',
      },
      {
        id: 'msg-107',
        conversationId: 'conv-01',
        sender: 'customer',
        senderName: 'Tanjim Ahmed',
        text: 'Ami confirm korchi, order ta finalize kore din.',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        status: 'read',
      },
      {
        id: 'msg-108',
        conversationId: 'conv-01',
        sender: 'agent',
        senderName: 'Aura AI Sales Agent',
        text: 'আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। 🎉\n\n🆔 অর্ডার নাম্বার: ORD-8942\n📅 আনুমানিক ডেলিভারি: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে\n\nআমাদের ডেলিভারি রাইডার পৌঁছানোর পূর্বে আপনাকে কল করবেন। আভা ট্রেন্ডসের সাথে থাকার জন্য ধন্যবাদ!',
        timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
        status: 'delivered',
        isAiGenerated: true,
        detectedIntent: 'order_created_confirmation',
      },
      {
        id: 'msg-201',
        conversationId: 'conv-03',
        sender: 'customer',
        senderName: 'Sabrina Karim',
        text: 'Ami kurti ta exchange korte chai, size choto hoyeche. Kono manush kotha bolte parbe?',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        status: 'read',
      },
      {
        id: 'msg-202',
        conversationId: 'conv-03',
        sender: 'system',
        senderName: 'System Bot',
        text: 'Conversation escalated to human moderator (Tahmina Akter). AI automation paused for this thread.',
        timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
        status: 'sent',
      },
    ],
    aiConfigs: {
      [defaultWorkspaceId]: {
        workspaceId: defaultWorkspaceId,
        agentName: 'Aura AI Sales Agent',
        personality: 'Polite, persuasive, and warmly hospitable Bangladeshi retail concierge with deep knowledge of festive and casual fashion.',
        businessName: 'Aura Trends Dhaka',
        businessDescription: 'Premium ready-to-wear Panjabi, designer sarees, linen kurtis, and gentlemen casuals in Bangladesh.',
        preferredLanguage: 'auto',
        communicationTone: 'friendly',
        businessHoursStart: '09:00',
        businessHoursEnd: '23:00',
        outOfHoursMessage: 'আমাদের শোরুম ও কাস্টমার সার্ভিস বর্তমানে বন্ধ রয়েছে। সকাল ৯টায় আমরা আপনার সাথে যোগাযোগ করব। আপনি আপনার অর্ডার বা পণ্যের নাম লিখে রাখতে পারেন।',
        outOfHoursAutoReply: true,
        recommendationBehavior: 'balanced',
        confidenceThreshold: 0.85,
        humanHandoffTriggers: ['human', 'agent', 'exchange', 'refund', 'complain', 'manush', 'kotha bolbo', 'baje service'],
        enableAutomation: true,
        shippingPolicy: 'ঢাকার মধ্যে ডেলিভারি চার্জ ৳৭০ (২৪-৪৮ ঘণ্টা)। ঢাকার বাইরে ডেলিভারি চার্জ ৳১৩০ (২-৩ দিন)। ঢাকার বাইরে ক্যাশ অন ডেলিভারির ক্ষেত্রে ডেলিভারি চার্জ ৳১৩০ অগ্রিম বিকাশ/নগদে প্রযোজ্য।',
        returnPolicy: 'ডেলিভারি গ্রহণের পর ৭ দিনের মধ্যে আন-ইউজড অবস্থায় সাইজ বা কালার এক্সচেঞ্জ সুবিধা রয়েছে। রিটার্ন পার্সেল রিসিভ করার পর এক্সচেঞ্জ পণ্য পাঠানো হয়।',
        paymentPolicy: 'ক্যাশ অন ডেলিভারি (COD), বিকাশ মার্চেন্ট এবং নগদ পেমেন্ট গ্রহণযোগ্য।',
        customInstructions: 'Always answer in natural polite Bangla or Banglish matching customer style. Never promise out-of-stock items. Calculate exact total including delivery fees. Ask for missing order info step by step.',
        prohibitedClaims: ['Never offer unauthorized extra discounts', 'Never state that shipping is free unless total exceeds ৳3,000', 'Never verify transaction ID automatically without bank confirmation'],
      },
    },
    shippingSettings: {
      [defaultWorkspaceId]: {
        workspaceId: defaultWorkspaceId,
        insideDhakaFee: 70,
        insideDhakaDeliveryDays: '24-48 Hours',
        dhakaSuburbsFee: 100,
        outsideDhakaFee: 130,
        outsideDhakaDeliveryDays: '2-4 Days (Pathao/Steadfast)',
        freeShippingThreshold: 3000,
        requireAdvanceForCodOutsideDhaka: true,
        advanceAmount: 130,
        bkashMerchantNumber: '01711223344',
        bkashType: 'Merchant',
        nagadMerchantNumber: '01855667788',
        nagadType: 'Merchant',
        bankDetails: 'City Bank Ltd, Gulshan Branch, A/C: 1102938475001',
      },
    },
    knowledgeDocs: [
      {
        id: 'doc-01',
        workspaceId: defaultWorkspaceId,
        title: 'Delivery & Shipping Zones Bangladesh',
        category: 'policy',
        content: 'Inside Dhaka metro area: ৳70 delivery fee, 24-48 hours. Dhaka suburbs (Savar, Gazipur, Keraniganj): ৳100. Outside Dhaka: ৳130, courier partner Steadfast Courier and Pathao. Advance delivery charge ৳130 must be paid via bKash/Nagad before shipment outside Dhaka.',
        keywords: ['delivery', 'charge', 'shipping', 'dhaka', 'outside dhaka', 'courier', 'steadfast', 'pathao'],
        updatedAt: '2026-02-10T10:00:00Z',
      },
      {
        id: 'doc-02',
        workspaceId: defaultWorkspaceId,
        title: '7-Day Hassle-Free Exchange Policy',
        category: 'policy',
        content: 'Customers can exchange any product within 7 days of receiving it if size or color does not fit. Tags must remain intact with original packaging. Return courier fee is shared or customer responsibility unless product was defective upon arrival.',
        keywords: ['return', 'exchange', 'size problem', 'choto hoyeche', 'boro hoyeche', 'refund'],
        updatedAt: '2026-02-12T10:00:00Z',
      },
      {
        id: 'doc-03',
        workspaceId: defaultWorkspaceId,
        title: 'Payment Verification and bKash / Nagad Process',
        category: 'policy',
        content: 'We accept Cash on Delivery (COD) inside Dhaka. For outside Dhaka, ৳130 advance courier charge via bKash Merchant (Make Payment option: 01711223344, Counter 1). Customer must provide the TrxID. Our staff checks the merchant ledger before dispatch.',
        keywords: ['bkash', 'nagad', 'payment', 'advance', 'trxid', 'cod'],
        updatedAt: '2026-02-14T10:00:00Z',
      },
    ],
    automationRules: [
      {
        id: 'rule-01',
        workspaceId: defaultWorkspaceId,
        name: 'Auto Price & Stock Inquiry AI Responder',
        trigger: 'price_inquiry',
        conditions: [{ field: 'message', operator: 'contains', value: 'price' }],
        action: 'ai_reply',
        actionPayload: 'Respond with exact catalog price and available sizes',
        enabled: true,
        executionCount: 247,
        lastExecutedAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
      },
      {
        id: 'rule-02',
        workspaceId: defaultWorkspaceId,
        name: 'Out-of-Hours Polite Auto Responder',
        trigger: 'outside_hours',
        conditions: [{ field: 'hour', operator: 'greater_than', value: '23' }],
        action: 'send_template',
        actionPayload: 'Thank you for messaging Aura Trends. Our human sales team will respond at 9:00 AM. Feel free to browse or share your address!',
        enabled: true,
        executionCount: 42,
        lastExecutedAt: '2026-03-23T23:45:00Z',
      },
      {
        id: 'rule-03',
        workspaceId: defaultWorkspaceId,
        name: 'Escalate Return/Exchange to Human Moderator',
        trigger: 'messenger_message',
        conditions: [{ field: 'message', operator: 'contains', value: 'exchange' }],
        action: 'escalate_human',
        actionPayload: 'Assign to active moderator and flag as urgent',
        enabled: true,
        executionCount: 18,
        lastExecutedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
      },
    ],
    auditLogs: [
      {
        id: 'log-01',
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        userName: 'Nabin Hasan',
        action: 'PAGE_CONNECTED',
        details: 'Connected Facebook Page: Aura Trends Dhaka - Official (ID: 109283748291029)',
        ipAddress: '103.145.12.8',
        timestamp: '2026-01-15T10:30:00Z',
      },
      {
        id: 'log-02',
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        userName: 'Nabin Hasan',
        action: 'PRODUCT_CREATED',
        details: 'Created product: Royal Heritage Semi-Fitted Silk Panjabi (SKU: AT-PANJABI-ROYAL-NAVY)',
        ipAddress: '103.145.12.8',
        timestamp: '2026-01-20T10:00:00Z',
      },
      {
        id: 'log-03',
        workspaceId: defaultWorkspaceId,
        userId: 'usr-mod-02',
        userName: 'Tahmina Akter',
        action: 'ORDER_CONFIRMED',
        details: 'Verified bKash transaction for order ORD-8941 (৳3,580)',
        ipAddress: '103.145.14.22',
        timestamp: '2026-03-24T09:30:00Z',
      },
    ],
    subscriptions: {
      [defaultWorkspaceId]: {
        workspaceId: defaultWorkspaceId,
        plan: 'Growth',
        monthlyMessageLimit: 15000,
        messagesUsedThisMonth: 4280,
        aiRepliesUsed: 3950,
        activePagesLimit: 5,
        activePagesCount: 1,
        currentPeriodEnd: '2026-12-31T23:59:59Z',
        status: 'active',
      },
    },
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data dir', err);
      }
    }
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.warn('Failed to parse database file, resetting to initial data:', e);
      }
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    try {
      const payload = data || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // Workspaces
  getWorkspaces(userId?: string): Workspace[] {
    if (!userId) return this.data.workspaces;
    const memberWorkspaceIds = this.data.workspaceMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.workspaceId);
    return this.data.workspaces.filter(
      (w) => w.ownerId === userId || memberWorkspaceIds.includes(w.id)
    );
  }

  getWorkspaceById(id: string): Workspace | undefined {
    return this.data.workspaces.find((w) => w.id === id);
  }

  createWorkspace(ws: Omit<Workspace, 'id' | 'createdAt'>): Workspace {
    const id = `ws-${Date.now()}`;
    const newWs: Workspace = {
      ...ws,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.workspaces.push(newWs);

    // Add owner as member
    this.data.workspaceMembers.push({
      id: `wm-${Date.now()}`,
      workspaceId: id,
      userId: ws.ownerId,
      userEmail: 'nabin.llcg@gmail.com',
      userName: 'Nabin Hasan',
      role: 'Owner',
      joinedAt: new Date().toISOString(),
    });

    // Default settings
    this.data.aiConfigs[id] = {
      workspaceId: id,
      agentName: 'AI Sales Agent',
      personality: 'Helpful and courteous e-commerce sales agent for Bangladesh.',
      businessName: ws.name,
      businessDescription: 'E-commerce fashion and retail store.',
      preferredLanguage: 'auto',
      communicationTone: 'friendly',
      businessHoursStart: '09:00',
      businessHoursEnd: '23:00',
      outOfHoursMessage: 'We are currently offline. We will reply to your message tomorrow morning.',
      outOfHoursAutoReply: true,
      recommendationBehavior: 'balanced',
      confidenceThreshold: 0.85,
      humanHandoffTriggers: ['human', 'agent', 'complain', 'refund', 'exchange'],
      enableAutomation: true,
      shippingPolicy: 'Inside Dhaka ৳70, Outside Dhaka ৳130.',
      returnPolicy: '7-day replacement policy.',
      paymentPolicy: 'Cash on Delivery and bKash.',
      customInstructions: 'Be polite and helpful.',
      prohibitedClaims: ['Never promise discounts without approval'],
    };

    this.data.shippingSettings[id] = {
      workspaceId: id,
      insideDhakaFee: 70,
      insideDhakaDeliveryDays: '24-48 Hours',
      dhakaSuburbsFee: 100,
      outsideDhakaFee: 130,
      outsideDhakaDeliveryDays: '2-4 Days',
      freeShippingThreshold: 3000,
      requireAdvanceForCodOutsideDhaka: true,
      advanceAmount: 130,
      bkashMerchantNumber: '01700000000',
      bkashType: 'Merchant',
      nagadMerchantNumber: '01800000000',
      nagadType: 'Merchant',
      bankDetails: '',
    };

    this.data.subscriptions[id] = {
      workspaceId: id,
      plan: 'Free Trial',
      monthlyMessageLimit: 2000,
      messagesUsedThisMonth: 0,
      aiRepliesUsed: 0,
      activePagesLimit: 1,
      activePagesCount: 0,
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'trialing',
    };

    this.save();
    return newWs;
  }

  // Workspace Members
  getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    return this.data.workspaceMembers.filter((m) => m.workspaceId === workspaceId);
  }

  addWorkspaceMember(member: Omit<WorkspaceMember, 'id' | 'joinedAt'>): WorkspaceMember {
    const newMember: WorkspaceMember = {
      ...member,
      id: `wm-${Date.now()}`,
      joinedAt: new Date().toISOString(),
    };
    this.data.workspaceMembers.push(newMember);
    this.save();
    return newMember;
  }

  updateWorkspaceMemberRole(id: string, role: WorkspaceMember['role']) {
    const member = this.data.workspaceMembers.find((m) => m.id === id);
    if (member) {
      member.role = role;
      this.save();
    }
    return member;
  }

  removeWorkspaceMember(id: string) {
    this.data.workspaceMembers = this.data.workspaceMembers.filter((m) => m.id !== id);
    this.save();
  }

  // Facebook Pages
  getFacebookPages(workspaceId: string): FacebookPage[] {
    return this.data.facebookPages.filter((p) => p.workspaceId === workspaceId);
  }

  connectFacebookPage(page: Omit<FacebookPage, 'id' | 'lastSyncAt'>): FacebookPage {
    const newPage: FacebookPage = {
      ...page,
      id: `page-${Date.now()}`,
      lastSyncAt: new Date().toISOString(),
    };
    this.data.facebookPages.push(newPage);
    this.save();
    return newPage;
  }

  disconnectFacebookPage(id: string, workspaceId: string) {
    this.data.facebookPages = this.data.facebookPages.filter(
      (p) => !(p.id === id && p.workspaceId === workspaceId)
    );
    this.save();
  }

  // Products
  getProducts(workspaceId: string): Product[] {
    return this.data.products.filter((p) => p.workspaceId === workspaceId);
  }

  getProductById(id: string, workspaceId: string): Product | undefined {
    return this.data.products.find((p) => p.id === id && p.workspaceId === workspaceId);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, workspaceId: string, updates: Partial<Product>): Product | undefined {
    const index = this.data.products.findIndex((p) => p.id === id && p.workspaceId === workspaceId);
    if (index === -1) return undefined;
    const updated = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.products[index] = updated;
    this.save();
    return updated;
  }

  deleteProduct(id: string, workspaceId: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(
      (p) => !(p.id === id && p.workspaceId === workspaceId)
    );
    const deleted = this.data.products.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Orders
  getOrders(workspaceId: string): Order[] {
    return this.data.orders
      .filter((o) => o.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string, workspaceId: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id && o.workspaceId === workspaceId);
  }

  createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const now = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${randomSuffix}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.orders.push(newOrder);

    // Auto deduct inventory
    for (const item of newOrder.items) {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        if (item.variant && prod.variants) {
          const v = prod.variants.find((v) => v.sku === item.sku || v.id === item.variant);
          if (v) v.stock = Math.max(0, v.stock - item.quantity);
        }
      }
    }

    // Auto create or update customer
    let cust = this.data.customers.find(
      (c) => c.phone === newOrder.customerPhone && c.workspaceId === newOrder.workspaceId
    );
    if (cust) {
      cust.totalOrders += 1;
      cust.totalSpent += newOrder.total;
      cust.address = newOrder.deliveryAddress;
      cust.city = newOrder.deliveryCity;
      cust.lastActiveAt = now;
    } else {
      this.data.customers.push({
        id: `cust-${Date.now()}`,
        workspaceId: newOrder.workspaceId,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        address: newOrder.deliveryAddress,
        city: newOrder.deliveryCity,
        totalOrders: 1,
        totalSpent: newOrder.total,
        tags: ['New Customer'],
        lastActiveAt: now,
      });
    }

    this.save();
    return newOrder;
  }

  updateOrderStatus(
    id: string,
    workspaceId: string,
    orderStatus: Order['orderStatus'],
    note?: string,
    paymentStatus?: Order['paymentStatus']
  ): Order | undefined {
    const order = this.data.orders.find((o) => o.id === id && o.workspaceId === workspaceId);
    if (!order) return undefined;

    order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: orderStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${orderStatus}`,
      updatedBy: 'Admin',
    });

    this.save();
    return order;
  }

  // Customers
  getCustomers(workspaceId: string): Customer[] {
    return this.data.customers.filter((c) => c.workspaceId === workspaceId);
  }

  // Conversations & Messages
  getConversations(workspaceId: string): Conversation[] {
    return this.data.conversations
      .filter((c) => c.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }

  getConversationById(id: string, workspaceId: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === id && c.workspaceId === workspaceId);
  }

  getMessages(conversationId: string): Message[] {
    return this.data.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addMessage(msg: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...msg,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.messages.push(newMessage);

    // Update conversation last snippet
    const conv = this.data.conversations.find((c) => c.id === msg.conversationId);
    if (conv) {
      conv.lastMessageSnippet = msg.text.slice(0, 80);
      conv.lastMessageTime = newMessage.timestamp;
      if (msg.sender === 'customer') {
        conv.unreadCount += 1;
      }
    }

    // Increment usage
    if (conv && this.data.subscriptions[conv.workspaceId]) {
      this.data.subscriptions[conv.workspaceId].messagesUsedThisMonth += 1;
      if (msg.isAiGenerated) {
        this.data.subscriptions[conv.workspaceId].aiRepliesUsed += 1;
      }
    }

    this.save();
    return newMessage;
  }

  updateConversation(id: string, workspaceId: string, updates: Partial<Conversation>): Conversation | undefined {
    const conv = this.data.conversations.find((c) => c.id === id && c.workspaceId === workspaceId);
    if (!conv) return undefined;
    Object.assign(conv, updates);
    this.save();
    return conv;
  }

  // AI Config
  getAiConfig(workspaceId: string): AiAgentConfig {
    if (!this.data.aiConfigs[workspaceId]) {
      const ws = this.getWorkspaceById(workspaceId);
      this.data.aiConfigs[workspaceId] = {
        workspaceId,
        agentName: 'AI Sales Agent',
        personality: 'Friendly Bangladeshi e-commerce assistant.',
        businessName: ws?.name || 'My Store',
        businessDescription: 'Quality online shopping store in Bangladesh.',
        preferredLanguage: 'auto',
        communicationTone: 'friendly',
        businessHoursStart: '09:00',
        businessHoursEnd: '23:00',
        outOfHoursMessage: 'We are offline right now. We will respond at 9:00 AM.',
        outOfHoursAutoReply: true,
        recommendationBehavior: 'balanced',
        confidenceThreshold: 0.85,
        humanHandoffTriggers: ['human', 'agent', 'complain', 'refund'],
        enableAutomation: true,
        shippingPolicy: 'Inside Dhaka ৳70, Outside Dhaka ৳130.',
        returnPolicy: '7-day replacement.',
        paymentPolicy: 'COD and bKash.',
        customInstructions: 'Help the customer place an order politely.',
        prohibitedClaims: ['No unapproved discounts'],
      };
      this.save();
    }
    return this.data.aiConfigs[workspaceId];
  }

  saveAiConfig(workspaceId: string, config: Partial<AiAgentConfig>): AiAgentConfig {
    const current = this.getAiConfig(workspaceId);
    const updated = { ...current, ...config };
    this.data.aiConfigs[workspaceId] = updated;
    this.save();
    return updated;
  }

  // Shipping & Payment Settings
  getShippingSettings(workspaceId: string): ShippingSettings {
    if (!this.data.shippingSettings[workspaceId]) {
      this.data.shippingSettings[workspaceId] = {
        workspaceId,
        insideDhakaFee: 70,
        insideDhakaDeliveryDays: '24-48 Hours',
        dhakaSuburbsFee: 100,
        outsideDhakaFee: 130,
        outsideDhakaDeliveryDays: '2-4 Days',
        freeShippingThreshold: 3000,
        requireAdvanceForCodOutsideDhaka: true,
        advanceAmount: 130,
        bkashMerchantNumber: '01711223344',
        bkashType: 'Merchant',
        nagadMerchantNumber: '01855667788',
        nagadType: 'Merchant',
        bankDetails: '',
      };
      this.save();
    }
    return this.data.shippingSettings[workspaceId];
  }

  saveShippingSettings(workspaceId: string, settings: Partial<ShippingSettings>): ShippingSettings {
    const current = this.getShippingSettings(workspaceId);
    const updated = { ...current, ...settings };
    this.data.shippingSettings[workspaceId] = updated;
    this.save();
    return updated;
  }

  // Knowledge Documents & FAQ
  getKnowledgeDocs(workspaceId: string): KnowledgeDocument[] {
    return this.data.knowledgeDocs.filter((d) => d.workspaceId === workspaceId);
  }

  createKnowledgeDoc(doc: Omit<KnowledgeDocument, 'id' | 'updatedAt'>): KnowledgeDocument {
    const newDoc: KnowledgeDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    this.data.knowledgeDocs.push(newDoc);
    this.save();
    return newDoc;
  }

  deleteKnowledgeDoc(id: string, workspaceId: string): boolean {
    const before = this.data.knowledgeDocs.length;
    this.data.knowledgeDocs = this.data.knowledgeDocs.filter(
      (d) => !(d.id === id && d.workspaceId === workspaceId)
    );
    const deleted = this.data.knowledgeDocs.length < before;
    if (deleted) this.save();
    return deleted;
  }

  // Automation Rules
  getAutomationRules(workspaceId: string): AutomationRule[] {
    return this.data.automationRules.filter((r) => r.workspaceId === workspaceId);
  }

  createAutomationRule(rule: Omit<AutomationRule, 'id' | 'executionCount'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      executionCount: 0,
    };
    this.data.automationRules.push(newRule);
    this.save();
    return newRule;
  }

  updateAutomationRule(id: string, workspaceId: string, updates: Partial<AutomationRule>): AutomationRule | undefined {
    const r = this.data.automationRules.find((r) => r.id === id && r.workspaceId === workspaceId);
    if (!r) return undefined;
    Object.assign(r, updates);
    this.save();
    return r;
  }

  deleteAutomationRule(id: string, workspaceId: string): boolean {
    const before = this.data.automationRules.length;
    this.data.automationRules = this.data.automationRules.filter(
      (r) => !(r.id === id && r.workspaceId === workspaceId)
    );
    const deleted = this.data.automationRules.length < before;
    if (deleted) this.save();
    return deleted;
  }

  // Audit Logs
  getAuditLogs(workspaceId: string): AuditLog[] {
    return this.data.auditLogs
      .filter((l) => l.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    this.data.auditLogs.unshift({
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    // keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  // Subscription & Usage
  getSubscription(workspaceId: string): SubscriptionUsage {
    if (!this.data.subscriptions[workspaceId]) {
      this.data.subscriptions[workspaceId] = {
        workspaceId,
        plan: 'Free Trial',
        monthlyMessageLimit: 2000,
        messagesUsedThisMonth: 0,
        aiRepliesUsed: 0,
        activePagesLimit: 1,
        activePagesCount: 0,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'trialing',
      };
      this.save();
    }
    return this.data.subscriptions[workspaceId];
  }

  updateSubscriptionPlan(workspaceId: string, plan: SubscriptionUsage['plan']): SubscriptionUsage {
    const sub = this.getSubscription(workspaceId);
    sub.plan = plan;
    if (plan === 'Free Trial') {
      sub.monthlyMessageLimit = 2000;
      sub.activePagesLimit = 1;
    } else if (plan === 'Starter') {
      sub.monthlyMessageLimit = 5000;
      sub.activePagesLimit = 2;
    } else if (plan === 'Growth') {
      sub.monthlyMessageLimit = 15000;
      sub.activePagesLimit = 5;
    } else if (plan === 'Pro') {
      sub.monthlyMessageLimit = 50000;
      sub.activePagesLimit = 15;
    }
    this.save();
    return sub;
  }

  // Reset demo data
  resetToDemo(): void {
    this.data = getInitialData();
    this.save();
  }
}

export const db = new Database();
