import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-bg" aria-hidden="true" />

      <div className="landing-hero-inner">
        <h1 className="landing-hero-title landing-font-display">
          Study with Clarity. <br />
          Learn with Confidence.
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

        <div className="landing-hero-mockup-wrap">
          <img
            src="/mockup-800.png"
            srcSet="/mockup-800.png 800w, /mockup-1200.png 1200w"
            sizes="(max-width: 768px) 100vw, 1200px"
            alt="NeuroNote dashboard"
            className="landing-hero-mockup-img"
            width={1200}
            height={900}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
