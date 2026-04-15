import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiSettings } from 'react-icons/fi';
import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from './ui/separator';
import blackboardBg from '../assets/Blackboard.png';
import closedFolderIconFallback from '../assets/ClosedFolder.svg';
import openFolderIconFallback from '../assets/OpenFolder.svg';
import { formatDateForDisplay } from '../utils/dateUtils';
import api from '../api/axios';
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

const FlashcardsDashboard = ({
    selectedReview,
    setSelectedReview,
    dueTodayCount,
    upcomingCards,
    reviewProgress,
    isTransitioning,
    refreshUserData,
    folderClosedIcon,
    folderOpenIcon
}) => {
    const navigate = useNavigate();
    
    // State for study stats
    const [studyStats, setStudyStats] = useState(() => readStudyStatsCache() || getDefaultStudyStats());
    const [statsLoading, setStatsLoading] = useState(() => !readStudyStatsCache());
    const [statsError, setStatsError] = useState(null);
    const [upcomingCardsSectionOpen, setUpcomingCardsSectionOpen] = useState(true);

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
            setStatsError(null);
            
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
            setStatsError(error.message || 'Failed to fetch study stats');
            // Keep default values on error
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch study stats from backend
    useEffect(() => {
        fetchStudyStats();
        // Also refresh user data to get updated XP and level
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

    // Generate motivational message based on user progress
    const getMotivationalMessage = () => {
        const xpToNextLevel = userProgress.xpForNextLevel - userProgress.currentXP;
        const correctCards = reviewProgress.last7Days.correct;
        const masteredCards = reviewProgress.last7Days.incorrect; // Using incorrect as mastered for demo
        
        // Level up messages
        if (xpToNextLevel <= 10) {
            return {
                message: `Almost there! Just ${xpToNextLevel} XP to Level ${userProgress.level + 1} 🎉`,
                type: 'level-up'
            };
        } else if (xpToNextLevel <= 20) {
            return {
                message: `Keep it up, you're only ${xpToNextLevel} XP away from Level ${userProgress.level + 1} 🎉`,
                type: 'level-up'
            };
        }
        
        // High performance messages
        if (correctCards >= 15) {
            return {
                message: `Incredible! ${correctCards} cards mastered — you're a study champion!`,
                type: 'level-up'
            };
        } else if (correctCards >= 10) {
            return {
                message: `You mastered ${masteredCards} cards — almost leaderboard ready 👑`,
                type: 'level-up'
            };
        }
        
        // Streak messages
        if (stats.studyStreak >= 7) {
            return {
                message: `Wow! ${stats.studyStreak} days strong — you're unstoppable! 🔥`,
                type: 'streak'
            };
        } else if (stats.studyStreak >= 3) {
            return {
                message: `Amazing ${stats.studyStreak}-day streak! You're on fire 🔥`,
                type: 'streak'
            };
        }
        
        // Motivation messages
        if (dueTodayCount >= 10) {
            return {
                message: `Big day ahead! ${dueTodayCount} cards waiting — let's dominate! 💪`,
                type: 'motivation'
            };
        } else if (dueTodayCount > 0) {
            return {
                message: `You have ${dueTodayCount} cards due today — let's crush them! 💪`,
                type: 'motivation'
            };
        }
        
        // Encouragement messages
        const encouragementMessages = [
            "Ready to level up your learning? Let's dive in! 🚀",
            "Time to unlock your potential — let's study! ⭐",
            "Your brain is a muscle — let's flex it! 🧠",
            "Every card mastered is a step closer to greatness! 🌟"
        ];
        
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        return {
            message: randomMessage,
            type: 'encouragement'
        };
    };

    const motivationalData = getMotivationalMessage();

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
                            <div className="nightowl-header-subtitle-row">
                                <p className="nightowl-header-sub">Study smarter, not harder</p>
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





                <div className="nightowl-section">
                    <div className="nightowl-section-header-study-growth">
                        <h2 className="nightowl-section-title">Study Growth</h2>
                        <p className="nightowl-section-subtitle">XP progress this week</p>
                    </div>
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
                            <span className="nightowl-growth-next">
                                {Math.round(userProgress.progressPercentage)}% to Level {userProgress.level + 1}
                            </span>
                        </div>
                    </div>
                </div>

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
                    {upcomingCardsSectionOpen && (
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
                    )}
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
