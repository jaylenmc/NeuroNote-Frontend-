import React from 'react';
import { Lock } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const GlobalNotification = () => {
    const { notification } = useNotification();
    
    if (!notification.show) return null;

    // Determine if this is a "Coming Soon" notification
    const isComingSoon = notification.message === 'Coming Soon!';
    const backgroundColor = isComingSoon ? '#7c83fd' : (notification.type === 'success' ? '#10b981' : '#f44336');

    return (
        <div 
            className="global-notification" 
            style={{ 
                backgroundColor: backgroundColor,
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                zIndex: 3000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                animation: notification.fading ? 'slideOutRight 0.3s ease' : 'slideInRight 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: notification.fading ? 0 : 1,
                transition: 'opacity 0.3s ease'
            }}
        >
            {isComingSoon && <Lock size={16} />}
            {notification.message}
        </div>
    );
};

export default GlobalNotification;
