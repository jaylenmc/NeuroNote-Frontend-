import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NotificationSignup.css';

const WAITLIST_CONTENT = {
  true: {
    title: "You're on the waitlist!",
    message:
      "You've successfully signed up for notifications from NeuroNote through email. We'll let you know when the app is ready for you to use.",
  },
  false: {
    title: "You're already on the waitlist",
    message:
      "This email is already in our system. We'll notify you when NeuroNote is ready for you to use.",
  },
};

function NotificationSignup() {
  const location = useLocation();
  const isNewWaitlistSignup = location.state?.waitlist !== false;
  const content = isNewWaitlistSignup ? WAITLIST_CONTENT.true : WAITLIST_CONTENT.false;

  return (
    <div className="notification-signup-container">
      <div className="notification-signup-card">
        <div
          className={`notification-signup-icon ${
            isNewWaitlistSignup ? '' : 'notification-signup-icon--existing'
          }`}
        >
          ✓
        </div>
        <h1 className="notification-signup-title">{content.title}</h1>
        <p className="notification-signup-message">{content.message}</p>
        <Link to="/" className="notification-signup-button">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default NotificationSignup;
