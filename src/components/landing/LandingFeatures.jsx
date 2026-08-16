import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Clock, Search } from 'lucide-react';

function FeatureCard({ title, description, icon, className }) {
  return (
    <div className={`landing-feature-card landing-glass-card ${className || ''}`}>
      <div>
        <div className="landing-feature-card-icon">
          {icon}
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link to="/signin" className="landing-feature-card-link">
        Learn more &rarr;
      </Link>
    </div>
  );
}

function LandingFeatures() {
  return (
    <section id="features" className="landing-features">
      <div className="landing-features-bg" aria-hidden="true" />

      <div className="landing-features-inner">
        <div className="landing-features-header">
          <div className="landing-features-label">Neuro Study Methods</div>
          <h2 className="landing-features-title landing-font-display">
            Study Smarter. <span>Not Harder.</span>
          </h2>
          <p className="landing-features-desc">
            Advanced cognitive science principles baked into a beautiful interface. NeuroNote handles the structure so you can focus on the content.
          </p>
        </div>

        <div className="landing-features-grid">
          <FeatureCard
            className="span-2"
            title="Active Recall & Spaced Repetition"
            description="Categorize flashcards into buckets tiering from 1-4 which affects prioritization of flashcards to review in your next study session. Allowing you to study on your time in the most affective way possible."
            icon={<Clock size={24} color="#a78bfa" />}
          />

          <FeatureCard
            className="row-2"
            title="Doing + Feedback Loop"
            description="A study method where you actively answer a question in three layers of difficulty. Each layer pushes you to understand the concept more deeply, and feedback helps you correct mistakes and refine your thinking."
            icon={<Share2 size={24} color="#38bdf8" />}
          />

          <FeatureCard
            className="span-2"
            title="Research & Synthesis"
            description="Practice structured web research by crafting precise search queries and receiving AI feedback on their quality. Review the articles, summarize each source, and synthesize your findings into a clear, evidence based conclusion."
            icon={<Search size={24} color="#34d399" />}
          />
        </div>
      </div>
    </section>
  );
}

export default LandingFeatures;
