import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function LandingCtaSection() {
  return (
    <section className="landing-cta">
      <div className="landing-cta-bg" aria-hidden="true" />

      <div className="landing-cta-inner">
        <h2 className="landing-cta-title landing-font-display">
          Ready to optimize your learning?
        </h2>
        <p className="landing-cta-desc">
          Join students and professionals using NeuroNote to master new skills.
        </p>

        <div className="landing-cta-buttons">
          <Link to="/signin">
            <button type="button" className="landing-btn-primary-white landing-cta-btn">
              Get Started Now
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LandingCtaSection;
