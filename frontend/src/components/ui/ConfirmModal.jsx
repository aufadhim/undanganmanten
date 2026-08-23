import React from 'react';

export default function ConfirmModal({ title, message, confirmText, cancelText, danger, onConfirm, onCancel }) {
  return (
    <div className="ui-modal-overlay">
      <div className="ui-modal-content">
        <div className="ui-modal-header">
          <h3>{title || 'Konfirmasi'}</h3>
        </div>
        <div className="ui-modal-body">
          <p>{message}</p>
        </div>
        <div className="ui-modal-footer">
          <button className="ui-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`ui-btn-confirm ${danger ? 'danger' : ''}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
      
      <style>{`
        .ui-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(24, 36, 32, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: uiFadeIn 0.25s ease;
        }
        
        .ui-modal-content {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 24px 50px -12px rgba(24, 36, 32, 0.25);
          animation: uiScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ui-modal-header h3 {
          margin: 0 0 12px 0;
          font-family: 'Fraunces', serif;
          font-size: 20px;
          color: var(--ink, #182420);
        }

        .ui-modal-body p {
          margin: 0;
          font-size: 14.5px;
          color: var(--ink-soft, #5b6863);
          line-height: 1.6;
        }

        .ui-modal-footer {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .ui-btn-cancel, .ui-btn-confirm {
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ui-btn-cancel {
          background: transparent;
          color: var(--ink-soft, #5b6863);
        }
        .ui-btn-cancel:hover {
          background: rgba(0,0,0,0.05);
          color: var(--ink, #182420);
        }

        .ui-btn-confirm {
          background: var(--wine, #7a2436);
          color: #ffffff;
        }
        .ui-btn-confirm:hover {
          background: #5e1928;
          transform: translateY(-1px);
        }
        .ui-btn-confirm.danger {
          background: #dc2626;
        }
        .ui-btn-confirm.danger:hover {
          background: #b91c1c;
        }

        @keyframes uiFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes uiScaleUp {
          from { opacity: 0; transform: translateY(15px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
