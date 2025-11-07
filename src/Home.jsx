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

  return (
    <div style={{ background: 'rgb(24, 25, 28)' }}>
      {/* Hero Section */}
      <section className="section hero-section" style={{ minHeight: '80vh', background: '#18191C' }}>
        <div className="hero-wrapper">
          <div className="hero-content hero-content-left">
            <h1 className="hero-title">Master Any Subject<br />Backed By Brain Science</h1>
            <p className="hero-subtitle">Minimal, modern note-taking powered by AI.</p>
            <Link to='/signin' className="cta-btn">Get Started</Link>
          </div>
          <div className="hero-media">
            <video
              className="hero-video"
              src="/NeuroNote Practice Record.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section text-center">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.7rem', marginBottom: '2rem' }}>How it Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="card">
            <div className="card-icon" role="img" aria-label="Note">📝</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Take Smart Notes</div>
            <div className="text-muted">Capture ideas and facts instantly, organized for recall.</div>
          </div>
          <div className="card">
            <div className="card-icon" role="img" aria-label="Flashcards">📚</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>AI-Generated Flashcards</div>
            <div className="text-muted">Turn notes into flashcards with one click for spaced repetition.</div>
          </div>
          <div className="card">
            <div className="card-icon" role="img" aria-label="Brain">🧠</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Review & Retain</div>
            <div className="text-muted">Review at optimal times, proven by brain science.</div>
          </div>
        </div>
      </section>

      {/* Why NeuroNote */}
      <section className="section text-center">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.7rem', marginBottom: '2rem' }}>Why NeuroNote?</h2>
        <ul className="benefit-list">
          <li>Boosts long-term memory and understanding</li>
          <li>Reduces study time with efficient review</li>
          <li>Works for any subject, from science to languages</li>
        </ul>
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="testimonial">“I finally remember what I study. NeuroNote is a game changer!”<br /><span style={{ fontWeight: 600 }}>— Alex, Med Student</span></div>
          <div className="testimonial" style={{ background: 'var(--secondary-green)', color: '#18181B' }}>“Flashcards are so easy now. I use it every day.”<br /><span style={{ fontWeight: 600 }}>— Priya, High Schooler</span></div>
        </div>
      </section>

      {/* Visual Preview */}
      <section className="section visual-preview">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.7rem', marginBottom: '2rem', textAlign: 'center' }}>See NeuroNote in Action</h2>
        <img src="/demo-screenshot.png" alt="NeuroNote Demo Screenshot" className="visual-img" style={{ border: '1px solid #E5E7EB' }} />
        <div className="text-muted" style={{ marginTop: '1rem' }}>(Demo screenshot or short video goes here)</div>
      </section>

      {/* Final Call to Action */}
      <section className="section text-center">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.2rem' }}>Ready to get started?</h2>
        <Link to="/signup" className="cta-btn">Sign Up Free</Link>
      </section>
    </div>
  );
}

export default Home;