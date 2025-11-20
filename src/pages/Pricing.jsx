import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const pricingTiers = [
  {
    id: 'basic',
    name: 'Note Taker',
    label: 'Basic',
    tagline: 'Experience peak learning for 3 days.',
    price: 'Free',
    description: [
      'Basic access to flashcards & quizzes',
      'Create up to 3 folders',
      'Baseline progress tracker',
      'Limited 1-on-1 chat rooms',
      'Local leaderboards',
      '5 AI messages per day',
      '5 MB upload & notes storage',
      'Local pomodoro timers & reminders',
    ],
    ctaLabel: 'Start for free',
    ctaTo: '/signup',
  },
  {
    id: 'pro',
    name: 'Thinker',
    label: 'Pro',
    tagline: 'Power up your brain loops.',
    price: '$5–$10 / mo',
    description: [
      'Unlimited decks & quizzes',
      'Unlimited folders with tagging',
      'Advanced stats by topic & date',
      'Full chat access',
      'Add & manage study friends',
      'Host & join study group sessions',
      '10K AI tokens included',
      '100 MB uploads with cloud sync',
      'Smart suggestions across devices',
    ],
    highlight: true,
    ctaLabel: 'Upgrade to Thinker',
    ctaTo: '/signup',
  },
  {
    id: 'premium',
    name: 'Scholar',
    label: 'Premium',
    tagline: 'Unlock peak cognitive performance.',
    price: '$20 / mo',
    description: [
      'Shared flashcard libraries',
      'Admin controls for shared spaces',
      'Team-wide analytics dashboard',
      'Group channels & shared content',
      'Team invites & collaboration flows',
      'Unlimited scheduled sessions',
      'Private team leaderboard',
      'AI concierge for teams',
      'Custom branding & workspace',
      'Team-wide note sharing',
      'Managed team study sessions',
    ],
    ctaLabel: 'Talk with our team',
    ctaTo: '/contact',
  },
];

function Pricing() {
  useEffect(() => {
    document.title = 'Pricing - NeuroNote';
  }, []);

  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <p className="pricing-eyebrow">Choose your flow</p>
        <h1 className="pricing-title">Plans that fuel every learner’s neuro-stack</h1>
        <p className="pricing-subtitle">
          Whether you’re sampling the study loop or leading an entire cohort, NeuroNote scales from solo note taking to
          AI-assisted team mastery.
        </p>
      </section>

      <section className="pricing-grid">
        {pricingTiers.map((tier) => (
          <article
            key={tier.id}
            className={`pricing-card ${tier.highlight ? 'pricing-card-highlight' : ''}`}
          >
            <header className="pricing-card-header">
              <div className="pricing-card-heading">
                <span className="pricing-card-label">{tier.label}</span>
                <h2>{tier.name}</h2>
              </div>
              <p className="pricing-card-tagline">{tier.tagline}</p>
              <div className="pricing-card-price">{tier.price}</div>
            </header>
            <ul className="pricing-card-list">
              {tier.description.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="pricing-card-cta">
              <Link className="pricing-card-btn" to={tier.ctaTo}>
                {tier.ctaLabel}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="pricing-faq-teaser">
        <div>
          <h3>Need a campus or research license?</h3>
          <p>
            We partner with universities and lab programs to deploy NeuroNote at scale.{' '}
            <Link to="/contact" className="pricing-inline-link">Contact us</Link> for custom terms, onboarding, and coaching.
          </p>
        </div>
        <div>
          <h3>Want to try Thinker before upgrading?</h3>
          <p>
            Start on Note Taker then unlock a 7-day Thinker experience whenever you’re ready—your data migrates instantly.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Pricing;

