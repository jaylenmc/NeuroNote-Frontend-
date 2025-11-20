import React, { useEffect } from 'react';

function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service - NeuroNote';
  }, []);

  return (
    <div className="terms-page">
      <section className="terms-hero">
        <p className="terms-eyebrow">Terms of Service</p>
        <h1 className="terms-title">Terms and conditions</h1>
      </section>

      <section className="terms-content">
        <div className="terms-section">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using NeuroNote, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div className="terms-section">
          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily use NeuroNote for personal, non-commercial transitory viewing only. 
            This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials.
          </p>
        </div>

        <div className="terms-section">
          <h2>User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility 
            for all activities that occur under your account or password.
          </p>
        </div>

        <div className="terms-section">
          <h2>Content and Intellectual Property</h2>
          <p>
            All content, features, and functionality of NeuroNote, including but not limited to text, graphics, logos, icons, and 
            software, are the exclusive property of NeuroNote Labs and are protected by international copyright, trademark, and 
            other intellectual property laws.
          </p>
        </div>

        <div className="terms-section">
          <h2>Prohibited Uses</h2>
          <p>
            You may not use NeuroNote in any way that causes, or may cause, damage to the service or impairment of the availability 
            or accessibility of NeuroNote, or in any way which is unlawful, illegal, fraudulent, or harmful.
          </p>
        </div>

        <div className="terms-section">
          <h2>Limitation of Liability</h2>
          <p>
            In no event shall NeuroNote Labs, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
            for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, 
            data, use, goodwill, or other intangible losses, resulting from your use of the service.
          </p>
        </div>

        <div className="terms-section">
          <h2>Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
            under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </div>

        <div className="terms-section">
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
            we will provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Terms;

