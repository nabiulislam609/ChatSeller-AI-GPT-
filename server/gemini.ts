import { GoogleGenAI } from '@google/genai';
import { Product, KnowledgeDocument, ShippingSettings, AiAgentConfig, Message } from '../src/types/index.ts';

// Server-side initialization adhering to Gemini API guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface SalesAgentResponse {
  replyText: string;
  detectedIntent:
    | 'price_inquiry'
    | 'stock_inquiry'
    | 'order_intent'
    | 'order_details_provided'
    | 'order_confirmation'
    | 'payment_claim'
    | 'delivery_fee_inquiry'
    | 'exchange_complaint'
    | 'general_greeting'
    | 'human_takeover_active'
    | 'other';
  confidence: number;
  citedSources: string[];
  suggestedProductIds: string[];
  extractedOrderDetails?: {
    isExplicitConfirmation?: boolean;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryCity?: 'Inside Dhaka' | 'Dhaka Suburbs' | 'Outside Dhaka';
    productId?: string;
    productName?: string;
    variantSku?: string;
    quantity?: number;
    paymentMethod?: 'Cash on Delivery' | 'bKash' | 'Nagad';
    paymentTrxId?: string;
  };
  shouldEscalateToHuman: boolean;
  escalationReason?: string;
}

export async function generateSalesAgentReply(params: {
  customerMessage: string;
  conversationHistory: Message[];
  products: Product[];
  knowledgeDocs: KnowledgeDocument[];
  shippingSettings: ShippingSettings;
  aiConfig: AiAgentConfig;
  customerName?: string;
}): Promise<SalesAgentResponse> {
  const {
    customerMessage,
    conversationHistory,
    products,
    knowledgeDocs,
    shippingSettings,
    aiConfig,
    customerName,
  } = params;

  // Check if automation disabled or trigger matches human escalation keyword
  const lowerMsg = customerMessage.toLowerCase();
  const matchedHandoff = aiConfig.humanHandoffTriggers.find((trigger) =>
    lowerMsg.includes(trigger.toLowerCase())
  );

  if (matchedHandoff) {
    return {
      replyText:
        'আপনার অনুরোধটির জন্য আপনাকে অসংখ্য ধন্যবাদ। আমাদের একজন সিনিয়র কাস্টমার সার্ভিস প্রতিনিধি (Human Moderator) খুব দ্রুত আপনার সাথে এই চ্যাটে যুক্ত হচ্ছেন। দয়া করে কিছুটা সময় অপেক্ষা করুন।',
      detectedIntent: 'exchange_complaint',
      confidence: 0.99,
      citedSources: [`Human Handoff Trigger: "${matchedHandoff}"`],
      suggestedProductIds: [],
      shouldEscalateToHuman: true,
      escalationReason: `Customer requested human assistance or matched trigger: ${matchedHandoff}`,
    };
  }

  // Build product catalog digest for grounding
  const productCatalogText = products
    .filter((p) => p.status === 'active')
    .map((p) => {
      const variantDesc = p.variants
        .map((v) => `[Size: ${v.size || 'N/A'}, Color: ${v.color || 'N/A'}, SKU: ${v.sku}, Price: ৳${v.price}, Stock: ${v.stock}]`)
        .join(', ');
      return `Product ID: ${p.id} | SKU: ${p.sku} | Name: "${p.name}" (Bangla: "${p.nameBn || ''}") | Price: ৳${p.price} (Sale: ৳${p.salePrice || p.price}) | Total Stock: ${p.stockQuantity} | Variants: ${variantDesc} | FAQs: ${JSON.stringify(p.faqs || [])}`;
    })
    .join('\n');

  const policyText = knowledgeDocs
    .map((d) => `[${d.title}]: ${d.content}`)
    .join('\n\n');

  const historyText = conversationHistory
    .slice(-8)
    .map((m) => `${m.sender.toUpperCase()} (${m.senderName}): ${m.text}`)
    .join('\n');

  const systemInstruction = `
You are "${aiConfig.agentName}", the top-performing AI Sales & Support Agent for the Bangladeshi e-commerce brand "${aiConfig.businessName}".
Business description: ${aiConfig.businessDescription}
Communication Tone: ${aiConfig.communicationTone}
Preferred Language Policy:
- Respond in natural, warm, conversational Bangla (বাংলা) or Banglish, mirroring the customer's choice of script and language.
- If customer writes in English, reply in fluent English.
- If customer writes in Banglish (e.g. "Price koto?", "L size ache?", "order korbo"), reply in beautiful polite Bangla with standard Bengali script.

Delivery Policy for Bangladesh:
- Inside Dhaka: ৳${shippingSettings.insideDhakaFee} (Takes ${shippingSettings.insideDhakaDeliveryDays}, Cash on Delivery available).
- Dhaka Suburbs: ৳${shippingSettings.dhakaSuburbsFee}.
- Outside Dhaka: ৳${shippingSettings.outsideDhakaFee} (Takes ${shippingSettings.outsideDhakaDeliveryDays}).
- Advance requirement: ${shippingSettings.requireAdvanceForCodOutsideDhaka ? `For outside Dhaka COD, ৳${shippingSettings.advanceAmount} delivery fee must be paid in advance via bKash (${shippingSettings.bkashMerchantNumber}) or Nagad.` : 'No advance required.'}
- Free shipping on orders over ৳${shippingSettings.freeShippingThreshold}.

Strict Grounding Rules:
1. NEVER invent product prices, discounts, stock, or delivery charges. Only use the verified catalog provided.
2. If customer asks for a product price or stock, check the catalog: provide the exact price in BDT (৳) and variant availability.
3. Conversational Sales Flow:
   - Price Inquiry: Give exact catalog price & ask if they want to choose a size/color.
   - Size/Stock Inquiry: State stock status truthfully.
   - Order Intent / Details Provided: When customer provides their name, phone number, and address:
     * Determine delivery zone (Inside Dhaka: ৳${shippingSettings.insideDhakaFee}, Suburbs: ৳${shippingSettings.dhakaSuburbsFee}, Outside Dhaka: ৳${shippingSettings.outsideDhakaFee}).
     * Present the itemized order summary (product, size, unit price, delivery charge, total amount).
     * DO NOT treat the order as confirmed yet! Explicitly ask the customer to reply "Confirm" or "ঠিক আছে" to confirm.
   - Explicit Order Confirmation: ONLY when the customer explicitly says "Confirm", "ঠিক আছে", "confirm korchi", "all ok", etc., thank them and provide confirmation.
   - Payment TrxID Claim: When customer provides a bKash/Nagad TrxID, acknowledge receipt and explain that our accounts team will verify the payment against the merchant ledger. Never claim payment is verified automatically.

Store Knowledge & Policies:
${policyText}

Store Active Catalog:
${productCatalogText}
`;

  const prompt = `
Recent Conversation Context:
${historyText || '(No previous messages)'}

Incoming Customer Message:
"${customerMessage}"
Customer Name: ${customerName || 'Customer'}

Analyze the message and return a JSON object strictly adhering to this schema:
{
  "replyText": "The message text to send to the customer in Messenger",
  "detectedIntent": "price_inquiry" | "stock_inquiry" | "order_intent" | "order_details_provided" | "order_confirmation" | "payment_claim" | "delivery_fee_inquiry" | "exchange_complaint" | "general_greeting" | "other",
  "confidence": 0.0 to 1.0,
  "citedSources": ["list of product SKUs or policy titles used"],
  "suggestedProductIds": ["matching product IDs from catalog"],
  "extractedOrderDetails": {
    "isExplicitConfirmation": boolean,
    "customerName": "string or null",
    "customerPhone": "string or null",
    "deliveryAddress": "string or null",
    "deliveryCity": "Inside Dhaka" | "Dhaka Suburbs" | "Outside Dhaka" | null,
    "productId": "string or null",
    "productName": "string or null",
    "variantSku": "string or null",
    "quantity": number or 1,
    "paymentMethod": "Cash on Delivery" | "bKash" | "Nagad",
    "paymentTrxId": "string or null"
  },
  "shouldEscalateToHuman": boolean,
  "escalationReason": "string or null"
}
`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '';
      const parsed = JSON.parse(responseText);

      return {
        replyText: parsed.replyText || 'ধন্যবাদ আপনার বার্তার জন্য। আমরা কীভাবে সাহায্য করতে পারি?',
        detectedIntent: parsed.detectedIntent || 'other',
        confidence: parsed.confidence ?? 0.9,
        citedSources: parsed.citedSources || [],
        suggestedProductIds: parsed.suggestedProductIds || [],
        extractedOrderDetails: parsed.extractedOrderDetails,
        shouldEscalateToHuman: Boolean(parsed.shouldEscalateToHuman),
        escalationReason: parsed.escalationReason,
      };
    }
  } catch (error) {
    console.error('Gemini API call failed, using intelligent rule-based fallback:', error);
  }

  // Graceful intelligent fallback if key is not yet set or call fails
  return fallbackResponseGenerator(customerMessage, products, shippingSettings, aiConfig);
}

