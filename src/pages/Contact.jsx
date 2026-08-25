import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Contact() {
  useEffect(() => {
    document.title = 'Contact Us - NeuroNote';
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <p className="contact-eyebrow">Get in Touch</p>
        <h1 className="contact-title">We'd love to hear from you</h1>
        <p className="contact-subtitle">
          Have a question, suggestion, or need support? Reach out and we'll get back to you as soon as possible.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What's this about?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Tell us more..."
              />
            </div>

            <button type="submit" className="contact-submit-btn">
              Send Message
            </button>
          </form>
        </div>

        <div className="contact-info">
          <div className="contact-info-item">
            <h3>Email</h3>
            <a href="mailto:support@neuronote.ai">support@neuronote.ai</a>
          </div>
          <div className="contact-info-item">
            <h3>Response Time</h3>
            <p>We typically respond within 24-48 hours</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;

