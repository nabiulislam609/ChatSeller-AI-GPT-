import React from 'react';
import { Bot, RotateCcw, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';

export const Header: React.FC = () => {
  const {
    activeNav,
    currentWorkspace,
    language,
    setLanguage,
    t,
    setIsSimulatorOpen,
    showToast,
    triggerRefresh,
  } = useApp();

  const handleResetDemo = async () => {
    if (confirm('Reset platform data back to demo state (Aura Trends Dhaka)?')) {
      try {
        await api.resetDemo();
        showToast('Demo store data successfully reset', 'info');
        triggerRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to reset demo', 'error');
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Title & Path */}
      <div className="flex items-center space-x-3">
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight capitalize">
            {t(activeNav)}
          </h1>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span>{currentWorkspace?.name || 'Aura Trends Dhaka'}</span>
            <span>·</span>
            <span className="flex items-center space-x-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Messenger AI Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {/* Language Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'en'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('bn')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'bn'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            বাংলা
          </button>
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-[11px] font-medium text-blue-800">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Demo Mode (Interactive)</span>
        </div>

        {/* Reset Demo button */}
        <button
          onClick={handleResetDemo}
          title="Reset database to default sample catalog and conversations"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Live Simulator Launcher */}
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-all shadow-xs"
        >
          <Bot className="w-4 h-4 text-blue-200" />
          <span>{language === 'bn' ? 'মেসেঞ্জার টেস্ট করুন' : 'Test Live Messenger'}</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </button>
      </div>
    </header>
  );
};
