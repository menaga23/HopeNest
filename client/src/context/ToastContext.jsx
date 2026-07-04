import React, { createContext, useState, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [timerId, setTimerId] = useState(null);

  // Trigger alert banner
  const showToast = (message, type = 'success') => {
    // Clear existing timer if active
    if (timerId) clearTimeout(timerId);

    setToast({ message, type });

    const id = setTimeout(() => {
      setToast(null);
    }, 4000); // dismiss after 4 seconds
    setTimerId(id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-hn-accent" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-hn-primary" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification card */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-hn-dark dark:bg-hn-white text-hn-white dark:text-hn-dark px-5 py-4 rounded-2xl shadow-2xl border border-hn-primary/20 animate-fadeIn slide-in-bottom max-w-sm">
          {getIcon(toast.type)}
          <span className="text-xs sm:text-sm font-semibold tracking-wide flex-1">
            {toast.message}
          </span>
          <button 
            onClick={() => setToast(null)}
            className="p-1 hover:bg-hn-white/10 dark:hover:bg-hn-dark/10 rounded-full transition-colors text-hn-secondary dark:text-hn-dark/70"
            aria-label="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be declared inside a <ToastProvider> wrapper.');
  }
  return context;
};
