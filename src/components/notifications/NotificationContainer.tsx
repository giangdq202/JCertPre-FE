import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />;
      case 'error':
        return <FaTimesCircle className="text-red-500 text-xl flex-shrink-0" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500 text-xl flex-shrink-0" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500 text-xl flex-shrink-0" />;
      default:
        return <FaInfoCircle className="text-blue-500 text-xl flex-shrink-0" />;
    }
  };

  const getBackgroundClass = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColorClass = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  const getCloseButtonClass = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-400 hover:text-green-600';
      case 'error':
        return 'text-red-400 hover:text-red-600';
      case 'warning':
        return 'text-yellow-400 hover:text-yellow-600';
      case 'info':
        return 'text-blue-400 hover:text-blue-600';
      default:
        return 'text-blue-400 hover:text-blue-600';
    }
  };

  return (
    <div 
      className={`
        ${getBackgroundClass()} 
        border rounded-lg p-4 mb-3 shadow-lg transition-all duration-300 ease-in-out
        transform animate-slideInRight max-w-md w-full
      `}
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${getTextColorClass()}`}>
            {notification.title}
          </div>
          {notification.message && (
            <div className={`text-sm mt-1 ${getTextColorClass()} opacity-90`}>
              {notification.message}
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className={`${getCloseButtonClass()} transition-colors duration-200 p-1 rounded hover:bg-white hover:bg-opacity-50`}
          aria-label="Đóng thông báo"
        >
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ 
  notifications, 
  onClose 
}) => {
  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="fixed top-20 right-5 z-50 space-y-2 max-h-screen overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={onClose}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationContainer;
