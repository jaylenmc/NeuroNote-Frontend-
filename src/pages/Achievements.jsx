import React from 'react';
import { ArrowLeft, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Achievements.css';

const legendItems = [
  {
    tier: 'Bronze Tier',
    description: 'Entry-level achievements or common milestones.',
    color: '#B77431',
  },
  {
    tier: 'Silver Tier',
    description: 'Intermediate achievements that require consistency.',
    color: '#A6B1C8',
  },
  {
    tier: 'Gold Tier',
    description: 'High-value milestones earned through dedication.',
    color: '#D4A12C',
  },
  {
    tier: 'Legend Tier',
    description: 'Rare achievements reserved for exceptional streaks.',
    color: '#FF5F93',
  },
];

const cards = [
  {
    icon: '🔥',
    iconBg: '#FF8A8A29',
    iconBorder: '#FF8A8A52',
    iconColor: '#FFD1D1',
    title: '7-Day Streak',
    desc: 'Stayed consistent and studied every day for a full week.',
    progress: '39%',
    xp: '+15 XP',
    family: 'Consistency',
  },
  {
    icon: '📚',
    iconBg: '#5AE0AE2E',
    iconBorder: '#5AE0AE59',
    iconColor: '#C2FFE9',
    title: 'Flashcard Pro',
    desc: 'Mastered deck practice and hit your review accuracy goal.',
    progress: '100%',
    xp: '+20 XP',
    family: 'Flashcards',
  },
  {
    icon: '🎯',
    iconBg: '#F7C7662E',
    iconBorder: '#F7C76659',
    iconColor: '#FFE7B8',
    title: 'Quiz Sharpshooter',
    desc: 'Scored top accuracy across recall quizzes and timed drills.',
    progress: '72%',
    xp: '+18 XP',
    family: 'Quizzes',
  },
  {
    icon: '⭐',
    iconBg: '#9299FF2E',
    iconBorder: '#9299FF59',
    iconColor: '#C8CCFF',
    title: 'Night Owl',
    desc: 'Completed focused evening sessions and unlocked calm consistency.',
    progress: '100%',
    xp: '+25 XP',
    family: 'General',
  },
];

const Achievements = () => {
  const navigate = useNavigate();

  return (
    <div className="ach-page">
      <button className="ach-back-btn" onClick={() => navigate('/dashboard')} type="button">
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <div className="ach-content">
        <header className="ach-header">
          <h1>Achievements</h1>
          <p>Track your progress, unlock milestones, and celebrate your study journey.</p>
        </header>

        <section className="ach-summary-shell">
          <div className="ach-summary-main">
            <div className="ach-summary-title-wrap">
              <h2>Your Achievements</h2>
              <p>Track your mastery journey across study sessions.</p>
            </div>

            <div className="ach-summary-stats">
              <article className="ach-summary-stat">
                <span className="ach-stat-label">Achievements Unlocked</span>
                <strong>24</strong>
                <em>100% complete (24/24)</em>
              </article>
              <article className="ach-summary-stat">
                <span className="ach-stat-label">Current Level</span>
                <strong>Level 3</strong>
                <em>Memory Architect</em>
              </article>
              <article className="ach-summary-stat">
                <span className="ach-stat-label">Latest Unlock</span>
                <strong>Midnight Scholar</strong>
                <em>General</em>
              </article>
            </div>
          </div>

          <div className="ach-next-wrap">
            <p className="ach-next-title">Next achievement you&apos;re closest to unlocking</p>
            <article className="ach-card">
              <span className="ach-card-badge ach-badge-flashcards">📚</span>
              <h3>Flashcard Pro</h3>
              <p>Mastered deck practice and hit your review accuracy goal.</p>
              <div className="ach-card-meta">
                <span className="ach-xp-chip">+20 XP</span>
                <span className="ach-family-chip">Flashcards</span>
              </div>
              <span className="ach-progress-label">Progress</span>
              <div className="ach-progress-track">
                <div className="ach-progress-fill" style={{ width: '100%' }} />
              </div>
            </article>
          </div>
        </section>

        <section className="ach-legend">
          <h4>Rarity Guide</h4>
          <div className="ach-legend-items">
            {legendItems.map((item) => (
              <article className="ach-legend-item" key={item.tier}>
                <span className="ach-legend-swatch" style={{ background: item.color }} />
                <div className="ach-legend-copy">
                  <span>{item.tier}</span>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="ach-section-head">
          <span>Unlocked Achievements</span>
          <div className="ach-section-line" />
          <span className="ach-count">24 achievements</span>
        </div>

        <div className="ach-filters">
          <div className="ach-pill-group">
            <button className="ach-pill ach-pill-active" type="button">All</button>
            <button className="ach-pill" type="button">General</button>
            <button className="ach-pill" type="button">Flashcards</button>
          </div>
          <button className="ach-sort-pill" type="button">
            <SlidersHorizontal size={16} />
            <span>Sort by: Most Recent</span>
            <ChevronDown size={16} />
          </button>
        </div>

        <section className="ach-grid">
          {cards.map((card) => (
            <article className="ach-card" key={card.title}>
              <span
                className="ach-card-badge"
                style={{
                  background: card.iconBg,
                  borderColor: card.iconBorder,
                  color: card.iconColor,
                }}
              >
                {card.icon}
              </span>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <div className="ach-card-meta">
                <span className="ach-xp-chip">{card.xp}</span>
                <span className="ach-family-chip">{card.family}</span>
              </div>
              <span className="ach-progress-label">Progress</span>
              <div className="ach-progress-track">
                <div className="ach-progress-fill" style={{ width: card.progress }} />
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Achievements;