import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Flame, Footprints, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import { Calendar } from './ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Empty } from './ui/empty';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import './DashboardHome.css';

const stockDocs = [
  {
    preview: ['CNS PATHWAY', '- relay map', '- receptor flow'],
    name: 'CNS Pathway Notes',
    summary: 'Signal flow, relay map and receptor behavior references.',
  },
  {
    preview: ['PHARMA', '- dose ratios', '- interactions'],
    name: 'Pharma Formula Sheet',
    summary: 'Dose ratios, contraindications, and high-priority reminders.',
  },
  {
    preview: ['NEURO LAB', '- exp notes', '- assumptions'],
    name: 'Neuro Lab Report Draft',
    summary: 'Experiment notes and assumptions for peer review.',
  },
];

const upcomingReviews = [
  { title: 'Neuroscience 201', meta: 'In 22m' },
  { title: 'Pharmacology Drill', meta: 'Tonight' },
  { title: 'Synaptic Plasticity Set', meta: 'In 35m' },
  { title: 'Neuroanatomy Labeling', meta: 'Tomorrow' },
  { title: 'Axon Pathways Rapid Quiz', meta: 'In 1h' },
  { title: 'Clinical Cases: Memory', meta: 'Tomorrow' },
  { title: 'EEG Pattern Recognition', meta: 'In 2h' },
  { title: 'Motor Cortex Deep Dive', meta: 'Friday' },
  { title: 'Cranial Nerves Refresher', meta: 'In 3h' },
  { title: 'Neurochemistry Basics', meta: 'Saturday' },
  { title: 'Brainstem Review Sprint', meta: 'In 4h' },
  { title: 'Behavioral Neuro Quiz', meta: 'Sunday' },
];

const studyRooms = [];