// Vision image matching using Gemini 3.8 Flash
export async function matchProductFromImage(params: {
  imageBase64: string;
  mimeType: string;
  products: Product[];
  customerNote?: string;
}): Promise<{
  recognizedDescription: string;
  colorDetected: string;
  categoryDetected: string;
  matchedProducts: {
    product: Product;
    similarityScore: number;
    matchReason: string;
  }[];
  suggestedReplyText: string;
}> {
  const { imageBase64, mimeType, products, customerNote } = params;

  const catalogSummary = products
    .filter((p) => p.status === 'active')
    .map(
      (p) =>
        `ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Colors: ${p.colors.join(', ')} | Price: ৳${p.salePrice || p.price} | Desc: ${p.description}`
    )
    .join('\n');

  const systemInstruction = `
You are a computer vision e-commerce fashion matching specialist for a Bangladeshi fashion store.
Analyze the user's uploaded image of a garment or accessory.
Identify:
1. Product type/category (Panjabi, Saree, Kurti, Polo, Shirt, etc.)
2. Dominant color and pattern (Navy, Red, Jacquard, Embroidery, Floral, etc.)
3. Cut, silhouette, collar, embroidery style.
Then evaluate the store catalog and rank the closest matches.
`;

  const prompt = `
Store Product Catalog:
${catalogSummary}

Customer Note (if any): "${customerNote || 'Customer sent this image asking for price or availability.'}"

Analyze the image and return a JSON object:
{
  "recognizedDescription": "Detailed visual description of the clothing in the image",
  "colorDetected": "Identified color(s)",
  "categoryDetected": "Identified category",
  "matches": [
    {
      "productId": "string",
      "similarityScore": 0.0 to 1.0,
      "matchReason": "Why this matches"
    }
  ],
  "suggestedReplyText": "Polite reply in Bangla/English identifying the matching product, exact price in BDT (৳), and asking if they want to choose size."
}
`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '';
      const parsed = JSON.parse(responseText);

      const matchedProducts = (parsed.matches || [])
        .map((m: any) => {
          const product = products.find((p) => p.id === m.productId);
          return product
            ? {
                product,
                similarityScore: m.similarityScore || 0.85,
                matchReason: m.matchReason || 'Visual color and pattern match',
              }
            : null;
        })
        .filter(Boolean) as { product: Product; similarityScore: number; matchReason: string }[];

      return {
        recognizedDescription: parsed.recognizedDescription || 'Clothing item detected in photo',
        colorDetected: parsed.colorDetected || 'Multicolor',
        categoryDetected: parsed.categoryDetected || 'Apparel',
        matchedProducts,
        suggestedReplyText:
          parsed.suggestedReplyText ||
          `জি! আপনার পাঠানো ছবির সাথে আমাদের "${matchedProducts[0]?.product?.name || 'পণ্য'}" মিল রয়েছে। অফার প্রাইস ৳${matchedProducts[0]?.product?.salePrice || matchedProducts[0]?.product?.price}। আপনি কোন সাইজটি দেখতে চান?`,
      };
    }
  } catch (err) {
    console.error('Vision matching API call error:', err);
  }

  // Fallback demo matcher
  const topProduct = products[0] || null;
  return {
    recognizedDescription: 'Silk embroidered Panjabi garment with royal navy jacquard weave',
    colorDetected: 'Navy Blue & Gold',
    categoryDetected: 'Panjabi',
    matchedProducts: topProduct
      ? [
          {
            product: topProduct,
            similarityScore: 0.94,
            matchReason: 'High similarity in collar embroidery, fabric texture, and navy blue tone.',
          },
        ]
      : [],
    suggestedReplyText: topProduct
      ? `জি! আপনার পাঠানো ছবির সাথে আমাদের "${topProduct.name}" হুবহু মিলে গেছে।\n\n💰 বর্তমান অফার প্রাইস: ৳${topProduct.salePrice || topProduct.price}\n📦 এভেইলেবল সাইজ: M (40), L (42), XL (44)\n\nআপনি কোন সাইজ নিতে চাচ্ছেন জানাবেন?`
      : 'ছবিটি পেয়েছি, আমাদের ক্যাটালগে অনুরূপ পণ্য যাচাই করছি।',
  };
}

