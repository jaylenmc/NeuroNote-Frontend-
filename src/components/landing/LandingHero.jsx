import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-bg-1" aria-hidden="true" />
      <div className="landing-hero-bg-2" aria-hidden="true" />

      <div className="landing-hero-inner">
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          <span className="landing-hero-badge-text">New: Doing + Feedback Loop Study Method</span>
        </div>

        <h1 className="landing-hero-title landing-font-display">
          Study with Clarity. <br />
          <span className="landing-text-gradient">Learn with Confidence.</span>
        </h1>

        <p className="landing-hero-subtitle">
          The all-in-one cognitive operating system designed to save you time, cut through confusion, and strengthen long-term retention.
        </p>

        <div className="landing-hero-ctas">
          <Link to="/signin">
            <button type="button" className="landing-btn-primary">
              Start Learning
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>

        <div className="landing-hero-social">
          <div className="landing-hero-avatars">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://picsum.photos/40/40?random=${i}`}
                alt=""
              />
            ))}
          </div>
          <div className="landing-hero-stars">
            <span className="stars" aria-hidden="true">★★★★★</span>
            <span>Loved by 10,000+ top students</span>
          </div>
        </div>

        <div className="landing-hero-mockup-wrap">
          <img
            src="/landingpage_pic.png"
            alt="NeuroNote dashboard"
            className="landing-hero-mockup-img"
          />
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
