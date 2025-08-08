import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationContainer, { Notification, NotificationType } from './NotificationContainer';

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message?: string, options?: NotificationOptions) => void;
  success: (title: string, message?: string, options?: NotificationOptions) => void;
  error: (title: string, message?: string, options?: NotificationOptions) => void;
  warning: (title: string, message?: string, options?: NotificationOptions) => void;
  info: (title: string, message?: string, options?: NotificationOptions) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

interface NotificationOptions {
  duration?: number;
  persistent?: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    options?: NotificationOptions
  ) => {
    const id = generateId();
    const duration = options?.duration ?? (type === 'error' ? 6000 : 4000);
    const persistent = options?.persistent ?? false;

    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      persistent
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after duration if not persistent
    if (!persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [generateId, removeNotification]);

  const success = useCallback((title: string, message?: string, options?: NotificationOptions) => {
    showNotification('success', title, message, options);
  }, [showNotification]);

  const error = useCallback((title: string, message?: string, options?: NotificationOptions) => {
    showNotification('error', title, message, options);
  }, [showNotification]);

  const warning = useCallback((title: string, message?: string, options?: NotificationOptions) => {
    showNotification('warning', title, message, options);
  }, [showNotification]);

  const info = useCallback((title: string, message?: string, options?: NotificationOptions) => {
    showNotification('info', title, message, options);
  }, [showNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    success,
    error,
    warning,
    info,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
