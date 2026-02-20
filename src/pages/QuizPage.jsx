import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { FiArrowLeft, FiMoreVertical, FiEye, FiPlay, FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import api from '../api/axios';
import './QuizPage.css';
import { formatDateForDisplay } from '../utils/dateUtils';


const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return formatDateForDisplay(dateString);
};

const formatTimeTaken = (totalSeconds) => {
  if (totalSeconds == null || totalSeconds < 0) return '—';
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  const hours = Math.floor(totalSeconds / 3600);
  if (totalSeconds < 3600) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  if (hours === 1) return minutes > 0 ? `1hr ${minutes}m` : '1hr';
  return minutes > 0 ? `${hours}hrs ${minutes}m` : `${hours}hrs`;
};

const getProgressColor = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'poor';
};

const getScoreDisplay = (score) => {
  if (score === null || score === undefined || score < 0) {
    return { text: '—', color: 'empty' };
  }
  
  if (score >= 90) {
    return { text: `${score}%`, color: 'excellent' };
  } else if (score >= 75) {
    return { text: `${score}%`, color: 'good' };
  } else if (score >= 50) {
    return { text: `${score}%`, color: 'needs-improvement' };
  } else {
    return { text: `${score}%`, color: 'poor' };
  }
};

const ScoreDisplay = ({ score }) => {
  const scoreInfo = getScoreDisplay(score);
  
  if (score === null || score === undefined || score < 0) {
    return (
      <div className="quiz-score-display empty" title="No score available">
        <span className="score-text">—</span>
      </div>
    );
  }
  
  const getProgressColor = (score) => {
    if (score >= 90) return '#10b981'; // Green
    if (score >= 75) return '#f59e0b'; // Yellow
    if (score >= 50) return '#fb923c'; // Orange
    return '#ef4444'; // Red
  };
  
  const progressColor = getProgressColor(score);
  
  return (
    <div className="quiz-score-container" title={`Score: ${score}%`}>
      <div className="quiz-score-text">{score}%</div>
      <div className="quiz-progress-bar">
        <div 
          className="quiz-progress-fill"
          style={{ 
            width: `${score}%`,
            background: `linear-gradient(90deg, ${progressColor} 0%, ${progressColor}dd 100%)`
          }}
        />
      </div>
    </div>
  );
};

const QuizPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('quizzes');
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const [dropdownFlipped, setDropdownFlipped] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
        fetchDecks();
    }, []);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && 
                !event.target.closest('.quiz-actions-dropdown') && 
                !event.target.closest('.dropdown-menu')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdown]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/test/quiz/');
            setQuizzes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setError('Failed to load quizzes. Please try again later.');
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDecks = async () => {
        try {
            const response = await api.get('/flashcards/deck/');
            const decksData = response.data.decks || response.data;
            setDecks(decksData);
        } catch (error) {
            console.error('Error fetching decks:', error);
        }
    };

    const handleDelete = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await api.delete(`/test/quiz/${quizId}/`);
                setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
            } catch (error) {
                console.error('Error deleting quiz:', error);
                setError('Failed to delete quiz. Please try again.');
            }
        }
    };

    const handleCreateQuiz = () => {
        navigate('/quiz/create');
    };

    const handleGenerateQuiz = () => {
        setShowGenerateModal(true);
    };

    const handleGenerateSubmit = async () => {
        if (!selectedDeck) {
            alert('Please select a deck');
            return;
        }

        try {
            setGenerating(true);
            const response = await api.post('/test/generate-quiz/', {
                deck_id: selectedDeck,
                question_count: questionCount
            });
            
            // Refresh quizzes list
            await fetchQuizzes();
            setShowGenerateModal(false);
            setSelectedDeck('');
            setQuestionCount(10);
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleReview = (quizId) => {
        navigate(`/quiz/${quizId}/review`);
    };

    const handleTest = (quizId) => {
        navigate(`/quiz/${quizId}/test`);
    };

    const handleEdit = (quizId) => {
        navigate(`/quiz/${quizId}/edit`);
    };

    const handleBack = () => {
        navigate('/study-room');
    };

    const handleDropdownToggle = (quizId, event) => {
        if (openDropdown === quizId) {
            setOpenDropdown(null);
        } else {
            const buttonRect = event.currentTarget.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Calculate available space below the button
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const dropdownHeight = 150; // Estimated dropdown height
            
            // If there's not enough space below, position above the button
            const shouldFlipUp = spaceBelow < dropdownHeight;
            
            setDropdownPosition({
                top: 0, // Will be handled by CSS
                right: 0 // Will be handled by CSS
            });
            setDropdownFlipped(shouldFlipUp);
            setOpenDropdown(quizId);
        }
    };

    const handleDropdownAction = (action, quizId) => {
        setOpenDropdown(null);
        switch (action) {
            case 'view':
                handleReview(quizId);
                break;
            case 'retake':
                handleTest(quizId);
                break;
            case 'edit':
                handleEdit(quizId);
                break;
            case 'delete':
                handleDelete(quizId);
                break;
        }
    };

    const QuizActionsDropdown = ({ quiz }) => {
        const isOpen = openDropdown === quiz.id;
        
        const dropdownContent = isOpen ? (
            <div 
                className={`dropdown-menu ${dropdownFlipped ? 'flipped' : ''}`}
            >
                {quiz.last_score !== null && quiz.last_score !== undefined ? (
                    <>
                        <button 
                            className="dropdown-item"
                            onClick={() => handleDropdownAction('view', quiz.id)}
                        >
                            <FiEye size={14} />
                            View Results
                        </button>
                        <button 
                            className="dropdown-item"
                            onClick={() => handleDropdownAction('retake', quiz.id)}
                        >
                            <FiPlay size={14} />
                            Retake Quiz
                        </button>
                    </>
                ) : (
                    <button 
                        className="dropdown-item"
                        onClick={() => handleDropdownAction('retake', quiz.id)}
                    >
                        <FiPlay size={14} />
                        Start Quiz
                    </button>
                )}
                <button 
                    className="dropdown-item"
                    onClick={() => handleDropdownAction('edit', quiz.id)}
                >
                    <FiEdit size={14} />
                    Edit Quiz
                </button>
                <button 
                    className="dropdown-item delete"
                    onClick={() => handleDropdownAction('delete', quiz.id)}
                >
                    <FiTrash2 size={14} />
                    Delete Quiz
                </button>
            </div>
        ) : null;
        
        return (
            <div className="quiz-actions-dropdown">
                <button 
                    className="dropdown-toggle"
                    onClick={(e) => handleDropdownToggle(quiz.id, e)}
                    title="More actions"
                >
                    <FiMoreVertical size={16} />
                </button>
                
                {dropdownContent}
            </div>
        );
    };

    const getQuizType = (questionCount) => {
        if (questionCount <= 5) return '~2 min quiz';
        if (questionCount <= 10) return '~5 min quiz';
        if (questionCount <= 20) return '~10 min quiz';
        return '~15 min quiz';
    };

    if (loading) {
        return (
            <div className="quiz-page">
                <div className="loading">Loading quizzes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-page">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchQuizzes}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-page">
            <div className="quiz-header">
                <div className="quiz-header-left">
                    <button className="quiz-back-button" onClick={handleBack}>
                        <FiArrowLeft /> Back to Study Room
                    </button>
                </div>
                <div className="quiz-header-right">
                    <button className="generate-button" onClick={handleGenerateQuiz}>
                        <span className="material-symbols-outlined generate-button-icon">casino</span> Generate Quiz
                    </button>
                <button className="create-button" onClick={handleCreateQuiz}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg> Create New Quiz
                </button>
            </div>
            </div>

            <div className="quiz-session-title-block">
                <div className="quiz-title-container">
                    <div className="quiz-title-content">
                        <h2 className="quiz-session-title">
                            <span className="quiz-title-text">Quiz Center</span>
                        </h2>
                        <p className="quiz-session-subtitle">
                            Test your knowledge, grow your mind.
                        </p>
                    </div>
                </div>
            </div>

            <div className="quiz-content">
            {!Array.isArray(quizzes) || quizzes.length === 0 ? (
                <div className="no-quizzes">
                    <div className="empty-state-illustration">
                        <div className="empty-state-content">
                            <h2 className="empty-state-title">No Quizzes Yet</h2>
                            <p className="empty-state-description">Ready to test your knowledge? Create your first quiz and start learning!</p>
                            <div className="no-quizzes-actions">
                                <button className="generate-button" onClick={handleGenerateQuiz}><span className="material-symbols-outlined generate-button-icon">casino</span> Generate Quiz</button>
                                <button className="create-button" onClick={handleCreateQuiz}>Create Quiz</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="quiz-table-container">
                    <table className="quiz-table">
                        <thead>
                            <tr>
                                <th className="quiz-th-center">Quiz Title</th>
                                <th className="quiz-th-center">Questions</th>
                                    <th className="quiz-th-center">Progress</th>
                                <th className="quiz-th-center">Last Attempt</th>
                                <th className="quiz-th-center">Time</th>
                                <th className="quiz-th-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                {quizzes.map((quiz, index) => {
                                return (
                                        <tr key={quiz.id} className={`quiz-row ${openDropdown === quiz.id ? 'dropdown-open' : ''}`} style={{
                                            animation: `fadeInUp 0.4s ease ${index * 0.1}s both`
                                        }}>
                                        <td className="quiz-td-center quiz-title">
                                            <div>
                                                <div>{quiz.topic}</div>
                                            </div>
                                        </td>
                                        <td className="quiz-question-count">{quiz.question_count || 0}</td>
                                            <td className="quiz-td-center">
                                                <ScoreDisplay score={quiz.last_score} />
                                            </td>
                                        <td className="quiz-td-center">{quiz.last_attempt ? formatDate(quiz.last_attempt) : '—'}</td>
                                        <td className="quiz-td-center">{formatTimeTaken(quiz.time_taken)}</td>
                                        <td className="quiz-td-center">
                                            <QuizActionsDropdown quiz={quiz} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>

            {/* Generate Quiz Modal */}
            {showGenerateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Generate Quiz from Flashcards</h3>
                        <p>Select a deck and we'll automatically create a quiz from your flashcards.</p>
                        
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Select Deck:</label>
                                <select 
                                    value={selectedDeck} 
                                    onChange={(e) => setSelectedDeck(e.target.value)}
                                    className="modal-select"
                                >
                                    <option value="">Choose a deck...</option>
                                    {decks.map(deck => (
                                        <option key={deck.id} value={deck.id}>
                                            {deck.name} ({deck.card_count || 0} cards)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Number of Questions:</label>
                                <select 
                                    value={questionCount} 
                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                    className="modal-select"
                                >
                                    <option value={5}>5 questions (~2 min)</option>
                                    <option value={10}>10 questions (~5 min)</option>
                                    <option value={15}>15 questions (~8 min)</option>
                                    <option value={20}>20 questions (~10 min)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button className="modal-btn cancel-btn" onClick={() => setShowGenerateModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="modal-btn confirm-btn generate-confirm-btn" 
                                onClick={handleGenerateSubmit}
                                disabled={generating || !selectedDeck}
                            >
                                {generating ? 'Generating...' : 'Generate Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage; 