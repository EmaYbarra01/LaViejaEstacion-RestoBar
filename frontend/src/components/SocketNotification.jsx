import { useEffect, useState } from 'react';
import './SocketNotification.css';

const SocketNotification = ({ message, type = 'info', duration = 3000 }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return '🔔';
    }
  };

  return (
    <div className={`socket-notification ${type}`}>
      <span className="notification-icon">{getIcon()}</span>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={() => setShow(false)}>
        ✕
      </button>
    </div>
  );
};

export default SocketNotification;
