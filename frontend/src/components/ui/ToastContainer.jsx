import React from 'react';

export default function ToastContainer({ toasts }) {
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
        </div>
      ))}

      <style>{`
        .ui-toast-container {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none; /* Allows clicking through the container */
          align-items: center;
        }

        .ui-toast {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          padding: 12px 20px;
          border-radius: 100px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
          animation: uiToastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          border: 1px solid rgba(0,0,0,0.05);
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
      `}</style>
    </div>
  );
}
