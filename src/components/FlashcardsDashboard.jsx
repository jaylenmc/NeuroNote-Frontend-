import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from './ui/separator';
import api from '../api/axios';
import { getCurrentStudyQueue } from '../api/studyQueueApi';
import { getBucketInfo, BLACKLISTED_LABEL } from '../utils/buckets';
import './FlashcardsNightOwl.css';

const NIGHTOWL_STUDY_STATS_CACHE_KEY = 'nightowl-study-stats-v1';

const getDefaultStudyStats = () => ({
    total_cards_studied_today: 0,
    average_session_time: '00:00:00',
    mastered_decks: 0,
    time_studied_today: '00:00:00'
});

const readStudyStatsCache = () => {
    try {
        const raw = window.sessionStorage.getItem(NIGHTOWL_STUDY_STATS_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (
            typeof parsed?.total_cards_studied_today === 'number' &&
            typeof parsed?.average_session_time === 'string' &&
            typeof parsed?.mastered_decks === 'number' &&
            typeof parsed?.time_studied_today === 'string'
        ) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
};

const writeStudyStatsCache = (stats) => {
    try {
        window.sessionStorage.setItem(NIGHTOWL_STUDY_STATS_CACHE_KEY, JSON.stringify(stats));
    } catch {
        // Ignore storage failures and rely on in-memory state.
    }
};

const NightowlGrowthSkeleton = () => (
    <div className="nightowl-section-skeleton" aria-hidden="true">
        <div className="nightowl-skeleton nightowl-skeleton-growth-track" />
        <div className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--short" />
    </div>
);

const NightowlDueCardsSkeleton = () => (
    <div className="nightowl-due-cards-list nightowl-due-cards-list--loading" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="nightowl-skeleton nightowl-due-card-mini">
                <div className="nightowl-due-card-mini-status">
                    <div className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--dot" />
                    <div className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--pill-sm" />
                </div>
                <div className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--mini-question" />
            </div>
        ))}
    </div>
);

