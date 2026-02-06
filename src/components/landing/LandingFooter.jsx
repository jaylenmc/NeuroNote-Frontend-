import React from 'react';
import { Link } from 'react-router-dom';
import { FaTiktok, FaInstagram } from 'react-icons/fa';

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-stacked">
          <div className="landing-footer-brand">
            <img
              src="/NeuroNote Logo Transparent.png"
              alt="NeuroNote"
              className="landing-footer-brand-icon"
            />
          </div>
          <Link to="/signin" className="landing-footer-cta">
            Join Waitlist
          </Link>
          <p className="landing-footer-about">
            The operating system for your brain. Built for students, researchers, and lifelong learners.
          </p>
          <div className="landing-footer-social">
            <a href="https://www.tiktok.com/@myneuronote" aria-label="TikTok"><FaTiktok size={20} /></a>
            <a href="https://www.instagram.com/neuronote.co/" aria-label="Instagram"><FaInstagram size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
