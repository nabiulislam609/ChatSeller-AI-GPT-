import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Facebook,
  ShoppingBag,
  ShoppingCart,
  Users,
  Sliders,
  HelpCircle,
  MessageCircleQuestion,
  BarChart3,
  UserCheck,
  Settings,
  CreditCard,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Store,
  Check,
} from 'lucide-react';
import { useApp, NavigationItem } from '../../context/AppContext.tsx';

export const Sidebar: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    currentWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    user,
    t,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useApp();

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [newStoreModalOpen, setNewStoreModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');

  const navItems: { id: NavigationItem; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'inbox', label: t('inbox'), icon: MessageSquare, badge: '1' },
    { id: 'ai-agent', label: t('ai-agent'), icon: Bot },
    { id: 'facebook-pages', label: t('facebook-pages'), icon: Facebook },
    { id: 'products', label: t('products'), icon: ShoppingBag },
    { id: 'orders', label: t('orders'), icon: ShoppingCart },
    { id: 'customers', label: t('customers'), icon: Users },
    { id: 'automation-rules', label: t('automation-rules'), icon: Sliders },
    { id: 'knowledge-base', label: t('knowledge-base'), icon: BookOpen },
    { id: 'comments-automation', label: t('comments-automation'), icon: MessageCircleQuestion },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'team', label: t('team'), icon: UserCheck },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'subscription', label: t('subscription'), icon: CreditCard },
    { id: 'help-docs', label: t('help-docs'), icon: HelpCircle },
  ];

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    await createWorkspace(newStoreName.trim());
    setNewStoreName('');
    setNewStoreModalOpen(false);
    setIsStoreMenuOpen(false);
  };

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header & Workspace Selector */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="relative flex-1 mr-2">
            <button
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200/60"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <Bot className="w-4 h-4 text-blue-200" />
                </div>
                <div className="text-left truncate">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {currentWorkspace?.name || 'AI Sales Agent'}
                  </div>
                  <div className="text-[11px] text-slate-500">BD E-Commerce</div>
                </div>
              </div>
              <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Store dropdown */}
            {isStoreMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Workspaces / Stores
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsStoreMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="truncate font-medium text-slate-700">{ws.name}</span>
                    {ws.id === currentWorkspace?.id && (
                      <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setNewStoreModalOpen(true);
                      setIsStoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-blue-800 font-medium hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Store</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {sidebarCollapsed && (
          <div className="mx-auto w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
            <Bot className="w-5 h-5 text-blue-200" />
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!sidebarCollapsed && item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{user?.fullName || 'Nabin Hasan'}</div>
              <div className="text-[11px] text-slate-400 truncate flex items-center space-x-1.5">
                <span>{user?.role || 'Owner'}</span>
                <span>·</span>
                <span className="text-emerald-600 font-medium">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Store Modal */}
      {newStoreModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-2">Create New Store Workspace</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new Bangladeshi e-commerce brand or store. Each workspace has isolated products, orders, and Facebook pages.
            </p>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Denim & Casuals"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewStoreModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-sm"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
