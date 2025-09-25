import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiPlus, FiClock, FiEdit3 } from 'react-icons/fi';
import './FocusPage.css';
import api from '../api/axios';

const MOTIVATION_QUOTES = [
    "Small steps every day lead to big results.",
    "Stay focused and never give up!",
    "Progress, not perfection.",
    "You are capable of amazing things.",
    "Discipline is the bridge between goals and accomplishment."
];

const FocusPage = () => {
    const navigate = useNavigate();
    
    // Daily Intentions
    const [dailyIntention, setDailyIntention] = useState('');
    const [isIntentionStamped, setIsIntentionStamped] = useState(false);
    const [isEditingIntention, setIsEditingIntention] = useState(false);
    
    // Tasks/To-Do List
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTags, setNewTaskTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [decks, setDecks] = useState([]);
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);
    
    // Distraction Journal
    const [distractionNotes, setDistractionNotes] = useState('');
    const [distractionHistory, setDistractionHistory] = useState([]);
    
    // Focus Stats
    const [focusStats, setFocusStats] = useState({
        totalFocusTime: 0,
        tasksCompleted: 0,
        focusStreak: 7,
        todayTasks: 3,
        breakTime: 0
    });
    
    // Focus Mode Lock
    const [isFocusMode, setIsFocusMode] = useState(false);
    // Active Tab
    const [activeTab, setActiveTab] = useState('overview');
    
    // Task groups
    const todayTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    // Progress
    const percentComplete = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    
    // Tag logic
    const [tagColor, setTagColor] = useState('#7c83fd');
    const [tagColors, setTagColors] = useState({});
    const handleTagInputChange = (e) => setTagInput(e.target.value);
    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault();
            if (tagInput.trim() && !newTaskTags.includes(tagInput.trim())) {
                setNewTaskTags([...newTaskTags, tagInput.trim()]);
                setTagInput('');
            }
        }
    };
    const removeTag = (tagToRemove) => {
        setNewTaskTags(newTaskTags.filter(tag => tag !== tagToRemove));
    };
    const getTagColor = (tag) => {
        const lower = tag.toLowerCase();
        if (lower === 'study') return '#7c83fd';
        if (lower === 'break') return '#22c55e';
        if (lower === 'exercise') return '#fbbf24';
        if (lower === 'other') return '#ef4444';
        let hash = 0; for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        const h = hash % 360; return `hsl(${h}, 70%, 80%)`;
    };
    
    // Handlers
    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            const newTask = {
                id: Date.now(),
                title: newTaskTitle,
                completed: false,
                tags: newTaskTags,
                time: newTaskTime,
                deckId: selectedDeckId || null,
                deckTitle: selectedDeckId ? (decks.find(d => String(d.id) === String(selectedDeckId))?.title || '') : '',
                createdAt: new Date().toISOString()
            };
            setTasks([...tasks, newTask]);
            setNewTaskTitle('');
            setNewTaskTags([]);
            setTagInput('');
            setNewTaskTime('');
            setSelectedDeckId('');
        }
    };
    const handleToggleTask = (index) => {
        const updatedTasks = [...tasks];
        updatedTasks[index].completed = !updatedTasks[index].completed;
        setTasks(updatedTasks);
    };
    const handleDeleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };
    const handleLogDistraction = () => {
        if (distractionNotes.trim()) {
            const newDistraction = {
                id: Date.now(),
                text: distractionNotes,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setDistractionHistory([newDistraction, ...distractionHistory]);
            setDistractionNotes('');
        }
    };
    
    // Goal card logic
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];

    // Fetch user decks for deck selector
    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const response = await api.get('/flashcards/deck/');
                const decksData = response.data?.decks || response.data || [];
                setDecks(Array.isArray(decksData) ? decksData : []);
            } catch (err) {
                console.error('Failed to load decks', err);
            }
        };
        fetchDecks();
    }, []);
    
    return (
        <div className={`focus-page ${isFocusMode ? 'focus-mode' : ''}`}>
            <button className="focus-back-button" onClick={() => navigate('/study-room')}>
                <FiArrowLeft /> Back to Study Room
            </button>
            <div className="focus-header">
                <h1 className="focus-title">🌱 Focus Space</h1>
                <div className="focus-subtitle">Set your intention, track your tasks, and stay distraction-free.</div>
            </div>

            {/* Focus Mode Toggle */}
            <div className="focus-mode-section">
                <button className="focus-mode-toggle" onClick={() => setIsFocusMode(!isFocusMode)}>
                    {isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                </button>
            </div>

            {/* Focus Tabs */}
            <div className="focus-tabs">
                <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <FiClock className="tab-icon" />
                    Overview
                </button>
                <button className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    <FiCheck className="tab-icon" />
                    Tasks
                </button>
                <button className={`tab-button ${activeTab === 'distractions' ? 'active' : ''}`} onClick={() => setActiveTab('distractions')}>
                    <FiX className="tab-icon" />
                    Distractions
                </button>
                <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                    <FiEdit3 className="tab-icon" />
                    Analytics
                </button>
            </div>

            {/* Focus Content */}
            <div className="focus-content">
                {activeTab === 'overview' && (
                    <div className="focus-overview">
                        {/* Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">⏰</div>
                                <div className="stat-value">{focusStats.totalFocusTime}h</div>
                                <div className="stat-label">Focus Time</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-value">{focusStats.tasksCompleted}</div>
                                <div className="stat-label">Tasks Completed</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🔥</div>
                                <div className="stat-value">{focusStats.focusStreak}</div>
                                <div className="stat-label">Day Streak</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">☕️</div>
                                <div className="stat-value">{focusStats.breakTime}m</div>
                                <div className="stat-label">Break Time</div>
                            </div>
                        </div>

                        {/* Goal Card */}
                        <div className="goal-section">
                            <h3 className="section-title">Today's Goal</h3>
                            <div className="goal-card">
                                {!isIntentionStamped ? (
                                    <form className="goal-stamp-form" onSubmit={e => { e.preventDefault(); if (dailyIntention.trim()) { setIsIntentionStamped(true); setIsEditingIntention(false); } }}>
                                        <textarea
                                            className={`goal-textarea${dailyIntention ? '' : ' empty'}`}
                                            value={dailyIntention}
                                            onChange={e => setDailyIntention(e.target.value)}
                                            placeholder="Type your main focus for today..."
                                            rows={2}
                                        />
                                        <button type="submit" className="goal-stamp-btn">Stamp It</button>
                                    </form>
                                ) : (
                                    <div className="stamped-goal-card">
                                        <div className="stamped-goal-content">
                                            <span className="stamp-icon">🏷️</span>
                                            {isEditingIntention ? (
                                                <textarea
                                                    className="goal-textarea"
                                                    value={dailyIntention}
                                                    onChange={e => setDailyIntention(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            setIsEditingIntention(false);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setIsEditingIntention(false);
                                                        }
                                                    }}
                                                    rows={1}
                                                    autoFocus
                                                    style={{ 
                                                        background: 'transparent', 
                                                        border: 'none', 
                                                        color: 'var(--text-primary)', 
                                                        fontSize: '1rem',
                                                        resize: 'none',
                                                        outline: 'none',
                                                        flex: 1,
                                                        fontFamily: 'inherit',
                                                        lineHeight: '1.2',
                                                        padding: '0.5rem',
                                                        margin: '0 0.5rem'
                                                    }}
                                                />
                                            ) : (
                                                <span 
                                                    className="stamped-goal-text" 
                                                    onClick={() => setIsEditingIntention(true)}
                                                    style={{ cursor: 'text', flex: 1 }}
                                                >
                                                    {dailyIntention}
                                                </span>
                                            )}
                                            {isEditingIntention ? (
                                                <div className="goal-edit-controls">
                                                    <button 
                                                        className="goal-edit-btn" 
                                                        onClick={() => setIsEditingIntention(false)}
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                    <button 
                                                        className="goal-edit-btn" 
                                                        onClick={() => setIsEditingIntention(false)}
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="goal-edit-controls">
                                                    <button className="goal-edit-btn" onClick={() => setIsEditingIntention(true)}>
                                                        <FiEdit3 />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="stamped-goal-timestamp">
                                            Stamped on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="focus-tasks">
                        <h3 className="section-title">Tasks & Reminders</h3>
                        <div className="tasks-content">
                            {/* Add Task Form */}
                            <div className="add-task-section">
                                <form className="add-task-form" onSubmit={handleAddTask}>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="What needs to be done?"
                                        className="task-input"
                                    />
                                    <div className="task-meta">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyDown={handleTagInputKeyDown}
                                            placeholder="Add tags (press Enter)"
                                            className="tag-input"
                                        />
                                        <select
                                            value={selectedDeckId}
                                            onChange={(e) => setSelectedDeckId(e.target.value)}
                                            className="deck-select"
                                        >
                                            <option value="">No deck</option>
                                            {decks.map(deck => (
                                                <option key={deck.id} value={deck.id}>{deck.title}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={newTaskTime}
                                            onChange={(e) => setNewTaskTime(e.target.value)}
                                            placeholder="Time (e.g., 2h, 30m)"
                                            className="time-input"
                                        />
                                    </div>
                                    <button type="submit" className="add-task-btn">
                                        <FiPlus /> Add Task
                                    </button>
                                </form>
                            </div>

                            {/* Tasks List */}
                            <div className="tasks-list">
                                {todayTasks.map((task, index) => (
                                    <div key={index} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                        <button
                                            className="task-checkbox"
                                            onClick={() => handleToggleTask(index)}
                                        >
                                            {task.completed ? <FiCheck /> : ''}
                                        </button>
                                        <div className="task-content">
                                            <div className="task-title">{task.title}</div>
                                            <div className="task-meta">
                                                {task.tags.map((tag, tagIndex) => (
                                                    <span
                                                        key={tagIndex}
                                                        className="task-tag"
                                                        style={{ backgroundColor: getTagColor(tag) }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {task.deckTitle && (
                                                    <span className="task-deck">Deck: {task.deckTitle}</span>
                                                )}
                                                {task.time && <span className="task-time">{task.time}</span>}
                                            </div>
                                        </div>
                                        <button
                                            className="task-delete"
                                            onClick={() => handleDeleteTask(index)}
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'distractions' && (
                    <div className="focus-distractions">
                        <h3 className="section-title">Distraction Log</h3>
                        <div className="distraction-content">
                            <div className="distraction-input-section">
                                <textarea
                                    value={distractionNotes}
                                    onChange={(e) => setDistractionNotes(e.target.value)}
                                    placeholder="What's distracting you right now? Write it down to clear your mind..."
                                    className="distraction-textarea"
                                    rows={4}
                                />
                                <button
                                    className="log-distraction-btn"
                                    onClick={handleLogDistraction}
                                    disabled={!distractionNotes.trim()}
                                >
                                    Log Distraction
                                </button>
                            </div>

                            <div className="distraction-history">
                                <h4>Recent Distractions</h4>
                                <div className="distraction-list">
                                    {distractionHistory.slice(0, 8).map(distraction => (
                                        <div key={distraction.id} className="distraction-item">
                                            <span className="distraction-text">{distraction.text}</span>
                                            <span className="distraction-time">{distraction.timestamp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="focus-analytics">
                        <h3 className="section-title">Focus Analytics</h3>
                        <div className="analytics-content">
                            <div className="analytics-grid">
                                <div className="analytics-card">
                                    <h4>Focus Patterns</h4>
                                    <div className="focus-patterns">
                                        <div className="pattern-item">
                                            <span className="pattern-label">Peak Focus Time</span>
                                            <span className="pattern-value">2:00 PM - 4:00 PM</span>
                                        </div>
                                        <div className="pattern-item">
                                            <span className="pattern-label">Average Session</span>
                                            <span className="pattern-value">45 minutes</span>
                                        </div>
                                        <div className="pattern-item">
                                            <span className="pattern-label">Distraction Rate</span>
                                            <span className="pattern-value">2.3 per hour</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="analytics-card">
                                    <h4>Productivity Trends</h4>
                                    <div className="productivity-trends">
                                        <div className="trend-item">
                                            <span className="trend-label">This Week</span>
                                            <span className="trend-value up">+15%</span>
                                        </div>
                                        <div className="trend-item">
                                            <span className="trend-label">Task Completion</span>
                                            <span className="trend-value up">+8%</span>
                                        </div>
                                        <div className="trend-item">
                                            <span className="trend-label">Focus Time</span>
                                            <span className="trend-value up">+22%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FocusPage;