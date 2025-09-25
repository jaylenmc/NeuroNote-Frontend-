import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
    BarChart3, 
    TrendingUp, 
    Brain, 
    Target, 
    Star, 
    Trophy,
    ArrowLeft,
    Brain as BrainIcon,
    Target as TargetIcon,
    Zap,
    RotateCcw,
    Clock,
    TrendingDown,
    Book,
    Scroll,
    Calculator,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Minus
} from 'lucide-react';
import './ProgressPage.css';

const ProgressPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('performance');

    // Mock data for Learning Performance
    const performanceMetrics = {
        retentionRate: 87.3,
        accuracyRate: 82.1,
        firstPassMastery: 65.4,
        avgAttemptsPerMastery: 2.3,
        timeToMastery: 4.2,
        lapseCount: 12
    };

    // Mock data for Progress Over Time
    const progressData = {
        currentStreak: 7,
        longestStreak: 23,
        weeklyStats: [
            { day: 'Mon', cards: 65, time: 35, retention: 88 },
            { day: 'Tue', cards: 42, time: 22, retention: 85 },
            { day: 'Wed', cards: 78, time: 45, retention: 92 },
            { day: 'Thu', cards: 55, time: 32, retention: 89 },
            { day: 'Fri', cards: 38, time: 20, retention: 87 },
            { day: 'Sat', cards: 72, time: 40, retention: 91 },
            { day: 'Sun', cards: 48, time: 28, retention: 86 }
        ],
        peakHours: [9, 14, 20],
        deckGrowth: [
            { name: 'Biology', mastered: 156, total: 200, trend: '+12%' },
            { name: 'History', mastered: 89, total: 150, trend: '+8%' },
            { name: 'Math', mastered: 203, total: 250, trend: '+15%' }
        ]
    };

    // Mock data for Behavior Insights
    const behaviorInsights = {
        avgReviewSpeed: 3.2,
        sessionConsistency: 83,
        challengingDecks: [
            { name: 'Advanced Physics', accuracy: 62, retention: 71 },
            { name: 'Organic Chemistry', accuracy: 58, retention: 68 }
        ],
        improvedDecks: [
            { name: 'Basic Biology', accuracy: 89, improvement: '+15%' },
            { name: 'World History', accuracy: 85, improvement: '+12%' }
        ],
        reviewQueueHealth: {
            dueSoon: 23,
            overdue: 8,
            totalDue: 31
        }
    };

    // Mock data for Goal Tracking
    const goals = {
        dailyGoal: { target: 50, current: 38, progress: 76 },
        weeklyGoal: { target: 300, current: 285, progress: 95 },
        monthlyGoal: { target: 1200, current: 892, progress: 74 },
        estimatedDeckCompletion: 'Biology: 12 days',
        projectedMastery: 'History: March 15, 2024'
    };

    // Mock data for Quality of Study
    const qualityMetrics = {
        avgRecallTime: 8.5,
        difficultyRatings: [
            { level: 'Easy', percentage: 35, cards: 120 },
            { level: 'Medium', percentage: 45, cards: 154 },
            { level: 'Hard', percentage: 20, cards: 68 }
        ],
        retentionCurve: [
            { interval: '1 day', retention: 95 },
            { interval: '3 days', retention: 87 },
            { interval: '1 week', retention: 78 },
            { interval: '2 weeks', retention: 71 },
            { interval: '1 month', retention: 65 }
        ]
    };

    // Mock data for Motivation
    const motivation = {
        achievements: [
            { name: 'Study Streak Master', description: 'Studied for 30 days straight', earned: true, date: '2024-01-15' },
            { name: 'Card Master', description: 'Mastered 500 cards', earned: true, date: '2024-01-20' },
            { name: 'Speed Learner', description: 'Reviewed 100 cards in under 30 minutes', earned: false }
        ],
        comparison: {
            thisWeek: 342,
            lastWeek: 285,
            improvement: '+20%'
        },
        masteryDistribution: {
            new: 15,
            learning: 35,
            mastered: 50
        }
    };

    const handleBack = () => {
        navigate('/study-room');
    };

    const tabs = [
        { id: 'performance', label: 'Learning Performance', icon: <BarChart3 size={18} /> },
        { id: 'progress', label: 'Progress Over Time', icon: <TrendingUp size={18} /> },
        { id: 'behavior', label: 'Behavior Insights', icon: <Brain size={18} /> },
        { id: 'goals', label: 'Goal Tracking', icon: <Target size={18} /> },
        { id: 'quality', label: 'Quality of Study', icon: <Star size={18} /> },
        { id: 'motivation', label: 'Motivation', icon: <Trophy size={18} /> }
    ];

    const getPerformanceLevel = (value, isReverse = false) => {
        if (isReverse) {
            // For metrics where lower is better (like avg attempts, time to mastery, lapse count)
            if (value <= 2) return 'good';
            if (value <= 4) return 'average';
            return 'bad';
        } else {
            // For percentage metrics where higher is better
            if (value >= 80) return 'good';
            if (value >= 60) return 'average';
            return 'bad';
        }
    };

    const getInsightLevel = (value, type) => {
        if (type === 'speed') {
            // For review speed (cards/min) - higher is better
            if (value >= 4) return 'good';
            if (value >= 2.5) return 'average';
            return 'bad';
        } else if (type === 'consistency') {
            // For session consistency (%) - higher is better
            if (value >= 80) return 'good';
            if (value >= 60) return 'average';
            return 'bad';
        }
        return 'average';
    };

    const renderPerformanceMetrics = () => (
        <div className="metrics-grid">
            <div className="metric-card">
                <div className="metric-header">
                    <h3>Retention Rate</h3>
                    <TrendingUpIcon size={20} className={`metric-icon ${getPerformanceLevel(performanceMetrics.retentionRate)}`} />
                </div>
                <div className={`metric-value ${getPerformanceLevel(performanceMetrics.retentionRate)}`}>{performanceMetrics.retentionRate}%</div>
                <div className="metric-description">Cards correctly recalled in reviews</div>
            </div>

            <div className="metric-card">
                <div className="metric-header">
                    <h3>Accuracy Rate</h3>
                    <TrendingUpIcon size={20} className={`metric-icon ${getPerformanceLevel(performanceMetrics.accuracyRate)}`} />
                </div>
                <div className={`metric-value ${getPerformanceLevel(performanceMetrics.accuracyRate)}`}>{performanceMetrics.accuracyRate}%</div>
                <div className="metric-description">Correct vs incorrect answers</div>
            </div>

            <div className="metric-card">
                <div className="metric-header">
                    <h3>First-Pass Mastery</h3>
                    <TrendingUpIcon size={20} className={`metric-icon ${getPerformanceLevel(performanceMetrics.firstPassMastery)}`} />
                </div>
                <div className={`metric-value ${getPerformanceLevel(performanceMetrics.firstPassMastery)}`}>{performanceMetrics.firstPassMastery}%</div>
                <div className="metric-description">New cards learned correctly on first attempt</div>
            </div>

            <div className="metric-card">
                <div className="metric-header">
                    <h3>Avg Attempts</h3>
                    <Minus size={20} className={`metric-icon ${getPerformanceLevel(performanceMetrics.avgAttemptsPerMastery, true)}`} />
                </div>
                <div className={`metric-value ${getPerformanceLevel(performanceMetrics.avgAttemptsPerMastery, true)}`}>{performanceMetrics.avgAttemptsPerMastery}</div>
                <div className="metric-description">Reviews to master a card</div>
            </div>

            <div className="metric-card full-width">
                <div className="metric-header">
                    <h3>Time to Mastery</h3>
                    <Minus size={20} className={`metric-icon ${getPerformanceLevel(performanceMetrics.timeToMastery, true)}`} />
                </div>
                <div className={`metric-value ${getPerformanceLevel(performanceMetrics.timeToMastery, true)}`}>{performanceMetrics.timeToMastery} days</div>
                <div className="metric-description">Average time to master a card</div>
            </div>

            <div className="metric-card full-width">
                <div className="metric-header">
                    <h3>Lapse Count</h3>
                    <TrendingDownIcon size={20} className={`metric-icon ${getPerformanceLevel(performanceMetrics.lapseCount, true)}`} />
                </div>
                <div className={`metric-value ${getPerformanceLevel(performanceMetrics.lapseCount, true)}`}>{performanceMetrics.lapseCount}</div>
                <div className="metric-description">Previously-mastered cards forgotten</div>
            </div>
        </div>
    );

    const renderProgressOverTime = () => (
        <div className="progress-content">
            <div className="streak-section">
                <div className="streak-card">
                    <h3>Current Streak</h3>
                    <div className="streak-number">{progressData.currentStreak} days</div>
                    <div className="streak-record">Best: {progressData.longestStreak} days</div>
                </div>
            </div>

            <div className="weekly-chart">
                <h3>Weekly Performance</h3>
                <div className="chart-container">
                    {progressData.weeklyStats.map((day, index) => {
                        const isCurrentDay = index === new Date().getDay() - 1; // Adjust for Monday start
                        const performanceLevel = day.cards >= 50 ? 'high' : day.cards >= 35 ? 'medium' : 'low';
                        
                        return (
                            <div key={index} className="chart-bar">
                                <div className={`bar-fill ${performanceLevel}`} style={{ height: `${(day.cards / 80) * 100}%` }}></div>
                                <div className={`bar-label ${isCurrentDay ? 'current' : ''}`}>{day.day}</div>
                                <div className="bar-tooltip">
                                    <div>Cards: {day.cards}</div>
                                    <div>Time: {day.time}m</div>
                                    <div>Retention: {day.retention}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="peak-hours">
                <h3>Peak Performance Hours</h3>
                <div className="hours-grid">
                    {progressData.peakHours.map((hour, index) => (
                        <div key={index} className="hour-badge">
                            {hour}:00
                        </div>
                    ))}
                </div>
            </div>

            <div className="deck-growth">
                <h3>Deck Growth</h3>
                {progressData.deckGrowth.map((deck, index) => {
                    const getDeckIcon = (name) => {
                        if (name.toLowerCase().includes('biology')) return <Book size={16} className="deck-icon" />;
                        if (name.toLowerCase().includes('history')) return <Scroll size={16} className="deck-icon" />;
                        if (name.toLowerCase().includes('math')) return <Calculator size={16} className="deck-icon" />;
                        return <Book size={16} className="deck-icon" />;
                    };

                    return (
                        <div key={index} className="deck-item">
                            <div className="deck-info">
                                {getDeckIcon(deck.name)}
                                <div className="deck-name">
                                    <span>{deck.name}</span>
                                    <span className="deck-subtitle">{deck.mastered}/{deck.total} cards</span>
                                </div>
                                <span className="deck-trend">{deck.trend}</span>
                            </div>
                            <div className="deck-progress">
                                <div className="deck-bar">
                                    <div className="deck-fill" style={{ width: `${(deck.mastered / deck.total) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderBehaviorInsights = () => (
        <div className="behavior-content">
            <div className="insight-grid">
                <div className="insight-card">
                    <h3>Review Speed</h3>
                    <div className={`insight-value ${getInsightLevel(behaviorInsights.avgReviewSpeed, 'speed')}`}>{behaviorInsights.avgReviewSpeed} cards/min</div>
                    <div className="insight-description">Average review speed</div>
                </div>

                <div className="insight-card">
                    <h3>Session Consistency</h3>
                    <div className={`insight-value ${getInsightLevel(behaviorInsights.sessionConsistency, 'consistency')}`}>{behaviorInsights.sessionConsistency}%</div>
                    <div className="insight-description">Variation in session lengths</div>
                </div>
            </div>

            <div className="challenging-decks">
                <h3>Most Challenging Decks</h3>
                {behaviorInsights.challengingDecks.map((deck, index) => (
                    <div key={index} className="deck-performance">
                        <div className="deck-name">{deck.name}</div>
                        <div className="deck-metrics">
                            <span>Accuracy: {deck.accuracy}%</span>
                            <span>Retention: {deck.retention}%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="improved-decks">
                <h3>Most Improved Decks</h3>
                {behaviorInsights.improvedDecks.map((deck, index) => (
                    <div key={index} className="deck-improvement">
                        <div className="deck-name">{deck.name}</div>
                        <div className="improvement-metric">
                            Accuracy: {deck.accuracy}% ({deck.improvement})
                        </div>
                    </div>
                ))}
            </div>

            <div className="queue-health">
                <h3>Review Queue Health</h3>
                <div className="queue-stats">
                    <div className="queue-item">
                        <span className="queue-label">Due Soon</span>
                        <span className="queue-value">{behaviorInsights.reviewQueueHealth.dueSoon}</span>
                    </div>
                    <div className="queue-item">
                        <span className="queue-label">Overdue</span>
                        <span className="queue-value overdue">{behaviorInsights.reviewQueueHealth.overdue}</span>
                    </div>
                    <div className="queue-item">
                        <span className="queue-label">Total Due</span>
                        <span className="queue-value">{behaviorInsights.reviewQueueHealth.totalDue}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGoalTracking = () => (
        <div className="goals-content">
            <div className="goal-cards">
                <div className="goal-card">
                    <h3>Daily Goal</h3>
                    <div className="goal-progress">
                        <div className="goal-value">{goals.dailyGoal.current}/{goals.dailyGoal.target}</div>
                        <div className="goal-percentage">{goals.dailyGoal.progress}%</div>
                    </div>
                    <div className="goal-bar">
                        <div className="goal-fill" style={{ width: `${goals.dailyGoal.progress}%` }}></div>
                    </div>
                </div>

                <div className="goal-card">
                    <h3>Weekly Goal</h3>
                    <div className="goal-progress">
                        <div className="goal-value">{goals.weeklyGoal.current}/{goals.weeklyGoal.target}</div>
                        <div className="goal-percentage">{goals.weeklyGoal.progress}%</div>
                    </div>
                    <div className="goal-bar">
                        <div className="goal-fill" style={{ width: `${goals.weeklyGoal.progress}%` }}></div>
                    </div>
                </div>

                <div className="goal-card">
                    <h3>Monthly Goal</h3>
                    <div className="goal-progress">
                        <div className="goal-value">{goals.monthlyGoal.current}/{goals.monthlyGoal.target}</div>
                        <div className="goal-percentage">{goals.monthlyGoal.progress}%</div>
                    </div>
                    <div className="goal-bar">
                        <div className="goal-fill" style={{ width: `${goals.monthlyGoal.progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="projections">
                <div className="projection-card">
                    <h3>Estimated Completion</h3>
                    <div className="projection-item">
                        <span className="projection-label">Biology Deck:</span>
                        <span className="projection-value">{goals.estimatedDeckCompletion}</span>
                    </div>
                    <div className="projection-item">
                        <span className="projection-label">History Mastery:</span>
                        <span className="projection-value">{goals.projectedMastery}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderQualityOfStudy = () => (
        <div className="quality-content">
            <div className="quality-metrics">
                <div className="quality-card">
                    <h3>Active Recall Time</h3>
                    <div className="quality-value">{qualityMetrics.avgRecallTime}s</div>
                    <div className="quality-description">Average time spent thinking before revealing answer</div>
                </div>

                <div className="difficulty-distribution">
                    <h3>Card Difficulty Rating</h3>
                    <div className="difficulty-bars">
                        {qualityMetrics.difficultyRatings.map((difficulty, index) => (
                            <div key={index} className="difficulty-item">
                                <div className={`difficulty-label ${difficulty.level.toLowerCase()}`}>{difficulty.level}</div>
                                <div className="difficulty-bar">
                                    <div className="difficulty-fill" style={{ width: `${difficulty.percentage}%` }}></div>
                                </div>
                                <div className="difficulty-stats">
                                    <span>{difficulty.percentage}%</span>
                                    <span>({difficulty.cards} cards)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="retention-curve">
                    <h3>Retention Curve</h3>
                    <div className="curve-chart">
                        <svg className="curve-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="var(--accent-primary)" />
                                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                                </linearGradient>
                            </defs>
                            <path
                                className="curve-path"
                                d={`M 0,${200 - (qualityMetrics.retentionCurve[0].retention * 1.5)} 
                                    L 100,${200 - (qualityMetrics.retentionCurve[1].retention * 1.5)}
                                    L 200,${200 - (qualityMetrics.retentionCurve[2].retention * 1.5)}
                                    L 300,${200 - (qualityMetrics.retentionCurve[3].retention * 1.5)}
                                    L 400,${200 - (qualityMetrics.retentionCurve[4].retention * 1.5)}`}
                                fill="none"
                                stroke="url(#curveGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {qualityMetrics.retentionCurve.map((point, index) => (
                            <div key={index} className="curve-point">
                                <div className="point-value">{point.retention}%</div>
                                <div className="point-dot"></div>
                                <div className="point-label">{point.interval}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMotivation = () => (
        <div className="motivation-content">
            <div className="achievements-section">
                <div className="achievements-header">
                    <h3>Achievements & Milestones</h3>
                    <button className="view-achievements-btn">
                        View Achievements
                    </button>
                </div>
                <div className="achievements-grid">
                    {motivation.achievements.map((achievement, index) => (
                        <div key={index} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                            <div className="achievement-icon">
                                {achievement.earned ? '🏆' : '🔒'}
                            </div>
                            <div className="achievement-info">
                                <div className="achievement-name">{achievement.name}</div>
                                <div className="achievement-description">{achievement.description}</div>
                                {achievement.earned && (
                                    <div className="achievement-date">Earned: {achievement.date}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="comparison-section">
                <h3>Comparison to Past Self</h3>
                <div className="comparison-card">
                    <div className="comparison-stats">
                        <div className="comparison-item">
                            <span className="comparison-label">This Week:</span>
                            <span className="comparison-value">{motivation.comparison.thisWeek} cards</span>
                        </div>
                        <div className="comparison-item">
                            <span className="comparison-label">Last Week:</span>
                            <span className="comparison-value">{motivation.comparison.lastWeek} cards</span>
                        </div>
                        <div className="comparison-improvement">
                            <span className="improvement-text">You studied {motivation.comparison.improvement} more than last week!</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mastery-distribution">
                <h3>Deck Mastery Distribution</h3>
                <div className="distribution-chart">
                    <div className="distribution-item">
                        <div className="distribution-bar new" style={{ width: `${motivation.masteryDistribution.new}%` }}></div>
                        <span className="distribution-label">New ({motivation.masteryDistribution.new}%)</span>
                    </div>
                    <div className="distribution-item">
                        <div className="distribution-bar learning" style={{ width: `${motivation.masteryDistribution.learning}%` }}></div>
                        <span className="distribution-label">Learning ({motivation.masteryDistribution.learning}%)</span>
                    </div>
                    <div className="distribution-item">
                        <div className="distribution-bar mastered" style={{ width: `${motivation.masteryDistribution.mastered}%` }}></div>
                        <span className="distribution-label">Mastered ({motivation.masteryDistribution.mastered}%)</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderActiveContent = () => {
        switch (activeTab) {
            case 'performance':
                return renderPerformanceMetrics();
            case 'progress':
                return renderProgressOverTime();
            case 'behavior':
                return renderBehaviorInsights();
            case 'goals':
                return renderGoalTracking();
            case 'quality':
                return renderQualityOfStudy();
            case 'motivation':
                return renderMotivation();
            default:
                return renderPerformanceMetrics();
        }
    };

    return (
        <div className="progress-page">
            <button className="back-button" onClick={handleBack}>
                <ArrowLeft size={16} />
                Back to Study Room
            </button>
            
            <div className="progress-header">
                <h1>📊 Learning Analytics</h1>
                <p className="subtitle">Track your progress, analyze your learning patterns, and optimize your study habits</p>
            </div>

            <div className="progress-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="progress-content">
                {renderActiveContent()}
            </div>
        </div>
    );
};

export default ProgressPage; 