import React from 'react';

function About() {
  const milestones = [
    { year: '2022', title: 'Prototype sparks interest', copy: 'Built the first NeuroNote workspace to tame messy lecture notes for neuroscience students.' },
    { year: '2023', title: 'Learning science + AI converge', copy: 'Partnered with cognitive researchers to blend spaced repetition, semantic chunking, and GPT-powered summaries.' },
    { year: '2024', title: 'Beta students ace finals', copy: 'Thousands of focused learners improved recall retention by an average of 37% across four-week study cycles.' },
  ];

  const values = [
    { heading: 'Learning-first design', body: 'Every shortcut and automation we ship must reinforce deliberate practice, not replace it.' },
    { heading: 'Evidence over hype', body: 'We translate peer-reviewed learning research into tangible product loops you can feel in every session.' },
    { heading: 'Calm productivity', body: 'Your workspace should reduce cognitive load. Our dark interface, soundscapes, and nudges all serve that goal.' },
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="about-eyebrow">Our Story</p>
        <h1 className="about-title">We built NeuroNote to make deep studying feel effortless</h1>
        <p className="about-lede">
          We are designers, neuroscientists, and engineers obsessed with one question: how do we help students remember
          what matters when it counts? NeuroNote was born from late-night lab sessions, stacks of flashcards, and the
          realization that the tools students rely on weren’t built for the brain.
        </p>
        <div className="about-stats">
          <div>
            <span className="about-stat-number">37%</span>
            <span className="about-stat-label">Average recall lift for beta students</span>
          </div>
          <div>
            <span className="about-stat-number">120K+</span>
            <span className="about-stat-label">Flashcards generated with NeuroNote AI</span>
          </div>
          <div>
            <span className="about-stat-number">32</span>
            <span className="about-stat-label">Universities using NeuroNote in study cohorts</span>
          </div>
        </div>
      </section>

      <section className="about-mission">
        <div className="about-mission-copy">
          <h2>Why we exist</h2>
          <p>
            Students deserve a study workflow that respects their time and attention. We combine neuroscience-backed
            practices with adaptive AI so every learner can stay organized, focused, and confident before exams.
          </p>
        </div>
        <div className="about-value-grid">
          {values.map((value) => (
            <article className="about-value-card" key={value.heading}>
              <h3>{value.heading}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-milestones">
        <h2>Milestones on our journey</h2>
        <div className="about-timeline">
          {milestones.map((milestone) => (
            <div className="timeline-item" key={milestone.year}>
              <div className="timeline-badge">{milestone.year}</div>
              <div className="timeline-copy">
                <h3>{milestone.title}</h3>
                <p>{milestone.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-team">
        <div className="about-team-copy">
          <h2>The team behind NeuroNote</h2>
          <p>
            We’re a remote-first crew spanning Toronto, Austin, Lagos, and Berlin. We pair deep research with rapid
            prototyping to deliver features that keep your knowledge sharp. When we’re not shipping updates, you’ll find
            us mentoring student founders and sharing memory tactics on campus tours.
          </p>
        </div>
        <div className="about-team-cards">
          <article className="team-card">
            <div className="team-card-header">
              <span className="team-avatar" aria-hidden="true">🧠</span>
              <div>
                <h3>Skylar Rivera</h3>
                <p>Founder &amp; Learning Scientist</p>
              </div>
            </div>
            <p className="team-card-copy">
              Leads our research sprints translating cognitive science into frictionless product flows.
            </p>
          </article>
          <article className="team-card">
            <div className="team-card-header">
              <span className="team-avatar" aria-hidden="true">🛠️</span>
              <div>
                <h3>Amir Bello</h3>
                <p>Head of Engineering</p>
              </div>
            </div>
            <p className="team-card-copy">
              Builds resilient infrastructure so NeuroNote syncs perfectly across web, tablet, and mobile.
            </p>
          </article>
          <article className="team-card">
            <div className="team-card-header">
              <span className="team-avatar" aria-hidden="true">🎧</span>
              <div>
                <h3>Mia Chen</h3>
                <p>Product Designer</p>
              </div>
            </div>
            <p className="team-card-copy">
              Crafts the calm, immersive UI and focus soundscapes that make late-night study sessions feel serene.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default About;