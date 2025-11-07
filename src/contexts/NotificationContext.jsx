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
  const [notification, setNotification] = useState({ show: false, message: '', fading: false, type: null });
  const notificationTimeoutRef = useRef(null);
  const messageAudioRef = useRef(null);
  const passAudioRef = useRef(null);

  // Preload both audio files when component mounts
  useEffect(() => {
    try {
      // Preload regular message sound
      const messageAudio = new Audio('/sounds/message.wav');
      messageAudio.volume = 0.5;
      messageAudio.preload = 'auto';
      messageAudio.load();
      messageAudioRef.current = messageAudio;

      // Preload pass sound
      const passAudio = new Audio('/sounds/pass.wav');
      passAudio.volume = 0.5;
      passAudio.preload = 'auto';
      passAudio.load();
      passAudioRef.current = passAudio;
    } catch (error) {
      console.log('Notification sound initialization error:', error);
    }

    return () => {
      // Cleanup
      if (messageAudioRef.current) {
        messageAudioRef.current.pause();
        messageAudioRef.current = null;
      }
      if (passAudioRef.current) {
        passAudioRef.current.pause();
        passAudioRef.current = null;
      }
    };
  }, []);

  // Function to play notification sound from .wav file
  const playNotificationSound = (isPass = false) => {
    try {
      const audio = isPass ? passAudioRef.current : messageAudioRef.current;
      if (!audio) return;
      
      // Reset to beginning if already playing
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
      
      // Play the sound
      audio.play().catch(error => {
        // Silently fail if audio cannot play (e.g., user interaction required)
        console.log('Notification sound could not play:', error);
      });
    } catch (error) {
      // Silently fail if audio is not available
      console.log('Notification sound error:', error);
    }
  };

  const showNotification = (message, type = null) => {
    // Determine if this is a pass/success notification
    const isPass = type === 'success' || type === 'pass' || 
                   message.toLowerCase().includes('pass') ||
                   message.toLowerCase().includes('great work') ||
                   message.toLowerCase().includes('excellent');
    
    // Play appropriate notification sound
    playNotificationSound(isPass);
    
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Show the new notification immediately
    setNotification({ 
      show: true, 
      message, 
      fading: false, 
      type: isPass ? 'success' : type 
    });
    
    // Set a new timeout for 3 seconds to start fading
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, fading: true }));
      
      // After fade animation completes, hide the notification
      setTimeout(() => {
        setNotification({ show: false, message: '', fading: false, type: null });
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
