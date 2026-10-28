import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { SubscriptionUsage } from '../../types/index.ts';

const PLANS = [
  {
    name: 'Free Trial' as const,
    priceBdt: '৳0',
    cycle: '14 Days Trial',
    messages: '2,000 messages / mo',
    pages: '1 Facebook Page',
    features: ['Basic AI conversational replies', 'Catalog grounding up to 20 items', 'Community support'],
  },
  {
    name: 'Starter' as const,
    priceBdt: '৳1,200',
    cycle: 'per month',
    messages: '5,000 messages / mo',
    pages: '2 Facebook Pages',
    features: [
      'Gemini 3.8 Flash sales agent',
      'Image product matching (Vision)',
      'COD order automation',
      'Email & WhatsApp support',
    ],
  },
  {
    name: 'Growth' as const,
    popular: true,
    priceBdt: '৳2,500',
    cycle: 'per month',
    messages: '15,000 messages / mo',
    pages: '5 Facebook Pages',
    features: [
      'All Starter capabilities',
      'Advanced Banglish & Bengali comprehension',
      'Unlimited catalog products',
      'Human handoff priority routing',
      'Comments-to-Messenger automation',
    ],
  },
  {
    name: 'Pro' as const,
    priceBdt: '৳5,000',
    cycle: 'per month',
    messages: '50,000 messages / mo',
    pages: '15 Facebook Pages',
    features: [
      'Dedicated enterprise infrastructure',
      'Custom fine-tuned agent persona',
      'Priority Pathao/Steadfast webhooks',
      'Dedicated account manager in Dhaka',
    ],
  },
];

export const SubscriptionView: React.FC = () => {
  const { currentWorkspace, showToast, refreshKey, triggerRefresh } = useApp();
  const [sub, setSub] = useState<SubscriptionUsage | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSubscription();
        setSub(data);
      } catch (err) {
        console.error('Failed to load subscription:', err);
      }
    };
    load();
  }, [refreshKey]);

  const handleSelectPlan = async (plan: SubscriptionUsage['plan']) => {
    setIsUpgrading(true);
    try {
      await api.upgradeSubscription(plan);
      showToast(`Workspace upgraded to ${plan} plan!`, 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to switch plan', 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

  const percentUsed = sub ? Math.round((sub.messagesUsedThisMonth / sub.monthlyMessageLimit) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Subscription & Message Quota</h2>
          <p className="text-xs text-slate-500">
            Scale your conversational throughput as your Bangladeshi e-commerce volume grows.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Current Plan:</span>
          <div className="text-base font-bold text-blue-900">{sub?.plan || 'Growth'}</div>
        </div>
      </div>

      {/* Usage Meter Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
          Current Month Consumption
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 font-medium">Messenger Inbound & AI Replies</span>
            <span className="font-bold text-slate-900">
              {sub?.messagesUsedThisMonth?.toLocaleString() || '4,280'} / {sub?.monthlyMessageLimit?.toLocaleString() || '15,000'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 80 ? 'bg-amber-500' : 'bg-blue-900'
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{percentUsed}% of allowance used</span>
            <span>Billing cycle renews on {sub ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = sub?.plan === plan.name;
          return (
            <div
              key={plan.name}
              className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'border-blue-900 ring-2 ring-blue-900/10 shadow-md relative'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 right-4 bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Popular in BD
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-2xl font-extrabold text-blue-950">{plan.priceBdt}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">{plan.cycle}</span>
                  </div>
                </div>

                <div className="py-2 border-y border-slate-100 text-xs font-semibold text-slate-700 space-y-1">
                  <div>• {plan.messages}</div>
                  <div>• {plan.pages}</div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={isCurrent || isUpgrading}
                  className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : plan.popular
                      ? 'bg-blue-900 hover:bg-blue-800 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
