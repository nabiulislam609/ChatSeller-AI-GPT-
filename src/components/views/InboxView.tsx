import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bot,
  User,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Tag,
  ShoppingBag,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Conversation, Message, Order, Customer } from '../../types/index.ts';

export const InboxView: React.FC = () => {
  const { language, refreshKey, triggerRefresh, showToast } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const list = await api.getConversations();
        setConversations(list);
        if (list.length > 0 && !selectedConvId) {
          setSelectedConvId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadConversations();
  }, [refreshKey]);

  // Load active conversation thread
  useEffect(() => {
    if (!selectedConvId) return;

    const loadThread = async () => {
      try {
        const data = await api.getConversation(selectedConvId);
        setMessages(data.messages);

        // Fetch customer profile and orders
        const allOrders = await api.getOrders();
        const matchedOrders = allOrders.filter(
          (o) =>
            o.conversationId === selectedConvId ||
            (data.conversation.customerPhone && o.customerPhone === data.conversation.customerPhone)
        );
        setCustomerOrders(matchedOrders);

        const customers = await api.getCustomers();
        const cust = customers.find(
          (c) =>
            c.facebookId === data.conversation.customerFacebookId ||
            (data.conversation.customerPhone && c.phone === data.conversation.customerPhone)
        );
        setCustomerProfile(cust || null);
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };
    loadThread();
    setAiDraft(null);
  }, [selectedConvId, refreshKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiDraft]);

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() || !selectedConvId) return;

    try {
      const newMsg = await api.sendMessage(selectedConvId, text.trim(), 'human_moderator');
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setAiDraft(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
    }
  };

  const handleToggleAi = async () => {
    if (!activeConv) return;
    const newAiState = !activeConv.isAiEnabled;
    try {
      await api.updateConversation(activeConv.id, {
        isAiEnabled: newAiState,
        isHumanTakeover: !newAiState,
      });
      showToast(
        newAiState ? 'AI Sales Agent resumed for this chat' : 'Human takeover: AI paused for this chat',
        'info'
      );
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update conversation', 'error');
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!selectedConvId) return;
    setIsGeneratingDraft(true);
    try {
      const res = await api.suggestReply(selectedConvId);
      setAiDraft(res.replyText);
      setInputText(res.replyText);
      showToast('AI reply draft generated based on verified catalog & policies', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate AI draft', 'error');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessageSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone && c.customerPhone.includes(searchQuery))
  );

  return (
    <div className="h-[calc(100vh-130px)] bg-white rounded-xl border border-slate-200 overflow-hidden flex shadow-xs">
      {/* Col 1: Conversation List (320px) */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/70 border-l-3 border-blue-900' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2 truncate">
                    <img
                      src={
                        conv.customerProfilePic ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt="Customer"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {conv.customerName}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-500 truncate mb-1.5">{conv.lastMessageSnippet}</p>

                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center space-x-1">
                    {conv.isHumanTakeover ? (
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                        Human Takeover
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold flex items-center space-x-1">
                        <Bot className="w-2.5 h-2.5" />
                        <span>AI Active</span>
                      </span>
                    )}
                    {conv.priority === 'urgent' && (
                      <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-semibold">
                        Urgent
                      </span>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[9px]">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Col 2: Active Chat Timeline (Flex 1) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    activeConv.customerProfilePic ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                  }
                  alt="Customer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="font-semibold text-xs text-slate-900 flex items-center space-x-1.5">
                    <span>{activeConv.customerName}</span>
                    {activeConv.customerPhone && (
                      <span className="font-mono text-[11px] text-slate-400">({activeConv.customerPhone})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">Facebook Messenger · {activeConv.tags.join(', ')}</div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                {/* AI / Human takeover switch */}
                <button
                  onClick={handleToggleAi}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    activeConv.isHumanTakeover
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                  title={
                    activeConv.isHumanTakeover
                      ? 'Click to return control to AI Sales Agent'
                      : 'Click to takeover conversation and pause AI'
                  }
                >
                  {activeConv.isHumanTakeover ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Human Takeover (AI Paused)</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AI Automating Replies</span>
                    </>
                  )}
                </button>

                {/* Generate AI Draft */}
                <button
                  onClick={handleGenerateAiDraft}
                  disabled={isGeneratingDraft}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{isGeneratingDraft ? 'Drafting...' : 'Suggest AI Reply'}</span>
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m) => {
                const isCustomer = m.sender === 'customer';
                const isAgent = m.sender === 'agent';
                const isHuman = m.sender === 'human_moderator';
                const isSystem = m.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={m.id} className="flex justify-center my-2">
                      <div className="text-[11px] bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
                        {m.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'} max-w-[80%] ${
                      isCustomer ? 'mr-auto' : 'ml-auto'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-400">
                      <span>{m.senderName}</span>
                      {isAgent && (
                        <span className="text-blue-700 font-semibold flex items-center space-x-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Agent</span>
                        </span>
                      )}
                      {isHuman && (
                        <span className="text-amber-800 font-semibold">Moderator</span>
                      )}
                      <span>·</span>
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Attachments */}
                    {m.attachments?.map((att, i) => (
                      <div key={i} className="mb-1 rounded-lg overflow-hidden border border-slate-200 max-w-xs">
                        <img src={att.url} alt="Attachment" className="w-full h-auto object-cover" />
                      </div>
                    ))}

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        isCustomer
                          ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                          : isAgent
                          ? 'bg-blue-900 text-white rounded-br-xs shadow-xs'
                          : 'bg-slate-800 text-white rounded-br-xs shadow-xs'
                      }`}
                    >
                      {m.text}
                    </div>

                    {m.citedSources && m.citedSources.length > 0 && (
                      <div className="mt-1 text-[10px] text-slate-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Source: {m.citedSources.join(', ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Draft Suggestion Box */}
            {aiDraft && (
              <div className="mx-4 mb-2 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5 font-semibold text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>AI Suggested Reply (Grounded in Store Catalog):</span>
                  </div>
                  <button
                    onClick={() => setAiDraft(null)}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="text-slate-800 mb-2 italic bg-white p-2 rounded border border-amber-100">
                  {aiDraft}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleSendMessage(aiDraft)}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    Approve & Send
                  </button>
                </div>
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
                <input
                  type="text"
                  placeholder="Type a reply as human moderator (Bangla / English)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Select a conversation from the left to view timeline
          </div>
        )}
      </div>

      {/* Col 3: Customer Profile & Order History (280px) */}
      <div className="w-72 border-l border-slate-200 bg-white p-4 overflow-y-auto shrink-0 space-y-5">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Customer Profile
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400">Name:</span>
              <div className="font-semibold text-slate-800">{activeConv?.customerName}</div>
            </div>
            <div>
              <span className="text-slate-400">Contact:</span>
              <div className="font-mono text-slate-800">{activeConv?.customerPhone || 'Not provided yet'}</div>
            </div>
            <div>
              <span className="text-slate-400">Lifetime Spend:</span>
              <div className="font-semibold text-emerald-700">
                ৳{customerProfile?.totalSpent?.toLocaleString() || '0'} ({customerOrders.length} orders)
              </div>
            </div>
            <div>
              <span className="text-slate-400">Delivery Address:</span>
              <div className="text-slate-600">{customerProfile?.address || 'Inside Dhaka'}</div>
            </div>
          </div>
        </div>

        {/* Previous Orders in Store */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Recorded Orders ({customerOrders.length})
          </h4>
          {customerOrders.length === 0 ? (
            <div className="text-xs text-slate-400">No previous orders found for this customer.</div>
          ) : (
            <div className="space-y-2">
              {customerOrders.map((ord) => (
                <div key={ord.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex justify-between font-semibold text-slate-800 mb-0.5">
                    <span>{ord.orderNumber}</span>
                    <span className="text-blue-900 font-bold">৳{ord.total}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{ord.deliveryCity} · {ord.paymentMethod}</div>
                  <div className="mt-1">
                    <span className="inline-block text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority & Tags */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Tags & Notes
          </h4>
          <div className="flex flex-wrap gap-1">
            {activeConv?.tags.map((tg, i) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                {tg}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
