import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Zap, Play, CheckCircle2, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { AutomationRule } from '../../types/index.ts';

export const AutomationRulesView: React.FC = () => {
  const { showToast, refreshKey, triggerRefresh } = useApp();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<AutomationRule['trigger']>('price_inquiry');
  const [action, setAction] = useState<AutomationRule['action']>('ai_reply');
  const [keyword, setKeyword] = useState('price');
  const [actionPayload, setActionPayload] = useState('Send catalog price and available sizes');

  useEffect(() => {
    const loadRules = async () => {
      try {
        const list = await api.getAutomationRules();
        setRules(list);
      } catch (err) {
        console.error('Failed to load rules:', err);
      }
    };
    loadRules();
  }, [refreshKey]);

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await api.updateAutomationRule(rule.id, { enabled: !rule.enabled });
      showToast(
        rule.enabled ? `Disabled rule: ${rule.name}` : `Enabled rule: ${rule.name}`,
        'info'
      );
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update rule', 'error');
    }
  };

  const handleDelete = async (id: string, ruleName: string) => {
    if (confirm(`Delete rule "${ruleName}"?`)) {
      try {
        await api.deleteAutomationRule(id);
        showToast('Rule deleted', 'info');
        triggerRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete rule', 'error');
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createAutomationRule({
        name: name.trim(),
        trigger,
        conditions: [{ field: 'message', operator: 'contains', value: keyword }],
        action,
        actionPayload,
        enabled: true,
      });
      showToast(`Created automation rule: ${name}`, 'success');
      setIsModalOpen(false);
      setName('');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to create rule', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Automation Rules Engine</h2>
          <p className="text-xs text-slate-500">
            Define triggers, conditions, and automated actions for incoming Facebook Messenger interactions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Automation Rule</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span>
                <h3 className="font-bold text-xs text-slate-900">{rule.name}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    rule.enabled
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {rule.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              {/* Logic Flow Badge */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono text-[11px]">
                  IF Trigger: <strong className="font-semibold text-slate-900">{rule.trigger}</strong>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md font-mono text-[11px]">
                  THEN Action: <strong className="font-semibold text-blue-950">{rule.action}</strong>
                </span>
              </div>

              {rule.actionPayload && (
                <div className="text-[11px] text-slate-500 italic pl-1">
                  Payload: "{rule.actionPayload}"
                </div>
              )}

              <div className="text-[10px] text-slate-400 pt-1 flex items-center space-x-2">
                <span>Executed {rule.executionCount} times</span>
                {rule.lastExecutedAt && (
                  <span>· Last run: {new Date(rule.lastExecutedAt).toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => handleToggle(rule)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  rule.enabled
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    : 'bg-blue-900 text-white hover:bg-blue-800 border-blue-900'
                }`}
              >
                {rule.enabled ? 'Pause' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(rule.id, rule.name)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Create Automation Rule</h3>
            <p className="text-slate-500 mb-4">
              Configure event trigger and automated action for incoming Messenger messages.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Price inquiry auto-responder"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Trigger Event</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="price_inquiry">Price Inquiry Detected</option>
                  <option value="stock_inquiry">Stock or Size Inquiry</option>
                  <option value="order_intent">Order Intent Detected ("Order korbo")</option>
                  <option value="image_received">Image Attachment Received</option>
                  <option value="outside_hours">Message Received Outside Business Hours</option>
                  <option value="messenger_message">Any Messenger Message</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Condition Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. price, koto, dam, size"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Action to Execute</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ai_reply">Generate Grounded AI Reply</option>
                  <option value="send_template">Send Approved Response Template</option>
                  <option value="recommend_product">Recommend Matching Catalog Product</option>
                  <option value="create_draft_order">Capture Details & Create Draft Order</option>
                  <option value="escalate_human">Escalate to Human Moderator</option>
                  <option value="add_tag">Add Customer Tag</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Action Description / Payload</label>
                <input
                  type="text"
                  value={actionPayload}
                  onChange={(e) => setActionPayload(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
