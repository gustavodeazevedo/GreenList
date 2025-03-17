import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', type: 'success' });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification({ message: '', type: 'success' });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess: (message) => showNotification(message, 'success'),
        showError: (message) => showNotification(message, 'error'),
        hideNotification
      }}
    >
      {children}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);