import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ show: false, message: '', fading: false });
  const notificationTimeoutRef = useRef(null);

  const showNotification = (message) => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Show the new notification immediately
    setNotification({ show: true, message, fading: false });
    
    // Set a new timeout for 3 seconds to start fading
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, fading: true }));
      
      // After fade animation completes, hide the notification
      setTimeout(() => {
        setNotification({ show: false, message: '', fading: false });
        notificationTimeoutRef.current = null;
      }, 300); // 300ms for fade-out animation
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    notification,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
