import React, { useEffect } from 'react';
import './Privacy.css';

function Privacy() {
  useEffect(() => {
    document.title = 'Privacy Policy - NeuroNote';
  }, []);

  return (
    <div className="privacy-page">
      <div className="privacy-inner">
        <header className="privacy-header">
          <p className="privacy-eyebrow">Privacy Policy</p>
          <h1 className="privacy-title">Your privacy matters to us</h1>
        </header>

        <section className="privacy-content">
          <div className="privacy-section">
            <h2>Information We Collect</h2>
          <p>
            NeuroNote collects information that you provide directly to us, such as when you create an account, 
            use our services, or contact us for support. This may include your name, email address, and any content 
            you create or upload to the platform.
          </p>
        </div>

        <div className="privacy-section">
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, process transactions, 
            send you technical notices and support messages, and respond to your comments and questions.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
            Internet is 100% secure.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </div>
        </section>
      </div>
    </div>
  );
}

export default Privacy;

