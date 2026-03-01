import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { FiArrowLeft, FiMoreVertical, FiEye, FiPlay, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
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

const formatQuizType = (quizType) => {
  if (!quizType) return '—';
  const t = String(quizType).toLowerCase();
  if (t === 'mc') return 'MC';
  if (t === 'wr') return 'WR';
  if (t === 'wrmc') return 'Mixed';
  return quizType;
};

const highlightMatch = (text, query) => {
  if (!text || typeof text !== 'string') return text;
  const q = (query || '').trim();
  if (!q) return text;
  try {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(re);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="quiz-search-highlight">{part}</span>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
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
    const [genTopic, setGenTopic] = useState('');
    const [genType, setGenType] = useState('mc'); // 'mc' | 'wr' | 'wrmc'
    const [genQuestionNum, setGenQuestionNum] = useState(5);
    const [genError, setGenError] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const [dropdownFlipped, setDropdownFlipped] = useState(false);
    const [quizSearch, setQuizSearch] = useState('');
    const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState(null);
    const [startQuizModalQuiz, setStartQuizModalQuiz] = useState(null);
    const [startQuizMinutes, setStartQuizMinutes] = useState(10);
    const [startQuizHours, setStartQuizHours] = useState(0);
    const navigate = useNavigate();

    const filteredQuizzes = React.useMemo(() => {
        if (!Array.isArray(quizzes)) return [];
        const q = (quizSearch || '').trim().toLowerCase();
        if (!q) return quizzes;
        return quizzes.filter(
            (quiz) =>
                (quiz.topic && quiz.topic.toLowerCase().includes(q)) ||
                (quiz.subject && quiz.subject.toLowerCase().includes(q))
        );
    }, [quizzes, quizSearch]);

    useEffect(() => {
        fetchQuizzes();
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

    const handleDeleteClick = (quiz) => {
        setDeleteConfirmQuiz(quiz);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmQuiz) return;
        const quizId = deleteConfirmQuiz.id;
        try {
            await api.delete(`/test/quiz/${quizId}/`);
            setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
            setDeleteConfirmQuiz(null);
        } catch (err) {
            console.error('Error deleting quiz:', err);
            setError('Failed to delete quiz. Please try again.');
            setDeleteConfirmQuiz(null);
        }
    };

    const handleCreateQuiz = () => {
        navigate('/quiz/create');
    };

    const handleGenerateQuiz = () => {
        setShowGenerateModal(true);
    };

    const handleGenerateSubmit = async () => {
        setGenError('');

        if (!genTopic.trim()) {
            setGenError('Please enter a topic for the quiz.');
            return;
        }
        if (!genType) {
            setGenError('Please choose a quiz type.');
            return;
        }
        if (!genQuestionNum || genQuestionNum <= 0) {
            setGenError('Please enter a valid number of questions.');
            return;
        }

        try {
            setGenerating(true);
            const response = await api.post('/tutor/testgen/', {
                user_prompt: genTopic.trim(),
                preferred_quiz_type: genType,
                question_num: genQuestionNum
            });

            // Response is quiz info only; use its id to open the quiz in edit mode (edit page will load by id)
            const quizData = response?.data?.quiz ?? response?.data;
            const newQuizId = quizData?.id;
            if (!newQuizId) {
                console.error('AI quiz generation did not return an id:', response?.data);
                setGenError('Generated quiz is missing an id. Please try again.');
                return;
            }

            // Optionally refresh quizzes list in the background
            fetchQuizzes();

            setShowGenerateModal(false);
            setGenTopic('');
            setGenType('mc');
            setGenQuestionNum(5);

            navigate(`/quiz/${newQuizId}/edit`, {
                state: { fromGenerated: true }
            });
        } catch (error) {
            console.error('Error generating quiz:', error);
            setGenError('Failed to generate quiz. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleReview = (quizId) => {
        navigate(`/quiz/${quizId}/review`);
    };

    const handleTest = (quizId) => {
        const quiz = quizzes.find(q => q.id === quizId);
        setStartQuizModalQuiz(quiz || { id: quizId, topic: 'Quiz' });
        setStartQuizMinutes(10);
    };

    const handleStartQuizConfirm = (timed) => {
        if (!startQuizModalQuiz) return;
        const id = startQuizModalQuiz.id;
        navigate(`/quiz/${id}/test`, {
            state: {
                timed: !!timed,
                timeLimitMinutes: timed ? Math.max(1, Math.min(1440, (startQuizHours || 0) * 60 + Math.max(0, Math.min(59, startQuizMinutes ?? 0)))) : null
            }
        });
        setStartQuizModalQuiz(null);
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
                    onClick={() => { setOpenDropdown(null); handleDeleteClick(quiz); }}
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
        <>
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
                <>
                <div className="quiz-search-wrap">
                    <FiSearch className="quiz-search-icon" />
                    <input
                        type="text"
                        className="quiz-search-input"
                        placeholder="Search by title or subject..."
                        value={quizSearch}
                        onChange={(e) => setQuizSearch(e.target.value)}
                    />
                </div>
                <div className="quiz-table-container">
                    <table className="quiz-table">
                        <thead>
                            <tr>
                                <th className="quiz-th-center">Quiz Title</th>
                                <th className="quiz-th-center">Type</th>
                                <th className="quiz-th-center">Questions</th>
                                    <th className="quiz-th-center">Progress</th>
                                <th className="quiz-th-center">Last Attempt</th>
                                <th className="quiz-th-center">Time</th>
                                <th className="quiz-th-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                {filteredQuizzes.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="quiz-search-empty">
                                            {quizSearch.trim() ? 'No quizzes match your search.' : 'No quizzes.'}
                                        </td>
                                    </tr>
                                ) : filteredQuizzes.map((quiz, index) => {
                                return (
                                        <tr key={quiz.id} className={`quiz-row ${openDropdown === quiz.id ? 'dropdown-open' : ''}`} style={{
                                            animation: `fadeInUp 0.4s ease ${index * 0.1}s both`
                                        }}>
                                        <td className="quiz-td-center quiz-title">
                                            <div>
                                                <div>{highlightMatch(quiz.topic, quizSearch)}</div>
                                                {quiz.subject && (
                                                    <div className="quiz-table-subject">{highlightMatch(quiz.subject, quizSearch)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="quiz-td-center">{formatQuizType(quiz.quiz_type)}</td>
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
                </>
                )}
            </div>
        </div>
        {showGenerateModal && ReactDOM.createPortal(
            (
                <div className="quiz-page-modal-overlay">
                    <div className="quiz-page-modal-content">
                        <h3>Generate Quiz</h3>
                        <p>Describe what you want to be quizzed on and we’ll create questions for you.</p>
                        
                        <div className="quiz-page-modal-form">
                            <div className="quiz-page-modal-form-group">
                                <label>Topic of the quiz</label>
                                <input
                                    type="text"
                                    className="quiz-page-modal-input"
                                    value={genTopic}
                                    onChange={(e) => setGenTopic(e.target.value)}
                                    placeholder="e.g. Django basics, Neuroanatomy, Linear Algebra"
                                />
                            </div>
                            
                            <div className="quiz-page-modal-form-group">
                                <label>Preferred quiz type</label>
                                <select
                                    className="quiz-page-modal-select"
                                    value={genType}
                                    onChange={(e) => setGenType(e.target.value)}
                                >
                                    <option value="mc">Multiple choice</option>
                                    <option value="wr">Written</option>
                                    <option value="wrmc">Mixed (MC + Written)</option>
                                </select>
                            </div>

                            <div className="quiz-page-modal-form-group">
                                <label>Number of questions</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    className="quiz-page-modal-input"
                                    value={genQuestionNum}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '') {
                                            setGenQuestionNum('');
                                            return;
                                        }
                                        const n = parseInt(value, 10);
                                        if (Number.isNaN(n)) return;
                                        setGenQuestionNum(n);
                                    }}
                                />
                                <div className="quiz-page-modal-hint">{getQuizType(genQuestionNum)}</div>
                            </div>

                            {genError && (
                                <div className="quiz-page-modal-error">
                                    {genError}
                                </div>
                            )}
                        </div>
                        
                        <div className="quiz-page-modal-actions">
                            <button className="quiz-page-modal-btn quiz-page-modal-cancel-btn" onClick={() => setShowGenerateModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="quiz-page-modal-btn quiz-page-generate-confirm-btn" 
                                onClick={handleGenerateSubmit}
                                disabled={generating}
                            >
                                {generating ? 'Generating...' : 'Generate Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            ),
            document.body
        )}
        {deleteConfirmQuiz && ReactDOM.createPortal(
            (
                <div className="quiz-page-modal-overlay" onClick={() => setDeleteConfirmQuiz(null)}>
                    <div className="quiz-page-modal-content quiz-page-delete-modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Quiz</h3>
                        <p>
                            Are you sure you want to delete <strong>"{deleteConfirmQuiz.topic || 'this quiz'}"</strong>? This action cannot be undone.
                        </p>
                        <div className="quiz-page-modal-actions">
                            <button className="quiz-page-modal-btn quiz-page-modal-cancel-btn" onClick={() => setDeleteConfirmQuiz(null)}>
                                Cancel
                            </button>
                            <button 
                                className="quiz-page-modal-btn quiz-page-delete-confirm-btn" 
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ),
            document.body
        )}
        {startQuizModalQuiz && ReactDOM.createPortal(
            (
                <div className="quiz-page-modal-overlay" onClick={() => setStartQuizModalQuiz(null)}>
                    <div className="quiz-page-modal-content quiz-page-start-modal" onClick={e => e.stopPropagation()}>
                        <button type="button" className="quiz-page-start-modal-close" onClick={() => setStartQuizModalQuiz(null)} aria-label="Close">
                            <FiX size={22} />
                        </button>
                        <div className="quiz-page-start-modal-header">
                            <h3>Start Quiz</h3>
                        </div>
                        <div className="quiz-page-modal-form">
                            <div className="quiz-page-modal-form-group quiz-page-time-wrap">
                                <label htmlFor="start-quiz-hours">Quiz timed for </label>
                                <input
                                    id="start-quiz-hours"
                                    type="number"
                                    min={0}
                                    max={2}
                                    className="quiz-page-modal-input quiz-page-time-input quiz-page-time-input-hours"
                                    style={{ width: `${[1.3, 1.3, 1.7, 2.8][Math.min(3, Math.max(0, String(startQuizHours ?? '').length))]}ch` }}
                                    value={startQuizHours}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === '') { setStartQuizHours(''); return; }
                                        const n = parseInt(v, 10);
                                        if (!Number.isNaN(n)) setStartQuizHours(Math.max(0, Math.min(2, n)));
                                    }}
                                />
                                <span className="quiz-page-time-suffix">hours</span>
                                <input
                                    id="start-quiz-minutes"
                                    type="number"
                                    min={0}
                                    max={59}
                                    className="quiz-page-modal-input quiz-page-time-input"
                                    style={{ width: `${[1.3, 1.3, 2, 2.8][Math.min(3, Math.max(0, String(startQuizMinutes ?? '').length))]}ch` }}
                                    value={startQuizMinutes}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === '') { setStartQuizMinutes(''); return; }
                                        const n = parseInt(v, 10);
                                        if (!Number.isNaN(n)) setStartQuizMinutes(Math.max(0, Math.min(59, n)));
                                    }}
                                />
                                <span className="quiz-page-time-suffix">minutes</span>
                            </div>
                        </div>
                        <div className="quiz-page-modal-actions quiz-page-start-modal-actions">
                            <button className="quiz-page-modal-btn quiz-page-start-not-timed-btn" onClick={() => handleStartQuizConfirm(false)}>
                                Start Quiz (Not Timed)
                            </button>
                            <button className="quiz-page-modal-btn quiz-page-generate-confirm-btn" onClick={() => handleStartQuizConfirm(true)}>
                                Start Timed Quiz
                            </button>
                        </div>
                    </div>
                </div>
            ),
            document.body
        )}
        {generating && ReactDOM.createPortal(
            (
                <div className="quiz-generating-overlay">
                    <div className="quiz-generating-box">
                        <div className="quiz-generating-spinner" />
                        <div className="quiz-generating-text">Generating Quiz…</div>
                    </div>
                </div>
            ),
            document.body
        )}
        </>
    );
};

export default QuizPage; 