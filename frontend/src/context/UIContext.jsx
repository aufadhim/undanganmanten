import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import ToastContainer from '../components/ui/ToastContainer.jsx';

const UIContext = createContext();

export function UIProvider({ children }) {
  // --- Toast State ---
  const [toasts, setToasts] = useState([]);
  let toastIdCounter = useRef(0);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastIdCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info')
  };

  // --- Confirm Modal State ---
  const [confirmConfig, setConfirmConfig] = useState(null);

  const confirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        title,
        message,
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        danger: options.danger || false,
        onConfirm: () => {
          setConfirmConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
      {confirmConfig && <ConfirmModal {...confirmConfig} />}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
