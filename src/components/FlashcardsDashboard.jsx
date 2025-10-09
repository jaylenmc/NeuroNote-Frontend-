import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import blackboardBg from '../assets/Blackboard.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import api from '../api/axios';
import './FlashcardsNightOwl.css';

const FlashcardsDashboard = ({
    selectedReview,
    setSelectedReview,
    dueTodayCount,
    upcomingCards,
    reviewProgress,
    isTransitioning,
    refreshUserData
}) => {
    const navigate = useNavigate();
    
    // State for study stats
    const [studyStats, setStudyStats] = useState({
        total_cards_studied_today: 0,
        average_session_time: '00:00:00',
        mastered_decks: 0,
        time_studied_today: '00:00:00'
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

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
            setStatsLoading(true);
            setStatsError(null);
            
            // Get user timezone - default to UTC if not available
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            
            const response = await api.get('/solostudyroom/study-stats/', {
                params: {
                    user_timezone: userTimezone
                }
            });
            
            setStudyStats(response.data);
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
                <div className="nightowl-header-row">
                    <div className="nightowl-header-content">
                        <h1 className="nightowl-header-title">Launchpad 🚀</h1>
                        <div className="nightowl-header-subtitle-row">
                            <p className="nightowl-header-sub">Study smarter, not harder</p>
                            <span className="nightowl-streak-badge">
                                🔥 {stats.studyStreak} day streak
                            </span>
                        </div>
                    </div>
                    <button 
                        className="nightowl-studyroom-btn"
                        onClick={handleStudyRoomClick}
                    >
                        🎓 Study Room
                    </button>
                </div>

                <div className="nightowl-motivation-section">
                    
                    <div className="nightowl-sticky-notes">
                        {statsError && (
                            <div className="nightowl-stats-error">
                                <span className="nightowl-error-icon">⚠️</span>
                                <span className="nightowl-error-message">Unable to load stats</span>
                            </div>
                        )}
                        <div className="nightowl-sticky-note nightowl-sticky-due">
                            <div className="nightowl-sticky-header">
                                <span className="nightowl-sticky-icon">📚</span>
                                <span className="nightowl-sticky-title">Cards Studied Today</span>
                            </div>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : studyStats.total_cards_studied_today}
                            </div>
                        </div>
                        
                        <div className="nightowl-sticky-note nightowl-sticky-upcoming">
                            <div className="nightowl-sticky-header">
                                <span className="nightowl-sticky-icon">⏰</span>
                                <span className="nightowl-sticky-title">Average Session Time</span>
                            </div>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : formatTime(studyStats.average_session_time)}
                            </div>
                        </div>
                        
                        <div className="nightowl-sticky-note nightowl-sticky-correct">
                            <div className="nightowl-sticky-header">
                                <span className="nightowl-sticky-icon">📝</span>
                                <span className="nightowl-sticky-title">Time Studied Today</span>
                            </div>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : formatTime(studyStats.time_studied_today)}
                            </div>
                        </div>
                        
                        <div className="nightowl-sticky-note nightowl-sticky-mastered">
                            <div className="nightowl-sticky-header">
                                <span className="nightowl-sticky-icon">🏆</span>
                                <span className="nightowl-sticky-title">Mastered Decks</span>
                            </div>
                            <div className="nightowl-sticky-value">
                                {statsLoading ? '...' : studyStats.mastered_decks}
                            </div>
                        </div>
                    </div>
                </div>





                <div className="nightowl-section">
                    <div className="nightowl-section-header">
                        <h2 className="nightowl-section-title">🎯 Progress</h2>
                        <p className="nightowl-section-subtitle">Track your learning journey</p>
                    </div>
                    <div className="nightowl-xp-section">
                        <div className="nightowl-xp-container">
                            <div className="nightowl-xp-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle className="nightowl-xp-ring-bg" cx="50" cy="50" r="45" />
                                    <circle 
                                        className="nightowl-xp-ring-progress" 
                                        cx="50" 
                                        cy="50" 
                                        r="45"
                                        style={{
                                            strokeDasharray: `${(userProgress.progressPercentage / 100) * 283} 283`
                                        }}
                                    />
                                </svg>
                                <div className="nightowl-xp-center">
                                    <span className="nightowl-xp-level">Level {userProgress.level}</span>
                                    <span className="nightowl-xp-points">{userProgress.currentXP} / {userProgress.xpForNextLevel} XP</span>
                                </div>
                            </div>
                            <div className="nightowl-xp-next">
                                <span>{userProgress.xpForNextLevel - userProgress.currentXP} XP to Level {userProgress.level + 1}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Cards Chart Section */}
                <div className="nightowl-section">
                    <div className="nightowl-section-header">
                        <h2 className="nightowl-section-title">📅 Upcoming Cards</h2>
                        <p className="nightowl-section-subtitle">The number of cards which will be added to your queue over the next 30 days</p>
                    </div>
                    <div className="nightowl-upcoming-chart-container">
                        <div className="nightowl-upcoming-chart-header">
                            <div className="nightowl-upcoming-stats">
                                <div className="nightowl-upcoming-stat">
                                    <span className="nightowl-upcoming-stat-label">Average</span>
                                    <span className="nightowl-upcoming-stat-value">0 cards</span>
                                </div>
                                <div className="nightowl-upcoming-date-range">
                                    04 Sep 2025 - 04 Oct
                                </div>
                            </div>
                        </div>
                        <div className="nightowl-upcoming-chart-content">
                            {(() => {
                                const maxHeightPx = 120; // must match CSS height of .nightowl-upcoming-chart-bars
                                const scaleValues = [1.0, 0.8, 0.6, 0.4, 0.2, 0];
                                return (
                                    <div className="nightowl-upcoming-grid">
                                        {scaleValues.map((value, idx) => {
                                            const topPx = (1 - value / 1.0) * maxHeightPx;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="nightowl-upcoming-gridline"
                                                    style={{ top: `${topPx}px` }}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                            <div className="nightowl-upcoming-chart-bars">
                                {[
                                    { date: '05 Sep', cards: 1.0 },
                                    { date: '08 Sep', cards: 0.6 },
                                    { date: '11 Sep', cards: 0.4 },
                                    { date: '14 Sep', cards: 0.2 },
                                    { date: '17 Sep', cards: 0.2 },
                                    { date: '20 Sep', cards: 0.3 },
                                    { date: '23 Sep', cards: 0.1 },
                                    { date: '26 Sep', cards: 0.25 },
                                    { date: '29 Sep', cards: 0.35 },
                                    { date: '02 Oct', cards: 0.5 }
                                ].map((data, index) => (
                                    <div key={index} className="nightowl-upcoming-bar-group">
                                        <div 
                                            className="nightowl-upcoming-bar"
                                            style={{ 
                                                height: `${Math.max((data.cards / 1.0) * 120, 2)}px`,
                                                animationDelay: `${index * 0.1}s`,
                                                background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 60%, #1d4ed8 100%)'
                                            }}
                                            title={`${data.date}: ${data.cards} cards`}
                                        >
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="nightowl-upcoming-y-axis">
                                {[1.0, 0.8, 0.6, 0.4, 0.2, 0].map((value, index) => (
                                    <div key={index} className="nightowl-upcoming-y-label">
                                        {value}
                                    </div>
                                ))}
                            </div>
                            <div className="nightowl-upcoming-x-labels">
                                {[
                                    { date: '05 Sep' },
                                    { date: '08 Sep' },
                                    { date: '11 Sep' },
                                    { date: '14 Sep' },
                                    { date: '17 Sep' },
                                    { date: '20 Sep' },
                                    { date: '23 Sep' },
                                    { date: '26 Sep' },
                                    { date: '29 Sep' },
                                    { date: '02 Oct' }
                                ].map((data, index) => (
                                    <div key={index} className="nightowl-upcoming-x-label">
                                        {data.date}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {upcomingCards.length > 0 && (
                    <div className="nightowl-section">
                        <div className="nightowl-section-header">
                            <h2 className="nightowl-section-title">⏰ Upcoming</h2>
                            <p className="nightowl-section-subtitle">Cards scheduled for review</p>
                        </div>
                    <div className="upcoming-review-widget">
                        <h3 className="upcoming-review-widget-title">Upcoming Cards</h3>
                        <div className="upcoming-review-widget-content">
                            {upcomingCards.slice(0, 5).map((card, index) => (
                                <div key={index} className="upcoming-review-item">
                                    <div className="upcoming-review-item-question">
                                        <strong>Q:</strong> {card.question.substring(0, 50)}...
                                    </div>
                                    <div className="upcoming-review-item-date">
                                        Due: {formatDateForDisplay(card.scheduled_date)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    </div>
                )}
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
