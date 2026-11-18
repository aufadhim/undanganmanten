import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import ToastContainer from '../components/ui/ToastContainer.jsx';
import {notificationStore,toastApi} from '../utils/notifications.js';

const UIContext = createContext();

export function UIProvider({ children }) {
  const toasts=useSyncExternalStore(notificationStore.subscribe,notificationStore.getSnapshot);
  const toast=toastApi;

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
      <ToastContainer toasts={toasts} onDismiss={toast.dismiss} />
      {confirmConfig && <ConfirmModal {...confirmConfig} />}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
