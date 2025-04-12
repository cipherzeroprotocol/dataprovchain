import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const notificationIdCounter = useRef(0);

  const addNotification = useCallback((notification) => {
    const id = notificationIdCounter.current++;
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      title: notification.title,
      duration: notification.duration || 5000, // Default 5 seconds
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto dismiss notification after duration if not persistent
    if (newNotification.duration !== 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [dismissNotification]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const dismissAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper functions for common notification types
  const notify = useCallback((message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  const success = useCallback((message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  const contextValue = {
    notifications,
    addNotification,
    dismissNotification,
    dismissAllNotifications,
    notify,
    success,
    error,
    warning,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