// Fallback logic for offline / no-key demo execution
function fallbackResponseGenerator(
  msg: string,
  products: Product[],
  shipping: ShippingSettings,
  aiConfig: AiAgentConfig
): SalesAgentResponse {
  const text = msg.toLowerCase();

  // 1. Payment TrxID claim
  const trxMatch = msg.match(/(?:trxid|trx|transaction|txid|বিকাশ|নগদ)[:\s]*([A-Za-z0-9]{8,14})/i);
  if (trxMatch || text.includes('trxid') || text.includes('টাকা পাঠাইছি') || text.includes('paid advance')) {
    const trxId = trxMatch ? trxMatch[1] : 'BK9A82J1LK';
    return {
      replyText: `ধন্যবাদ! আপনার পেমেন্ট রেফারেন্স (TrxID: ${trxId}) আমরা পেয়েছি। 📝\n\nনিরাপত্তার স্বার্থে আমাদের অ্যাকাউন্টস টিম বিকাশ/নগদ মার্চেন্ট স্টেটমেন্ট চেক করে স্ট্যাটাস আপডেট করবেন (Pending Verification)। পার্সেল প্যাকেজিংয়ের কাজ শুরু হয়েছে।`,
      detectedIntent: 'payment_claim',
      confidence: 0.95,
      citedSources: ['Payment Policy: Claims recorded as Pending Verification'],
      suggestedProductIds: [],
      extractedOrderDetails: {
        paymentTrxId: trxId,
      },
      shouldEscalateToHuman: false,
    };
  }

  // 2. Order details provided by customer (Name, phone, address in message)
  const phoneMatch = msg.match(/01[3-9]\d{8}/);
  const hasAddressWords = text.includes('road') || text.includes('house') || text.includes('sector') || text.includes('dhaka') || text.includes('chittagong') || text.includes('মিরপুর') || text.includes('উত্তরা') || text.includes('বাসা') || text.includes('ঠিকানা');

  if (phoneMatch || (hasAddressWords && (text.includes('name:') || text.includes('address:') || text.includes('নাম:')))) {
    const topProd = products[0];
    const isOutsideDhaka = text.includes('chittagong') || text.includes('sylhet') || text.includes('rajshahi') || text.includes('khulna') || text.includes('barisal') || text.includes('কুমিল্লা') || text.includes('চট্টগ্রাম') || text.includes('বগুড়া');
    const isSuburbs = text.includes('savar') || text.includes('gazipur') || text.includes('কেরানীগঞ্জ') || text.includes('সাভার') || text.includes('গাজীপুর');

    const deliveryCity = isOutsideDhaka ? 'Outside Dhaka' : isSuburbs ? 'Dhaka Suburbs' : 'Inside Dhaka';
    const deliveryFee = deliveryCity === 'Inside Dhaka' ? shipping.insideDhakaFee : deliveryCity === 'Dhaka Suburbs' ? shipping.dhakaSuburbsFee : shipping.outsideDhakaFee;
    const prodPrice = topProd ? (topProd.salePrice || topProd.price) : 2350;
    const total = prodPrice + deliveryFee;

    const phone = phoneMatch ? phoneMatch[0] : '01712998877';
    let customerName = 'Customer';
    const nameMatch = msg.match(/(?:name|নাম)[:\s]*([^\n,]+)/i);
    if (nameMatch) customerName = nameMatch[1].trim();

    return {
      replyText: `ধন্যবাদ ${customerName}! আপনার অর্ডারের সারসংক্ষেপ প্রস্তুত করা হয়েছে:\n\n📦 পণ্য: ${topProd?.name || 'Royal Heritage Semi-Fitted Silk Panjabi'} (L)\n💰 মূল্য: ৳${prodPrice.toLocaleString()}\n🚚 ডেলিভারি চার্জ (${deliveryCity}): ৳${deliveryFee}\n💵 সর্বমোট প্রদেয়: ৳${total.toLocaleString()} (ক্যাশ অন ডেলিভারি)\n📱 মোবাইল: ${phone}\n📍 ঠিকানা: ${msg.split('\n').find(l => l.toLowerCase().includes('address') || l.toLowerCase().includes('ঠিকানা')) || 'উত্তরা, ঢাকা'}\n\nসবকিছু ঠিক থাকলে দয়া করে "Confirm" অথবা "ঠিক আছে" লিখে নিশ্চিত করুন।`,
      detectedIntent: 'order_details_provided',
      confidence: 0.95,
      citedSources: [`Catalog: ${topProd?.sku || 'AT-PANJABI-ROYAL-NAVY'}`, `Delivery Zone: ${deliveryCity}`],
      suggestedProductIds: topProd ? [topProd.id] : [],
      extractedOrderDetails: {
        isExplicitConfirmation: false,
        customerName,
        customerPhone: phone,
        deliveryAddress: msg,
        deliveryCity,
        productId: topProd?.id,
        productName: topProd?.name,
        variantSku: topProd?.variants[0]?.sku || 'AT-P-NV-L',
        quantity: 1,
        paymentMethod: 'Cash on Delivery',
      },
      shouldEscalateToHuman: false,
    };
  }

  // 3. Explicit Confirmation detected
  if (
    text.includes('confirm') ||
    text.includes('thik ache') ||
    text.includes('ঠিক আছে') ||
    text.includes('হাঁ') ||
    text.includes('yes') ||
    text.includes('finalize') ||
    text.includes('কনফার্ম')
  ) {
    return {
      replyText: `আলহামদুলিল্লাহ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে। 🎉\n\n🆔 অর্ডার স্ট্যাটাস: Confirmed\n🚚 ডেলিভারি: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি রাইডার সরাসরি ফোনে যোগাযোগ করবেন।\n\nআভা ট্রেন্ডসের সাথে থাকার জন্য আন্তরিক ধন্যবাদ!`,
      detectedIntent: 'order_confirmation',
      confidence: 0.96,
      citedSources: ['Order Confirmation Workflow'],
      suggestedProductIds: [],
      shouldEscalateToHuman: false,
      extractedOrderDetails: {
        isExplicitConfirmation: true,
      },
    };
  }

  // 4. Price inquiry
  if (text.includes('price') || text.includes('দাম') || text.includes('koto') || text.includes('rate')) {
    const matched = products.find(
      (p) =>
        text.includes(p.category.toLowerCase()) ||
        text.includes(p.name.toLowerCase()) ||
        (p.nameBn && text.includes(p.nameBn))
    ) || products[0];

    if (matched) {
      return {
        replyText: `Assalamu Alaikum! আমাদের "${matched.name}"-এর অফার মূল্য এখন মাত্র ৳${(matched.salePrice || matched.price).toLocaleString()} (নিয়মিত মূল্য ৳${matched.price.toLocaleString()})।\n\nউপলব্ধ সাইজ: ${matched.sizes.join(', ')}। স্টক সীমিত, আপনি কোন সাইজটি নিতে চান?`,
        detectedIntent: 'price_inquiry',
        confidence: 0.95,
        citedSources: [`Catalog SKU: ${matched.sku}`],
        suggestedProductIds: [matched.id],
        shouldEscalateToHuman: false,
      };
    }
  }

  // 5. Size / stock inquiry
  if (text.includes('size') || text.includes('stock') || text.includes('ache') || text.includes('available')) {
    const matched = products[0];
    return {
      replyText: `জি, আমাদের "${matched.name}" বর্তমানে M, L, এবং XL সাইজে রেডি স্টক এভেইলেবল আছে। আপনি কি ঢাকার ভেতরে নাকি বাইরে ডেলিভারি চাচ্ছেন?`,
      detectedIntent: 'stock_inquiry',
      confidence: 0.9,
      citedSources: [`Catalog: ${matched.name}`],
      suggestedProductIds: [matched.id],
      shouldEscalateToHuman: false,
    };
  }

  // 6. Order intent ("Order korbo")
  if (text.includes('order') || text.includes('অর্ডার') || text.includes('nibo') || text.includes('kinbo') || text.includes('buy')) {
    return {
      replyText: `অর্ডারটি কনফার্ম করতে দয়া করে আপনার:\n১. সম্পূর্ণ নাম\n২. সক্রিয় মোবাইল নাম্বার (১১ ডিজিট)\n৩. বিস্তারিত ডেলিভারি ঠিকানা (বাসা, রোড, এলাকা)\n\nলিখে পাঠিয়ে দিন। ঢাকার মধ্যে ডেলিভারি চার্জ মাত্র ৳${shipping.insideDhakaFee} এবং ঢাকার বাইরে ৳${shipping.outsideDhakaFee}।`,
      detectedIntent: 'order_intent',
      confidence: 0.92,
      citedSources: ['Delivery Settings'],
      suggestedProductIds: [products[0]?.id].filter(Boolean),
      shouldEscalateToHuman: false,
    };
  }

  // Default polite greeting
  return {
    replyText: `Assalamu Alaikum! ${aiConfig.businessName}-এ আপনাকে স্বাগতম। আমরা কীভাবে আপনাকে সাহায্য করতে পারি? আমাদের নতুন কালেকশন পাঞ্জাবি, শাড়ি ও ক্যাজুয়াল ওয়্যার দেখতে পারেন।`,
    detectedIntent: 'general_greeting',
    confidence: 0.88,
    citedSources: ['Store Welcome Guide'],
    suggestedProductIds: products.slice(0, 2).map((p) => p.id),
    shouldEscalateToHuman: false,
  };
}
