import React, { useEffect } from 'react';
import './Toast.css';

// Toast supports either a simple `message` string, or a richer layout using
// `title` and `subtitle`. `icon` can be 'check' or 'error' to show a circular
// badge above the text (used by the cart confirmation design).
const Toast = ({ message, title, subtitle, icon, type = 'success', position = 'center', onClose, duration = 2000 }) => {
  const visible = Boolean(message || title || subtitle);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast ${type} ${icon ? 'with-icon' : ''} pos-${position}`} role="status" aria-live="polite">
      {icon && (
        <div className={`toast-icon ${icon}`} aria-hidden>
          {icon === 'check' ? (
            <span className="check">✓</span>
          ) : (
            <span className="cross">✕</span>
          )}
        </div>
      )}

      <div className="toast-text">
        {title ? <div className="toast-title">{title}</div> : (message && <div className="toast-title">{message}</div>)}
        {subtitle && <div className="toast-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default Toast;
