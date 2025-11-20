import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const captureFeatures = [
  {
    title: 'Semantic Note Capture',
    body: 'Transform messy lectures into structured outlines. NeuroNote auto-groups highlights, citations, and key terms as you type.',
    icon: '🧠',
  },
  {
    title: 'AI Summaries + Questions',
    body: 'Generate chapter takeaways, follow-up questions, and cloze deletions in one click to reinforce your understanding instantly.',
    icon: '⚙️',
  },
  {
    title: 'Multimodal Uploads',
    body: 'Drop PDFs, slides, or audio—our pipeline extracts the core concepts, links them to your decks, and indexes them for recall.',
    icon: '🗂️',
  },
];

const retentionLoops = [
  {
    heading: 'Adaptive Recall Radar',
    copy: 'Heatmaps map your confidence score across topics. We nudge you minutes before your memory fades using personalized spaced repetition.',
  },
  {
    heading: 'Focus Room Sessions',
    copy: 'Immersive environments pair ambient soundscapes with dynamic prompts and check-in pulses so you stay locked in.',
  },
  {
    heading: 'Deep Analytics',
    copy: 'Break down improvements by deck, tag, or time-of-day. See which study loops deliver the best retention for you or your team.',
  },
];

const collaboration = [
  {
    heading: 'Study Cohorts',
    copy: 'Host private rooms, share flashcards, and run timed drills together with live reactions and shared whiteboards.',
  },
  {
    heading: 'Guided AI Tutor',
    copy: 'Ask domain-specific tutors that cite your own notes. Receive Socratic hints, diagrams, and flashback questions on demand.',
  },
  {
    heading: 'Automations & Reminders',
    copy: 'Sync Pomodoro timers, device reminders, and weekly retrospectives across your devices and friends.',
  },
];

function Features() {
  useEffect(() => {
    document.title = 'Features - NeuroNote';
  }, []);

  return (
    <div className="features-page">
      <section className="features-hero">
        <p className="features-eyebrow">Feature Overview</p>
        <h1 className="features-title">Everything you need to capture, retain, and share knowledge effortlessly</h1>
        <p className="features-subtitle">
          NeuroNote blends calm design with principled learning science so your workflow stays simple while your brain power scales.
        </p>
        <div className="features-hero-cta">
          <Link to="/pricing" className="features-primary-btn">Compare plans</Link>
          <Link to="/signup" className="features-secondary-btn">Start free trial</Link>
        </div>
      </section>

      <section className="features-section">
        <header className="features-section-header">
          <span>Capture flawlessly</span>
          <h2>Rapid intake without the chaos</h2>
          <p>Stay in flow while NeuroNote keeps every citation, highlight, and follow-up question perfectly organized.</p>
        </header>
        <div className="features-capture-grid">
          {captureFeatures.map((feat) => (
            <article className="capture-card" key={feat.title}>
              <span className="capture-icon" aria-hidden="true">{feat.icon}</span>
              <h3>{feat.title}</h3>
              <p>{feat.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="features-section retention-section">
        <header className="features-section-header">
          <span>Retention loops</span>
          <h2>Close the loop on every concept</h2>
          <p>From spaced repetition to mindful cooldowns, we nudge you at the right time to make memories stick.</p>
        </header>
        <div className="retention-grid">
          {retentionLoops.map((item) => (
            <article key={item.heading}>
              <h3>{item.heading}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="features-section collaboration-section">
        <header className="features-section-header">
          <span>Collaborate smarter</span>
          <h2>A study hub for teams and cohorts</h2>
          <p>Share flashcards, run live drills, and sync accountability nudges whether you’re in the same dorm or across time zones.</p>
        </header>
        <div className="collaboration-grid">
          {collaboration.map((item) => (
            <article className="collaboration-card" key={item.heading}>
              <h3>{item.heading}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="features-bottom-cta">
        <div>
          <h2>Ready to build your neuro-stack?</h2>
          <p>Join thousands of students, researchers, and teams upgrading their learning loops with NeuroNote.</p>
        </div>
        <div className="features-bottom-actions">
          <Link to="/signup" className="features-primary-btn">Get started free</Link>
          <Link to="/contact" className="features-secondary-btn">Book a walkthrough</Link>
        </div>
      </section>
    </div>
  );
}

export default Features;

