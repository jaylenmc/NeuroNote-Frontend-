import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import LandingFeatures from './LandingFeatures';
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
        <LandingCtaSection />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