const FlashcardsDashboard = ({
    isTransitioning,
    refreshUserData
}) => {
    const navigate = useNavigate();
    
    // State for study stats
    const [studyStats, setStudyStats] = useState(() => readStudyStatsCache() || getDefaultStudyStats());
    const [statsLoading, setStatsLoading] = useState(() => !readStudyStatsCache());
    const [studyQueue, setStudyQueue] = useState(null);
    const [studyQueueLoading, setStudyQueueLoading] = useState(true);
    const queueCards = studyQueue?.cards || [];
    const studyableCount = queueCards.filter(card => card.slot_label !== BLACKLISTED_LABEL).length;

    // Helper function to format time strings (HH:MM:SS format)
    const formatTime = (timeString) => {
        if (!timeString || timeString === '00:00:00') {
            return '0 secs';
        }
        
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        const parts = [];
        
        // Add hours if not zero
        if (hours > 0) {
            parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
        }
        
        // Add minutes if not zero
        if (minutes > 0) {
            parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
        }
        
        // Add seconds if not zero
        if (seconds > 0) {
            parts.push(`${seconds} ${seconds === 1 ? 'sec' : 'secs'}`);
        }
        
        // If all parts are zero, return 0 secs
        if (parts.length === 0) {
            return '0 secs';
        }
        
        return parts.join(' ');
    };

    const fetchStudyStats = async () => {
        try {
            // Get user timezone - default to UTC if not available
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            
            const response = await api.get('/solostudyroom/study-stats/', {
                params: {
                    user_timezone: userTimezone
                }
            });
            
            const nextStats = response.data || getDefaultStudyStats();
            setStudyStats(nextStats);
            writeStudyStatsCache(nextStats);
        } catch (error) {
            console.error('Error fetching study stats:', error);
            // Keep default values on error
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchStudyQueue = async () => {
        try {
            setStudyQueue(await getCurrentStudyQueue());
        } catch (error) {
            console.error('Error fetching Study Queue:', error);
            setStudyQueue(null);
        } finally {
            setStudyQueueLoading(false);
        }
    };

    useEffect(() => {
        fetchStudyStats();
        fetchStudyQueue();
        if (refreshUserData) {
            refreshUserData();
        }
    }, [refreshUserData]);

    // Get real user data from session storage
    const getUserData = () => {
        try {
            const userData = JSON.parse(sessionStorage.getItem('user'));
            return userData || { level: 1, xp: 0 };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return { level: 1, xp: 0 };
        }
    };
    
    const userData = getUserData();
    
    // Use the same XP calculation logic as DashboardHome.jsx
    const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
    const xp = userData.xp || 0;
    const level = userData.level || 1;
    const nextLevelXp = xpForLevel(level);
    const progress = Math.min((xp / nextLevelXp) * 100, 100);
    
    const userProgress = {
        level: level,
        currentXP: xp,
        xpForNextLevel: nextLevelXp,
        progressPercentage: progress
    };

    const stats = {
        studyStreak: 7 // Mock data for now
    };

    const handleStudyRoomClick = () => {
        navigate('/study-room');
    };
    return (
        <div className="nightowl-flashcards-bg">
            <div className="nightowl-flashcards-content">
                <div className="nightowl-hero-shell">
                    <div className="nightowl-header-row">
                        <div className="nightowl-header-content">
                            <div className="nightowl-header-title-row">
                                <h1 className="nightowl-header-title">Launchpad</h1>
                                <span className="nightowl-streak-badge">
                                    <span className="nightowl-streak-reward-glow">
                                        <Flame className="nightowl-streak-reward-icon" size={15} />
                                        <span className="nightowl-streak-reward-count">{stats.studyStreak}</span>
                                    </span>
                                </span>
                            </div>
                        </div>
                        <button 
                            className="nightowl-studyroom-btn"
                            onClick={handleStudyRoomClick}
                        >
                           Study Room
                        </button>
                    </div>
                    <div className="nightowl-sticky-notes">
                        <div className="nightowl-sticky-note">
                            <span className="nightowl-sticky-title">Cards Studied Today</span>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : studyStats.total_cards_studied_today}
                            </div>
                        </div>
                        <Separator orientation="vertical" className="nightowl-sticky-separator" />
                        
                        <div className="nightowl-sticky-note">
                            <span className="nightowl-sticky-title">Average Session Time</span>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : formatTime(studyStats.average_session_time)}
                            </div>
                        </div>
                        <Separator orientation="vertical" className="nightowl-sticky-separator" />
                        
                        <div className="nightowl-sticky-note">
                            <span className="nightowl-sticky-title">Time Studied Today</span>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : formatTime(studyStats.time_studied_today)}
                            </div>
                        </div>
                        <Separator orientation="vertical" className="nightowl-sticky-separator" />
                        
                        <div className="nightowl-sticky-note">
                            <span className="nightowl-sticky-title">Mastered Decks</span>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : studyStats.mastered_decks}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nightowl-section" aria-busy={statsLoading}>
                    <div className="nightowl-section-header-study-growth nightowl-growth-header">
                        {statsLoading ? (
                            <>
                                <span
                                    className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--section-title"
                                    aria-hidden="true"
                                />
                                <span
                                    className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--percent"
                                    aria-hidden="true"
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="nightowl-section-title">Study Growth</h2>
                                <span className="nightowl-growth-percent">
                                    {Math.round(userProgress.progressPercentage)}%
                                </span>
                            </>
                        )}
                    </div>
                    {statsLoading ? (
                        <NightowlGrowthSkeleton />
                    ) : (
                        <div className="nightowl-growth-card">
                            <div className="nightowl-growth-track">
                                <div
                                    className="nightowl-growth-fill"
                                    style={{
                                        width: `${Math.max(
                                            8,
                                            Math.min(100, Math.round(userProgress.progressPercentage)),
                                        )}%`,
                                    }}
                                />
                            </div>
                            <div className="nightowl-growth-meta">
                                <span className="nightowl-growth-level">Level {userProgress.level}</span>
                            </div>
                        </div>
                    )}
                </div>

                {studyQueueLoading ? (
                    <div className="nightowl-section nightowl-section-due-cards" aria-busy="true">
                        <div className="nightowl-section-header-study-growth">
                            <span
                                className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--section-title"
                                aria-hidden="true"
                            />
                            <span
                                className="nightowl-skeleton nightowl-skeleton-line nightowl-skeleton-line--section-subtitle"
                                aria-hidden="true"
                            />
                        </div>
                        <NightowlDueCardsSkeleton />
                    </div>
                ) : queueCards.length > 0 ? (
                    <div className="nightowl-section nightowl-section-due-cards">
                        <div className="nightowl-section-header-study-growth nightowl-section-header-due-cards">
                            <div className="nightowl-section-header-due-cards-text">
                                <h2 className="nightowl-section-title">Study Queue</h2>
                                <p className="nightowl-section-subtitle">
                                    {studyableCount} of {queueCards.length} cards ready to review
                                </p>
                            </div>
                            <button
                                type="button"
                                className="nightowl-studyroom-btn nightowl-study-queue-btn"
                                onClick={() => navigate('/review')}
                            >
                                Open Study Queue
                            </button>
                        </div>
                        <div className="nightowl-due-cards-list">
                            {queueCards.map(card => {
                                const isBlacklisted = card.slot_label === BLACKLISTED_LABEL;
                                const bucket = getBucketInfo(card.bucket);
                                const statusLabel = isBlacklisted ? BLACKLISTED_LABEL : bucket.label;
                                const statusColor = isBlacklisted ? '#f87171' : bucket.color;
                                const statusHint = isBlacklisted
                                    ? 'This card is blacklisted and cannot be studied.'
                                    : bucket.description;
                                return (
                                    <div
                                        key={card.id}
                                        className="nightowl-due-card-mini"
                                        title={statusHint}
                                    >
                                        <div className="nightowl-due-card-mini-status">
                                            <span
                                                className="nightowl-due-card-mini-dot"
                                                style={{ backgroundColor: statusColor }}
                                                aria-hidden="true"
                                            />
                                            <span
                                                className="nightowl-due-card-mini-label"
                                                style={{ color: statusColor }}
                                            >
                                                {statusLabel}
                                            </span>
                                        </div>
                                        <p className="nightowl-due-card-mini-question">{card.question}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="nightowl-section-empty" role="status">
                        <h2 className="nightowl-section-empty-title">Study Queue</h2>
                        <p className="nightowl-section-empty-message">
                            {studyQueue
                                ? "You're all caught up! No eligible cards right now."
                                : 'No active Study Queue. Generate one from the Review page.'}
                        </p>
                        <button
                            type="button"
                            className="nightowl-studyroom-btn nightowl-study-queue-btn"
                            onClick={() => navigate('/review')}
                        >
                            {studyQueue ? 'Open Study Queue' : 'Generate Study Queue'}
                        </button>
                    </div>
                )}

                {/* Upcoming Cards Chart Section (dKYpr sync) */}
                <div className="nightowl-section nightowl-section-upcoming-cards">
                    <div className="nightowl-section-header nightowl-section-header-upcoming-cards">
                        <div className="nightowl-upcoming-cards-heading">
                            <div>
                                <h2 className="nightowl-section-title">Average Cards Studied</h2>
                                <p className="nightowl-section-subtitle">Cards entering your queue over the next 30 days</p>
                            </div>
                        </div>
                        <div className="nightowl-upcoming-chart-header-right">
                            <span className="nightowl-upcoming-date-range">04 Sep 2025 - 04 Oct</span>
                            <span className="nightowl-upcoming-average">Average: 46 cards</span>
                        </div>
                    </div>
                    <div className="nightowl-upcoming-chart-container">
                        <div className="nightowl-upcoming-chart-header">
                        </div>
                        <div className="nightowl-upcoming-chart-content">
                            <div className="nightowl-upcoming-chart-bars">
                                <div className="nightowl-upcoming-bar nightowl-upcoming-bar-fixed" style={{ width: 179, height: 230 }} />
                                <div className="nightowl-upcoming-bar nightowl-upcoming-bar-fixed" style={{ width: 179, height: 98 }} />
                                <div className="nightowl-upcoming-bar nightowl-upcoming-bar-flex" style={{ height: 48 }} />
                                <div className="nightowl-upcoming-bar nightowl-upcoming-bar-flex" style={{ height: 28 }} />
                                <div className="nightowl-upcoming-bar nightowl-upcoming-bar-flex" style={{ height: 22 }} />
                                <div className="nightowl-upcoming-bar nightowl-upcoming-bar-fixed" style={{ width: 179, height: 123 }} />
                                <div className="nightowl-upcoming-bar nightowl-upcoming-bar-flex" style={{ height: 16 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isTransitioning && (
                <div className="transition-overlay">
                    <div className="transition-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default FlashcardsDashboard; 
