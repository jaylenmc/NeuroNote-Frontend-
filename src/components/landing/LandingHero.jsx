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
            src="/mockup.png"
            alt="NeuroNote dashboard"
            className="landing-hero-mockup-img"
          />
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
