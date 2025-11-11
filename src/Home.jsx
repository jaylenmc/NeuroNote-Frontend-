import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext'; // or wherever you defined its
import generateState from './utils/auth';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const linkId = 'material-symbols-outlined';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_outward';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="home-page" style={{ background: '#11121a' }}>
      {/* Hero Section */}
      <section className="section hero-section" style={{ minHeight: '80vh', background: '#18191C' }}>
        <div className="hero-wrapper">
          <div className="hero-content hero-content-left">
            <h1 className="hero-title">
            Study smarter with AI
            <br />
            that  <span className="gradient-text">learns you.</span>
            </h1>
            <p className="hero-subtitle">
            Neuro Note helps you organize notes, generate summaries, and retain information faster — all powered by your personal study companion.

            </p>
            <Link to='/signin' className="cta-btn">
              Get Started
              <span className="material-symbols-outlined cta-btn-icon">arrow_outward</span>
            </Link>
          </div>
          <div className="hero-media">
            <div className="hero-screenshot-stack">
              <img src="public/review.jpg" alt="Review interface" className="hero-screenshot screenshot-top" />
              <img src="public/studyroom.jpg" alt="Study room interface" className="hero-screenshot screenshot-middle" />
              <img src="public/nightowl.jpg" alt="Night owl flashcards" className="hero-screenshot screenshot-bottom" />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Highlights */}
      <section className="section workflow-section">
        <div className="workflow-header">
          <h2 className="workflow-title">Build mastery faster while NeuroNote handles the busywork</h2>
          <p className="workflow-subtitle">
            Every study sprint starts with your pace, blends the right review moments, and ends with clear next steps.
          </p>
        </div>
        <div className="workflow-steps">
          <article className="workflow-card workflow-card-one">
            <div className="workflow-card-media">
              <img src="public/dfbl.png" alt="Plan your focus blocks" />
            </div>
            <h3>We map your focus blocks</h3>
            <p>
              Set your targets once and let NeuroNote craft adaptive focus sprints that keep you moving forward without
              losing context.
            </p>
          </article>
          <article className="workflow-card workflow-card-two">
            <div className="workflow-card-media">
              <img src="public/flashcards.png" alt="Generate flashcards automatically" />
            </div>
            <h3>We surface the right recall</h3>
            <p>
              Automatic flashcards and spaced prompts bubble up what matters next so you always know the smartest review
              move to make.
            </p>
          </article>
          <article className="workflow-card workflow-card-three">
            <div className="workflow-card-media">
              <img src="public/ups.png" alt="Share progress updates" />
            </div>
            <h3>We keep momentum visible</h3>
            <p>
              Momentum reports, streak nudges, and gentle check-ins make it effortless to stay accountable through every
              exam season.
            </p>
          </article>
        </div>
        <Link to="/signup" className="workflow-cta">
          Plan my study sprint
          <span className="material-symbols-outlined workflow-cta-icon">arrow_outward</span>
        </Link>
      </section>

      {/* Hero Supporting Story */}
      <section className="section brand-story" style={{ background: '#18191C' }}>
        <div className="brand-story-media">
          <div className="brand-story-media-shell">
            <img src="public/studyroom.jpg" alt="Students using NeuroNote" className="brand-story-image" />
          </div>
        </div>
        <div className="brand-story-copy">
          <div className="stacked-copy-block">
            <h2 className="stacked-heading">Capture Ideas Instantly</h2>
            <p className="stacked-subheading">Open a clean canvas that keeps context, citations, and AI insights aligned.</p>
          </div>
          <div className="stacked-copy-block">
            <h2 className="stacked-heading">Turn Notes Into Memory</h2>
            <p className="stacked-subheading">Generate spaced-repetition flashcards and smart quizzes without leaving your flow.</p>
          </div>
          <div className="stacked-copy-block">
            <h2 className="stacked-heading">Stay Ahead With Signals</h2>
            <p className="stacked-subheading">Daily recall nudges keep you sharp so nothing slips through before exams.</p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="section site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">NeuroNote</div>
            <p className="footer-tagline">
              Minimal, brain-backed study flow that turns every note into mastery.
            </p>
            <div className="footer-cta">
              <Link to="/signup" className="footer-cta-btn">Start Free Trial</Link>
              <Link to="/signin" className="footer-ghost-link">Log In</Link>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <Link to="/blog">Learning Hub</Link>
              <Link to="/case-studies">Case Studies</Link>
              <Link to="/guides">Study Guides</Link>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NeuroNote Labs. All rights reserved.</span>
          <div className="footer-meta-links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <a href="mailto:support@neuronote.ai">support@neuronote.ai</a>
          </div>
        </div>
      </footer>

    
    </div>
  );
}

export default Home;