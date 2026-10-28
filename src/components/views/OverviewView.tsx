import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Bot,
  Zap,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Order } from '../../types/index.ts';
import { OrderInvoiceModal } from '../modals/OrderInvoiceModal.tsx';

export const OverviewView: React.FC = () => {
  const { currentWorkspace, t, language, setActiveNav, setIsSimulatorOpen, refreshKey } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [stats, ordersData] = await Promise.all([api.getAnalytics(), api.getOrders()]);
        setAnalytics(stats);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick AI Launcher */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-blue-800/80 text-blue-200 px-2.5 py-0.5 rounded-full font-medium flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Bangladeshi E-commerce Automation</span>
            </span>
            <span className="text-xs text-blue-200">· Active Store: {currentWorkspace?.name}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {language === 'bn'
              ? 'এআই সেলস এজেন্টের মাধ্যমে মেসেঞ্জারে স্বয়ংক্রিয় বিক্রি বাড়ান'
              : 'Automate Messenger Sales & Customer Inquiries with AI'}
          </h2>
          <p className="text-xs text-blue-200 leading-relaxed">
            {language === 'bn'
              ? 'বাংলা এবং বাংলিশে নির্ভুল উত্তর, ক্যাটালগ প্রাইস যাচাই, ছবি দেখে প্রোডাক্ট ম্যাচিং এবং ক্যাশ অন ডেলিভারি অর্ডার সরাসরি কনফার্ম করুন।'
              : 'Grounded product prices in BDT, photo recognition, Banglish intent detection, and automated COD order placement with zero hallucination.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-950 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-md"
          >
            <Bot className="w-4 h-4 text-blue-900" />
            <span>{language === 'bn' ? 'সিমুলেটর চালু করুন' : 'Test Live Simulator'}</span>
          </button>
          <button
            onClick={() => setActiveNav('inbox')}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-800/70 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition-colors border border-blue-700/60"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Inbox</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{t('total_sales')}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ৳{analytics?.totalRevenue?.toLocaleString() || '6,000'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-semibold">{analytics?.ordersCount || 2} orders</span>
            <span>from recorded conversations</span>
          </div>
        </div>

        {/* Metric 2: Confirmed Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{t('confirmed_orders')}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {analytics?.confirmedOrders || 2}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-blue-800 font-semibold">{analytics?.conversionRate || '66.7'}%</span>
            <span>conversation conversion rate</span>
          </div>
        </div>

        {/* Metric 3: AI Handled Conversations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{t('ai_handled')}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {analytics?.aiHandled ?? 2} <span className="text-xs font-normal text-slate-400">/ {analytics?.totalConversations ?? 3}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-semibold">66% autonomous</span>
            <span>· 1 human escalated</span>
          </div>
        </div>

        {/* Metric 4: Average Response Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Avg Response Time</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            1.4 <span className="text-xs font-normal text-slate-400">seconds</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-semibold">99.8%</span>
            <span>within 24h Meta window</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Category Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Orders captured via AI Messenger conversations & manual entry</p>
            </div>
            <button
              onClick={() => setActiveNav('orders')}
              className="text-xs font-semibold text-blue-900 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{ord.deliveryCity}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900">৳{ord.total.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ord.orderStatus === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : ord.orderStatus === 'Processing'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded"
                        title="View printable invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Category Trends & Quota */}
        <div className="space-y-6">
          {/* Quota Progress */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Monthly Usage & Limit
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Messages Processed</span>
                  <span className="font-semibold text-slate-900">
                    {analytics?.messagesUsedThisMonth || 4280} / {analytics?.monthlyLimit || 15000}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-900 h-full rounded-full" style={{ width: '28.5%' }}></div>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">28.5% of Growth plan quota consumed</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Plan: Growth (৳2,500/mo)</span>
                <button
                  onClick={() => setActiveNav('subscription')}
                  className="text-blue-900 font-semibold hover:underline"
                >
                  Manage Plan
                </button>
              </div>
            </div>
          </div>

          {/* Top Inquiries by Category */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Customer Demand by Category
            </h4>
            <div className="space-y-2.5 text-xs">
              {(analytics?.topInquiredCategories || [
                { category: 'Panjabi', inquiries: 64, orders: 38 },
                { category: 'Saree', inquiries: 49, orders: 27 },
                { category: 'Kurti', inquiries: 31, orders: 19 },
                { category: 'Polo & Casuals', inquiries: 24, orders: 15 },
              ]).map((cat: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                  <span className="font-medium text-slate-700">{cat.category}</span>
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="text-slate-400">{cat.inquiries} inquiries</span>
                    <span className="font-semibold text-emerald-700">{cat.orders} orders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