const getDueMetaTone = (meta) => {
  const value = String(meta || '').trim().toLowerCase();
  if (!value) return 'upcoming';
  if (value.includes('overdue') || value.includes('late') || value.includes('missed')) {
    return 'overdue';
  }
  if (value.includes('due now') || value === 'now') {
    return 'due-now';
  }
  if (value.includes('due soon') || value.startsWith('in ')) {
    return 'due-soon';
  }
  return 'upcoming';
};

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dueCount, setDueCount] = useState(0);
  const [deckCount, setDeckCount] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dueRes, decksRes] = await Promise.all([
          api.get('/flashcards/cards/due/').catch(() => ({ data: [] })),
          api.get('/flashcards/deck/').catch(() => ({ data: { decks: [] } })),
        ]);

        const dueCards = Array.isArray(dueRes.data) ? dueRes.data : [];
        setDueCount(dueCards.length);

        const decksData = decksRes.data?.decks ?? decksRes.data;
        const decksList = Array.isArray(decksData) ? decksData : [];
        setDeckCount(decksList.length);

        let sum = 0;
        for (const deck of decksList) {
          try {
            const cardsRes = await api.get(`/flashcards/cards/${deck.id}/`);
            const cards = Array.isArray(cardsRes.data)
              ? cardsRes.data
              : cardsRes.data?.cards ?? [];
            sum += cards.length;
          } catch {
            // Keep going if one deck request fails.
          }
        }
        setTotalCards(sum);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setDueCount(0);
        setDeckCount(0);
        setTotalCards(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const xp = user?.xp ?? 72;
  const level = user?.level ?? 7;
  const nextLevelXp = 1000;
  const progressPercent = useMemo(
    () => Math.min(100, Math.max(8, Math.round((xp / nextLevelXp) * 100))),
    [xp],
  );

  const streakCount = 6;
  const [openStreakCalendar, setOpenStreakCalendar] = useState(false);

  const streakPreview = [
    { id: 'Mon', active: true },
    { id: 'Tue', active: true },
    { id: 'Wed', active: true },
    { id: 'Thu', active: true },
    { id: 'Fri', active: true },
    { id: 'Sat', active: true },
    { id: 'Sun', active: true },
  ];

  const loginHistory = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 28; i += 1) {
      if (i % 4 !== 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d);
      }
    }
    return dates;
  }, []);

  return (
    <div className="dh-root">
      <section className="dh-hero-shell dh-card">
        <div className="dh-hero-main">
          <div className="dh-badges">
            <span className="dh-badge dh-badge-secondary">
              Welcome back, {user?.username || user?.first_name || 'jay'}
            </span>
            <span className="dh-badge dh-badge-secondary">Focus target: 42 min</span>
            <span className="dh-badge dh-badge-streak">
              <Flame size={15} />
              <span className="dh-badge-streak-count">{streakCount}</span>
            </span>
          </div>

          <div className="dh-streak-head">
            <h1 className="dh-title">Streak Calendar</h1>
            <span className="dh-streak-chip">
              <CalendarDays className="dh-streak-chip-icon" size={12} />
              Week 1 Preview
            </span>
          </div>

          <div className="dh-streak-preview-row">
            {streakPreview.map((day) => (
              <div className="dh-streak-day" key={day.id}>
                <Check className="dh-streak-day-check" size={8} strokeWidth={2.6} />
                <span>{day.id}</span>
              </div>
            ))}
          </div>

          <Dialog open={openStreakCalendar} onOpenChange={setOpenStreakCalendar}>
            <DialogTrigger asChild>
              <Button className="dh-btn dh-streak-calendar-btn" type="button">
                <CalendarDays className="dh-streak-btn-icon" size={14} />
                View Streak Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="dh-streak-dialog">
              <DialogHeader>
                <DialogTitle>Streak Calendar Overview</DialogTitle>
                <DialogDescription>
                  Complete login history and study activity by day.
                </DialogDescription>
              </DialogHeader>
              <Calendar highlightedDates={loginHistory} />
            </DialogContent>
          </Dialog>
        </div>

      </section>

      <aside className="dh-growth dh-card">
        <h3>Study Growth</h3>
        <p>XP progress this week</p>
        <Progress
          className="dh-progress-track"
          indicatorClassName="dh-progress-fill"
          value={progressPercent}
        />
        <div className="dh-growth-row">
          <span className="dh-level-text">Level {level}</span>
          <span>{progressPercent}% to next</span>
        </div>

      </aside>

      <section className="dh-metrics-shell dh-card">
        <article className="dh-metric">
          <strong>{loading ? '...' : deckCount}</strong>
          <span>Total Decks</span>
        </article>
        <Separator orientation="vertical" />
        <article className="dh-metric">
          <strong>{loading ? '...' : totalCards}</strong>
          <span>Cards Mastered</span>
        </article>
        <Separator orientation="vertical" />
        <article className="dh-metric">
          <strong>{loading ? '...' : dueCount}</strong>
          <span>Due Today</span>
        </article>
      </section>

      <section className="dh-content-shell dh-card">
        <div className="dh-left">
          <article className="dh-card dh-achievements">
            <header>
              <div className="dh-achievements-title-wrap">
                <h3>Achievements</h3>
                <p className="dh-achievements-subtext">Recent milestones and wins</p>
              </div>
              <span className="dh-reward-chip">
                <Trophy size={12} />
                <span>3 unlocked</span>
              </span>
            </header>
            <div className="dh-achievement-tiles">
              <div className="dh-achievement-tile">
                <span className="dh-icon-wrap">
                  <Flame size={18} />
                </span>
                <h4>Week Warrior</h4>
                <p>6/7 days streak</p>
              </div>
              <div className="dh-achievement-tile">
                <span className="dh-icon-wrap">
                  <Trophy size={18} />
                </span>
                <h4>Quiz Master</h4>
                <p>Best score 92%</p>
              </div>
              <div className="dh-achievement-tile">
                <span className="dh-icon-wrap">
                  <Footprints size={18} />
                </span>
                <h4>First Steps</h4>
                <p>First review done</p>
              </div>
            </div>
          </article>

          <article className="dh-card dh-docs">
            <header>
              <h3>Documents Overview</h3>
              <span className="dh-doc-chip">Latest documents</span>
            </header>
            <p>Recent docs with quick visual preview.</p>

            <div className="dh-doc-list">
              {stockDocs.map((doc) => (
                <div className="dh-doc-item" key={doc.name}>
                  <div className="dh-doc-preview">
                    {doc.preview.map((line) => (
                      <span key={`${doc.name}-${line}`}>{line}</span>
                    ))}
                  </div>
                  <div className="dh-doc-meta">
                    <h4>{doc.name}</h4>
                    <p>{doc.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="dh-right">
          <article className="dh-card">
            <h3>Upcoming Reviews</h3>
            {upcomingReviews.length > 0 ? (
              <ScrollArea className="dh-scroll-area">
                <div className="dh-scroll-list">
                  {upcomingReviews.map((item) => (
                    <div className="dh-list-row" key={`${item.title}-${item.meta}`}>
                      <span>{item.title}</span>
                      <em className={`dh-list-time-${getDueMetaTone(item.meta)}`}>{item.meta}</em>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Empty
                title="No upcoming reviews"
                description="You're all caught up right now."
              />
            )}
          </article>

          <article className="dh-card">
            <h3>Study Rooms</h3>
            {studyRooms.length > 0 ? (
              <ScrollArea className="dh-scroll-area">
                <div className="dh-scroll-list">
                  {studyRooms.map((item) => (
                    <div className="dh-list-row" key={`${item.title}-${item.meta}`}>
                      <span>{item.title}</span>
                      <em className={`dh-list-time-${getDueMetaTone(item.meta)}`}>{item.meta}</em>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Empty
                title="No active study rooms"
                description="New rooms will show up here once they go live."
              />
            )}
          </article>
        </aside>
      </section>
    </div>
  );
};

export default DashboardHome;
