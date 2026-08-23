import React from 'react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="ui-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`ui-toast ui-toast-${toast.type}`}>
          <div className="ui-toast-icon">
            {toast.type === 'success' && <i className="fa-solid fa-circle-check"></i>}
            {toast.type === 'error' && <i className="fa-solid fa-circle-exclamation"></i>}
            {toast.type === 'info' && <i className="fa-solid fa-circle-info"></i>}
          </div>
          <div className="ui-toast-message">{toast.message}</div>
          <button className="ui-toast-close" onClick={() => onDismiss?.(toast.id)} aria-label="Tutup notifikasi"><i className="fa-solid fa-xmark"></i></button>
          <span className="ui-toast-progress" />
        </div>
      ))}

      <style>{`
        .ui-toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none; /* Allows clicking through the container */
          align-items: stretch;
        }

        .ui-toast {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          min-width: min(360px, calc(100vw - 40px));
          max-width: 440px;
          padding: 15px 44px 15px 16px;
          border-radius: 14px;
          box-shadow: 0 18px 50px -18px rgba(24, 36, 32, 0.45);
          pointer-events: auto;
          animation: uiToastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
          position: relative;
        }

        .ui-toast-success .ui-toast-icon { color: #10b981; }
        .ui-toast-error .ui-toast-icon { color: #ef4444; }
        .ui-toast-info .ui-toast-icon { color: #3b82f6; }

        .ui-toast-icon {
          font-size: 16px;
          display: flex;
        }

        .ui-toast-message {
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--ink, #182420);
        }
        .ui-toast-close { position: absolute; right: 10px; top: 10px; width: 28px; height: 28px; border: 0; border-radius: 50%; background: rgba(0,0,0,.05); color: #655f59; cursor: pointer; }
        .ui-toast-progress { position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; background: currentColor; opacity: .45; transform-origin: left; animation: uiToastProgress 3s linear forwards; }
        .ui-toast-success { color: #10b981; border-left: 4px solid #10b981; }
        .ui-toast-error { color: #ef4444; border-left: 4px solid #ef4444; }
        .ui-toast-info { color: #3b82f6; border-left: 4px solid #3b82f6; }

        @keyframes uiToastSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes uiToastProgress { to { transform: scaleX(0); } }
        @media (max-width: 520px) { .ui-toast-container { left: 12px; right: 12px; top: 12px; } .ui-toast { min-width: 0; } }
      `}</style>
    </div>
  );
}
