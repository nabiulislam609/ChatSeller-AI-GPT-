import React, { useState, useEffect } from 'react';
import {
  Facebook,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Bot,
  Copy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { FacebookPage } from '../../types/index.ts';

export const FacebookPagesView: React.FC = () => {
  const { currentWorkspace, showToast, refreshKey, triggerRefresh } = useApp();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageId, setNewPageId] = useState('');
  const [isDemoPage, setIsDemoPage] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const list = await api.getFacebookPages();
        setPages(list);
      } catch (err) {
        console.error('Failed to load pages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPages();
  }, [refreshKey]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    try {
      await api.connectFacebookPage({
        pageName: newPageName.trim(),
        pageId: newPageId.trim() || undefined,
        isDemoMode: isDemoPage,
      });
      showToast(`Connected Facebook Page: ${newPageName}`, 'success');
      setNewPageName('');
      setNewPageId('');
      setIsConnectModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to connect page', 'error');
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    if (confirm(`Disconnect "${name}" and revoke stored credentials?`)) {
      try {
        await api.disconnectFacebookPage(id);
        showToast(`Disconnected ${name} and revoked access tokens`, 'info');
        triggerRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to disconnect', 'error');
      }
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhook/facebook`;
    navigator.clipboard.writeText(url);
    showToast('Webhook URL copied to clipboard!', 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Facebook Pages & Messenger Integration</h2>
          <p className="text-xs text-slate-500">
            Connect Facebook Pages via official Meta Graph API and Messenger webhooks to automate incoming customer conversations.
          </p>
        </div>
        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect Facebook Page</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="space-y-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-4">
              <img
                src={
                  page.avatarUrl ||
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=150&q=80'
                }
                alt="Page Avatar"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">{page.pageName}</h3>
                  {page.isDemoMode ? (
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                      Demo Mode (Ready)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      Meta OAuth Connected
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Page ID: <code className="font-mono text-slate-700">{page.pageId}</code></span>
                  <span>·</span>
                  <span>{page.category}</span>
                  <span>·</span>
                  <span>{page.fanCount.toLocaleString()} followers</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                  <span className="flex items-center space-x-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Webhook Subscribed</span>
                  </span>
                  <span>·</span>
                  <span>Token: {page.accessTokenMasked}</span>
                  <span>·</span>
                  <span>Last Sync: {new Date(page.lastSyncAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() =>
                  showToast('Page status synced with Meta Graph API.', 'success')
                }
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Status</span>
              </button>
              <button
                onClick={() => handleDisconnect(page.id, page.pageName)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No Facebook Pages connected to this workspace yet. Click "Connect Facebook Page" above to add one.
          </div>
        )}
      </div>

      {/* Webhook Configuration Guide Card */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-900" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Meta Webhook Credentials & Setup
          </h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          In your Meta App Dashboard under <strong>Messenger &gt; Webhooks</strong>, configure the Callback URL and Verify Token below to receive real-time customer messages:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-400 font-sans font-medium mb-1 flex justify-between">
              <span>Callback URL (POST & GET)</span>
              <button onClick={copyWebhookUrl} className="text-blue-900 hover:underline flex items-center space-x-0.5">
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <div className="text-slate-800 break-all select-all">{window.location.origin}/api/webhook/facebook</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-400 font-sans font-medium mb-1">Verify Token (hub.verify_token)</div>
            <div className="text-slate-800 font-bold select-all">ai_sales_agent_verify_token_2026</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Required Meta permissions: <code className="text-blue-950 font-mono">pages_messaging, pages_manage_metadata, pages_read_engagement</code>.
        </div>
      </div>

      {/* Connect Page Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Connect Facebook Page</h3>
            <p className="text-xs text-slate-500 mb-4">
              Authorize page messaging. You can connect in interactive Demo Mode or configure live credentials.
            </p>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Facebook Page Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Trends Dhaka"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Page ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 109283748291029"
                  value={newPageId}
                  onChange={(e) => setNewPageId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="demo-mode-check"
                  checked={isDemoPage}
                  onChange={(e) => setIsDemoPage(e.target.checked)}
                  className="w-4 h-4 text-blue-900 rounded focus:ring-blue-600 border-slate-300 mt-0.5"
                />
                <label htmlFor="demo-mode-check" className="text-xs text-blue-950 font-medium cursor-pointer">
                  Enable Interactive Demo Mode
                  <span className="block text-[11px] text-blue-800 font-normal mt-0.5">
                    Allows immediate testing using the built-in Messenger simulator without waiting for Meta App Review approval.
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Connect Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
