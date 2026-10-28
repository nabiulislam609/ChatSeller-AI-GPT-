import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Workspace } from '../types/index.ts';
import { api, setActiveWorkspaceId, getActiveWorkspaceId } from '../services/api.ts';

export type NavigationItem =
  | 'overview'
  | 'inbox'
  | 'ai-agent'
  | 'facebook-pages'
  | 'products'
  | 'orders'
  | 'customers'
  | 'automation-rules'
  | 'knowledge-base'
  | 'comments-automation'
  | 'analytics'
  | 'team'
  | 'settings'
  | 'subscription'
  | 'help-docs';

export type Language = 'en' | 'bn';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  activeNav: NavigationItem;
  setActiveNav: (nav: NavigationItem) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    overview: 'Overview',
    inbox: 'Inbox',
    'ai-agent': 'AI Sales Agent',
    'facebook-pages': 'Facebook Pages',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    'automation-rules': 'Automation Rules',
    'knowledge-base': 'FAQ & Knowledge Base',
    'comments-automation': 'Comments Automation',
    analytics: 'Analytics & Reports',
    team: 'Team & Moderators',
    settings: 'Settings',
    subscription: 'Subscription & Usage',
    'help-docs': 'Help & Documentation',
    live_simulator: 'Live Messenger Simulator',
    demo_mode: 'Demo Mode Active',
    connected: 'Connected',
    disconnected: 'Disconnected',
    save_changes: 'Save Changes',
    cancel: 'Cancel',
    create: 'Create',
    export: 'Export',
    import_csv: 'Import CSV / XLSX',
    total_sales: 'Total Revenue',
    confirmed_orders: 'Confirmed Orders',
    conversion_rate: 'Conversion Rate',
    ai_handled: 'AI Handled',
    human_escalated: 'Human Escalated',
    currency_bdt: '৳',
  },
  bn: {
    overview: 'ওভারভিউ',
    inbox: 'ইনবক্স',
    'ai-agent': 'এআই সেলস এজেন্ট',
    'facebook-pages': 'ফেসবুক পেজ',
    products: 'পণ্য ক্যাটালগ',
    orders: 'অর্ডার সমূহ',
    customers: 'কাস্টমার তালিকা',
    'automation-rules': 'অটোমেশন রুলস',
    'knowledge-base': 'এফএকিউ ও নলেজ বেস',
    'comments-automation': 'কমেন্ট অটোমেশন',
    analytics: 'অ্যানালিটিক্স ও রিপোর্ট',
    team: 'টিম ও মডারেটর',
    settings: 'সেটিংস ও ডেলিভারি',
    subscription: 'সাবস্ক্রিপশন ও ব্যবহার',
    'help-docs': 'হেল্প ও ডকুমেন্টস',
    live_simulator: 'লাইভ মেসেঞ্জার সিমুলেটর',
    demo_mode: 'ডেমো মোড সক্রিয়',
    connected: 'সংযুক্ত',
    disconnected: 'বিচ্ছিন্ন',
    save_changes: 'পরিবর্তন সংরক্ষণ করুন',
    cancel: 'বাতিল',
    create: 'তৈরি করুন',
    export: 'এক্সপোর্ট',
    import_csv: 'সিএসভি ইমপোর্ট',
    total_sales: 'সর্বমোট আয়',
    confirmed_orders: 'নিশ্চিত অর্ডার',
    conversion_rate: 'কনভার্সন রেট',
    ai_handled: 'এআই নিয়ন্ত্রিত',
    human_escalated: 'হ্যান্ডওভার',
    currency_bdt: '৳',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeNav, setActiveNav] = useState<NavigationItem>('overview');
  const [language, setLanguage] = useState<Language>('bn');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const loadInitialAuth = async () => {
    try {
      const data = await api.getAuthMe();
      setUser(data.user);
      setWorkspaces(data.workspaces);
      setCurrentWorkspace(data.currentWorkspace);
      if (data.currentWorkspace) {
        setActiveWorkspaceId(data.currentWorkspace.id);
      }
    } catch (err) {
      console.error('Failed to load auth:', err);
    }
  };

  useEffect(() => {
    loadInitialAuth();
  }, [refreshKey]);

  const switchWorkspace = async (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    await loadInitialAuth();
    showToast(`Switched workspace to ${workspaces.find((w) => w.id === workspaceId)?.name || workspaceId}`, 'info');
  };

  const createWorkspace = async (name: string) => {
    try {
      const newWs = await api.createWorkspace(name);
      setActiveWorkspaceId(newWs.id);
      await loadInitialAuth();
      showToast(`Created new store workspace: ${name}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create workspace', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentWorkspace,
        workspaces,
        activeNav,
        setActiveNav,
        language,
        setLanguage,
        t,
        switchWorkspace,
        createWorkspace,
        toasts,
        showToast,
        dismissToast,
        isSimulatorOpen,
        setIsSimulatorOpen,
        refreshKey,
        triggerRefresh,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
