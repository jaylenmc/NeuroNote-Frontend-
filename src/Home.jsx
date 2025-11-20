import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext'; // or wherever you defined its
import generateState from './utils/auth';
import { BookOpen, GraduationCap, Calculator, Users, PenTool, School, FileText, LayoutDashboard, Brain, Bookmark } from 'lucide-react';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studyMethods = [
    {
      title: 'Recall + Retention',
      description:
        'Short recall bursts and spaced review prompts keep memory curves high without rereading entire chapters.'
    },
    {
      title: 'Doing + Feedback Loop',
      description:
        'Practice cards, quizzes, and tutor responses close knowledge gaps immediately so every attempt improves mastery.'
    },
    {
      title: 'Understanding + Problem Solving',
      description:
        'Guided concept breakdowns and worked examples help you connect patterns so tricky problems feel intuitive.'
    },
    {
      title: 'Pattern Recognition + Applied Learning',
      description:
        'Identify recurring structures across subjects and apply proven strategies to new contexts, building transferable expertise.'
    }
  ];
  const [activeMethod, setActiveMethod] = useState(studyMethods[0].title);

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
    <div className="home-page" style={{ background: '#F7F8FA' }}>
      {/* Hero Section */}
      <section className="section hero-section">
        <div className="hero-wrapper">
          <div className="hero-image">
            <img src="/polished_mockup.png" alt="NeuroNote App Interface" />
          </div>
          <div className="hero-content hero-content-left">
            {/* Icon Row */}
            <div className="hero-icon-row">
              <div className="hero-icon-item" title="Teaching">
                <GraduationCap size={44} strokeWidth={1.5} />
              </div>
              <div className="hero-icon-item" title="Read">
                <BookOpen size={44} strokeWidth={1.5} />
              </div>
              <div className="hero-icon-item" title="Math">
                <Calculator size={44} strokeWidth={1.5} />
              </div>
              <div className="hero-icon-item" title="Learning">
                <Users size={44} strokeWidth={1.5} />
              </div>
              <div className="hero-icon-item" title="Writing">
                <PenTool size={44} strokeWidth={1.5} />
              </div>
              <div className="hero-icon-item" title="Education">
                <School size={44} strokeWidth={1.5} />
              </div>
              <div className="hero-icon-item" title="Notes">
                <FileText size={44} strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="hero-title">
            Study with clarity. Learn
            with  <span className="gradient-text">confidence.</span>
            </h1>
            <p className="hero-subtitle">
            Designed to save you time, cut through confusion, and strengthen your long-term retention every time you study.
            </p>
            <div className="hero-cta-group">
              <Link to='/signin' className="cta-btn">
                Join waitlist
                <span className="material-symbols-outlined cta-btn-icon">arrow_outward</span>
              </Link>
              <Link to='/signin' className="cta-btn-secondary">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Study Method Video */}
      <section className="hero-video-section" aria-label="See NeuroNote in action">
        <h2 className="hero-video-section-title">Optimize Your Learning</h2>
        <div className="hero-video-composite">
          <div className="hero-video-shell">
            <video
              className="hero-video"
              src="/study_method.mp4"
              autoPlay
              muted
              loop
              playsInline
              controlsList="nodownload noplaybackrate"
            >
              Sorry, your browser doesn't support embedded videos. You can{" "}
              <a href="/study_method.mp4">download the clip</a> instead.
            </video>
          </div>
          <div className="hero-video-features">
          <span className="video-eyebrow">Neuro Study Methods</span>
          <div className="hero-video-heading">
            <h3>Study smarter. Not harder.</h3>
            <Link to="/signin" className="hero-video-link" aria-label="Log in">
              →
            </Link>
          </div>
            <ul className="hero-video-methods">
              {studyMethods.map(method => {
                const isOpen = activeMethod === method.title;
                return (
                  <li key={method.title}>
                    <button
                      type="button"
                      className="hero-video-method-trigger"
                      aria-expanded={isOpen}
                      onClick={() => setActiveMethod(isOpen ? null : method.title)}
                    >
                      {method.title}
                    </button>
                    <div className={`hero-video-method-content ${isOpen ? 'open' : ''}`}>
                      <p>{method.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Hero Supporting Story */}
      <section className="section brand-story" style={{ background: '#FFFFFF' }}>
        <div className="brand-story-media">
          <div className="brand-story-media-shell">
            <img src="/study_dashboard.png" alt="NeuroNote Study Dashboard" className="brand-story-image" />
          </div>
        </div>
        <div className="brand-story-copy">
          <div className="stacked-copy-block">
            <h2 className="stacked-heading">
              <LayoutDashboard size={20} strokeWidth={1.5} className="stacked-heading-icon" />
              Your Personal Study Command Center
            </h2>
            <p className="stacked-subheading">Where every tool, note, and resource comes together to keep your learning organized and effortless.</p>
          </div>
          <div className="stacked-copy-block">
            <h2 className="stacked-heading">
              <Bookmark size={20} strokeWidth={1.5} className="stacked-heading-icon" />
              Stay Ready With What Matters Most
            </h2>
            <p className="stacked-subheading">Pinned notes and resources keep your most important study materials just one click away.</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <div className="home-page-cta">
        <Link to="/signin" className="brand-story-cta-btn">
          Join waitlist
        </Link>
      </div>
      
      {/* Footer */}
      <footer className="section site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">NeuroNote</div>
            <p className="footer-tagline">
              Minimal, brain-backed study flow that turns every note into mastery.
            </p>
            <div className="footer-cta">
              <Link to="/signin" className="footer-cta-btn">Join waitlist</Link>
              <Link to="/signin" className="footer-ghost-link">Log In</Link>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
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