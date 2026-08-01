'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastContextType {
  toast: {
    success: (msg: string, action?: ToastAction) => void;
    error: (msg: string, action?: ToastAction) => void;
    info: (msg: string, action?: ToastAction) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const add = useCallback((message: string, variant: ToastVariant, action?: ToastAction) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, variant, action }]);
    const timer = setTimeout(() => remove(id), 4000);
    timers.current.set(id, timer);
  }, [remove]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => { timers.current.forEach((t) => clearTimeout(t)); };
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant, action?: ToastAction) => {
    add(message, variant, action);
  }, [add]);

  const toastApi = {
    success: (msg: string, action?: ToastAction) => toast(msg, 'success', action),
    error: (msg: string, action?: ToastAction) => toast(msg, 'error', action),
    info: (msg: string, action?: ToastAction) => toast(msg, 'info', action),
  };

  return (
    <ToastContext.Provider value={{ toast: toastApi }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto animate-in slide-in-from-right-2 fade-in
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm max-w-sm
              transition-all duration-300
              ${t.variant === 'success' ? 'bg-success/10 border-success/30 text-success' : ''}
              ${t.variant === 'error' ? 'bg-destructive/10 border-destructive/30 text-destructive' : ''}
              ${t.variant === 'info' ? 'bg-card border-border text-foreground' : ''}
            `}
            style={{ animation: 'slideIn 0.2s ease-out' }}
          >
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); remove(t.id); }}
                className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground ml-1"
              aria-label="Dismiss"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
