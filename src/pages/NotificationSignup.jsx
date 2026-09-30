import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import BrainLoader from '../components/BrainLoader';
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
  const [searchParams] = useSearchParams();

  const waitlistParam = searchParams.get('waitlist');
  const waitlistFromQuery =
    waitlistParam === 'true' ? true : waitlistParam === 'false' ? false : undefined;
  const waitlist =
    typeof location.state?.waitlist === 'boolean'
      ? location.state.waitlist
      : waitlistFromQuery;

  if (typeof waitlist !== 'boolean') {
    return (
      <div className="notification-signup-container">
        <BrainLoader size={80} label="Loading" />
      </div>
    );
  }

  const content = waitlist ? WAITLIST_CONTENT.true : WAITLIST_CONTENT.false;

  return (
    <div className="notification-signup-container">
      <div className="notification-signup-card">
        <div
          className={`notification-signup-icon ${
            waitlist ? '' : 'notification-signup-icon--existing'
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
