import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Terms.css';

function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service - NeuroNote';
  }, []);

  return (
    <div className="terms-page">
      <div className="terms-inner">
        <header className="terms-header">
          <p className="terms-eyebrow">Terms And Conditions</p>
          <h1 className="terms-title">What you need to know</h1>
        </header>

        <section className="terms-content">
          <div className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using NeuroNote (&quot;Service&quot;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this Service.
            </p>
          </div>

          <div className="terms-section">
            <h2>2. Description of Service</h2>
            <p>
              NeuroNote is a cognitive learning platform that helps users study more effectively through spaced repetition, active recall, AI-powered summarization, knowledge graphing, and focus tools. The Service is designed for students, researchers, and lifelong learners.
            </p>
          </div>

          <div className="terms-section">
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </div>

          <div className="terms-section">
            <h2>4. User Content</h2>
            <p>
              You retain ownership of any content you submit to the Service, including notes, study materials, personal data, and other materials. By using the Service, you grant us a limited license to use your content solely for the purpose of providing the Service to you.
            </p>
          </div>

          <div className="terms-section">
            <h2>5. AI-Generated Content</h2>
            <p>
              Our Service uses artificial intelligence to generate summaries, flashcards, and study suggestions. While we strive for accuracy and relevance, you are responsible for reviewing and verifying all AI-generated content before use.
            </p>
          </div>

          <div className="terms-section">
            <h2>6. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Please review our <Link to="/privacy">Privacy Policy</Link> to understand how we collect, use, and protect your information.
            </p>
          </div>

          <div className="terms-section">
            <h2>7. Prohibited Uses</h2>
            <p>You agree not to use the Service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform illegal activities</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>8. Intellectual Property Rights</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of NeuroNote and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
          </div>

          <div className="terms-section">
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
            </p>
          </div>

          <div className="terms-section">
            <h2>10. Disclaimer</h2>
            <p>
              The information on this Service is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, NeuroNote excludes all representations, warranties, conditions and terms relating to the Service.
            </p>
          </div>

          <div className="terms-section">
            <h2>11. Limitation of Liability</h2>
            <p>
              In no event shall NeuroNote, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </p>
          </div>

          <div className="terms-section">
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of the State of California, without regard to its conflict of law provisions.
            </p>
          </div>

          <div className="terms-section">
            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </div>

          <div className="terms-section">
            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="terms-contact">
              Email: legal@neuronote.com<br />
              Website: https://myneuronote.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Terms;
