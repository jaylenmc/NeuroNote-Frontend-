import React from 'react';
import { Link } from 'react-router-dom';
import './NotificationSignup.css';

function NotificationSignup() {
  return (
    <div className="notification-signup-container">
      <div className="notification-signup-card">
        <div className="notification-signup-icon">✓</div>
        <h1 className="notification-signup-title">You're on the waitlist!</h1>
        <p className="notification-signup-message">
          You've successfully signed up for notifications from NeuroNote through email.
          We'll let you know when the app is ready for you to use.
        </p>
        <Link to="/" className="notification-signup-button">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default NotificationSignup;

