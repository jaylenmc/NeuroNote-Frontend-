import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import LandingFeatures from './LandingFeatures';
import LandingTestimonials from './LandingTestimonials';
import LandingCtaSection from './LandingCtaSection';
import LandingFooter from './LandingFooter';
import './LandingPage.css';

const UNIVERSITIES = ['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'];

function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <div className="landing-universities">
          <div className="landing-universities-inner">
            <p className="landing-universities-title">Trusted by learners at</p>
            <div className="landing-universities-list">
              {UNIVERSITIES.map((uni) => (
                <span key={uni} className="landing-font-display">{uni}</span>
              ))}
            </div>
          </div>
        </div>
        <LandingTestimonials />
        <LandingCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
