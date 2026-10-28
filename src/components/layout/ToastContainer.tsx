import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between space-x-3 px-4 py-3 rounded-lg shadow-lg border text-xs max-w-sm transition-all transform animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-slate-900 text-white border-slate-800'
                : isError
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
              <span className="font-medium leading-relaxed">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
