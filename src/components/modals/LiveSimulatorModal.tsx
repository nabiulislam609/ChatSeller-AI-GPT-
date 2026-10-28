import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Message } from '../../types/index.ts';

const SAMPLE_DEMO_IMAGES = [
  {
    label: 'Navy Silk Panjabi',
    url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Crimson Georgette Saree',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Embroidered Linen Kurti',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
];

export const LiveSimulatorModal: React.FC = () => {
  const { isSimulatorOpen, setIsSimulatorOpen, language, triggerRefresh, showToast } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('Shuvo Chowdhury');
  const [customerPhone, setCustomerPhone] = useState('01712998877');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (isSimulatorOpen && messages.length === 0) {
      setMessages([
        {
          id: 'sim-init',
          conversationId: 'sim-conv',
          sender: 'agent',
          senderName: 'Aura AI Sales Agent',
          text:
            language === 'bn'
              ? 'আসসালামু আলাইকুম! Aura Trends Dhaka-তে আপনাকে স্বাগতম। আমরা কীভাবে আপনাকে সাহায্য করতে পারি? আমাদের পাঞ্জাবি, শাড়ি বা কুর্তি কালেকশন সম্পর্কে জিজ্ঞাসা করতে পারেন।'
              : 'Assalamu Alaikum! Welcome to Aura Trends Dhaka. How can I help you today? Feel free to ask about our Panjabis, Sarees, or Casual wear!',
          timestamp: new Date().toISOString(),
          status: 'delivered',
          isAiGenerated: true,
        },
      ]);
    }
  }, [isSimulatorOpen, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isSimulatorOpen) return null;

  const handleSendMessage = async (textToSend?: string, imgToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    const img = imgToSend !== undefined ? imgToSend : selectedImage;

    if (!text.trim() && !img) return;

    const userMessage: Message = {
      id: `sim-user-${Date.now()}`,
      conversationId: 'sim-conv',
      sender: 'customer',
      senderName: customerName,
      text: text.trim(),
      attachments: img ? [{ type: 'image', url: img }] : undefined,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await api.simulateWebhook({
        customerName,
        customerPhone,
        messageText: text,
        imageUrl: img || undefined,
      });

      if (response.agentReply) {
        setMessages((prev) => [...prev, response.agentReply]);
      }
      triggerRefresh();
    } catch (err: any) {
      console.error('Simulation error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `sim-err-${Date.now()}`,
          conversationId: 'sim-conv',
          sender: 'system',
          senderName: 'System',
          text: `Simulation notice: ${err.message || 'Error communicating with sales agent.'}`,
          timestamp: new Date().toISOString(),
          status: 'failed',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '💰 Price koto? L size ache?', text: 'Royal navy panjabi tar price koto? L size ache?' },
    { label: '🚚 Delivery charge koto?', text: 'Dhakar baire Chittagong er delivery charge koto?' },
    { label: '📦 Order korbo (Provide address)', text: 'Ami panjabi ta order korte chai. Name: Shuvo Chowdhury, Phone: 01712998877, Address: House 12, Road 4, Sector 7, Uttara, Dhaka' },
    { label: '✅ Confirm order', text: 'Confirm korchi, order ta finalize kore din.' },
    { label: '🔄 Exchange request (Human Handoff)', text: 'Ami kurti ta exchange korte chai, size fit hoy nai. Kono human agent ache?' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[90vh] max-h-[750px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-blue-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center border border-blue-700/50">
              <Bot className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">Aura Trends Dhaka</span>
                <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded font-medium">
                  Messenger AI
                </span>
              </div>
              <div className="text-[11px] text-blue-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active 24/7 · Powered by Gemini 3.8 Flash</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setMessages([]);
                showToast('Chat simulator reset', 'info');
              }}
              title="Reset conversation"
              className="p-1.5 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="p-1.5 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Persona Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center space-x-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Simulating Customer:</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="font-medium text-slate-900 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="font-mono text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <span className="text-[11px] text-slate-400">Meta Webhook Sandbox</span>
        </div>

        {/* Chat Messages Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc]">
          {messages.map((m) => {
            const isAgent = m.sender === 'agent';
            const isSystem = m.sender === 'system';
            const isCustomer = m.sender === 'customer';

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <div className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full flex items-center space-x-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>{m.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isCustomer ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-400">
                  <span>{m.senderName}</span>
                  {m.isAiGenerated && (
                    <span className="flex items-center space-x-0.5 text-blue-700 font-medium">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI Grounded</span>
                    </span>
                  )}
                </div>

                {/* Attachments */}
                {m.attachments?.map((att, i) => (
                  <div key={i} className="mb-1.5 rounded-lg overflow-hidden border border-slate-200 max-w-[200px]">
                    <img src={att.url} alt="Attached garment" className="w-full h-auto object-cover" />
                  </div>
                ))}

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    isCustomer
                      ? 'bg-blue-900 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>

                {/* Cited catalog sources if present */}
                {m.citedSources && m.citedSources.length > 0 && (
                  <div className="mt-1 text-[10px] text-slate-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Source: {m.citedSources.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 py-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-[11px] text-blue-800 font-medium ml-1">
                AI analyzing catalog & formulating reply...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Testing Actions */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
          <span className="text-[11px] font-medium text-slate-400 self-center mr-1">
            Test Scenarios:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.text)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-md transition-colors border border-slate-200/60 font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-blue-50/70 border-t border-blue-100 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-md border" />
              <div className="text-xs text-blue-900 font-medium">Image attached for vision match</div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Custom file upload for any device image */}
            <label
              className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="Upload your own photo from device to test Gemini vision recognition"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (reader.result) setSelectedImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>

            {/* Quick Demo Image Picker */}
            <div className="relative group">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Attach sample catalog photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow-xl p-2 w-56 z-50">
                <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 px-1">
                  Preset Catalog Samples
                </div>
                {SAMPLE_DEMO_IMAGES.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className="w-full flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded text-left text-xs"
                  >
                    <img src={img.url} className="w-6 h-6 rounded object-cover" />
                    <span className="truncate text-slate-700">{img.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'মেসেজ লিখুন (যেমন: দাম কত? এল সাইজ আছে? বা ঠিকানা দিন)...'
                  : 'Type in Bangla, Banglish, or English (e.g. Price koto?)...'
              }
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
            />

            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="p-2 px-4 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
