import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationItem: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  const iconMap = {
    success: <FaCheckCircle className="text-green-500" />,
    error: <FaExclamationCircle className="text-red-500" />,
    warning: <FaExclamationTriangle className="text-yellow-500" />,
    info: <FaInfoCircle className="text-blue-500" />
  };

  const bgColorMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColorMap = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  const subtextColorMap = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`
      ${bgColorMap[notification.type]} 
      border-l-4 p-4 rounded-lg shadow-lg 
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl hover:scale-[1.02]
      animate-slideInRight
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {iconMap[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${textColorMap[notification.type]}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`text-sm mt-1 ${subtextColorMap[notification.type]}`}>
              {notification.message}
            </p>
          )}
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            onClick={() => onClose(notification.id)}
            className={`
              inline-flex rounded-md p-1.5 
              ${textColorMap[notification.type]} 
              hover:bg-white hover:bg-opacity-20
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              transition-colors duration-200
            `}
          >
            <FaTimes className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      autoClose: true,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.autoClose) {
      setTimeout(() => {
        hideNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration = 4000) => {
    showNotification({ type: 'success', title, message, duration });
  }, [showNotification]);

  const error = useCallback((title: string, message?: string, duration = 6000) => {
    showNotification({ type: 'error', title, message, duration });
  }, [showNotification]);

  const warning = useCallback((title: string, message?: string, duration = 5000) => {
    showNotification({ type: 'warning', title, message, duration });
  }, [showNotification]);

  const info = useCallback((title: string, message?: string, duration = 4000) => {
    showNotification({ type: 'info', title, message, duration });
  }, [showNotification]);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={hideNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
