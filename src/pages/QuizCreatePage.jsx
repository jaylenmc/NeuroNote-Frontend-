import React, { useState, useRef, useEffect } from 'react';
import { FiPlusCircle, FiTrash2, FiCheckCircle, FiEye, FiArrowLeft, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import './QuizTakePage.css';

const initialQuestion = () => ({
    prompt: '',
    options: [''],
    correct: 0,
    image: null,
    question_type: 'MC',
});

const QuizCreatePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const titleInputRef = useRef(null);
    const [questions, setQuestions] = useState([initialQuestion()]);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewActiveQuestion, setPreviewActiveQuestion] = useState(0);
    const [previewAnswers, setPreviewAnswers] = useState({}); // { qIdx: oIdx }
    const [questionTypeDropdown, setQuestionTypeDropdown] = useState(false);
    const [draggedOption, setDraggedOption] = useState(null);

    // Auto-resize any option textareas when content changes
    useEffect(() => {
        const autoResizeTextarea = (textarea) => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        const textareas = document.querySelectorAll('.quiz-take-option textarea');
        textareas.forEach(textarea => {
            autoResizeTextarea(textarea);
            
            // Add input listener for real-time resizing
            textarea.addEventListener('input', () => autoResizeTextarea(textarea));
        });

        // Cleanup listeners
        return () => {
            textareas.forEach(textarea => {
                textarea.removeEventListener('input', autoResizeTextarea);
            });
        };
    }, [questions, activeQuestion]);

    // Progress indicator
    const progress = `${activeQuestion + 1}/${questions.length}`;

    // Question logic
    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleTitleBlur = () => setEditingTitle(false);
    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') setEditingTitle(false);
    };
    const handleTitleClick = () => {
        setEditingTitle(true);
        setTimeout(() => {
            if (titleInputRef.current) titleInputRef.current.focus();
        }, 0);
    };
    const handleQuestionPromptChange = (idx, value) => {
        setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, prompt: value } : q));
    };
    const handleOptionChange = (qIdx, oIdx, value) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? {
            ...q,
            options: q.options.map((opt, j) => j === oIdx ? value : opt)
        } : q));
    };
    const handleAddOption = (qIdx) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? {
            ...q,
            options: [...q.options, '']
        } : q));
        
        // Focus the newly added option's textarea after a short delay
        setTimeout(() => {
            const textareas = document.querySelectorAll('.quiz-take-option textarea');
            const lastTextarea = textareas[textareas.length - 1];
            if (lastTextarea) {
                lastTextarea.focus();
            }
        }, 50);
    };
    const handleRemoveOption = (qIdx, oIdx) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? {
            ...q,
            options: q.options.filter((_, j) => j !== oIdx),
            correct: q.correct >= oIdx ? Math.max(0, q.correct - 1) : q.correct
        } : q));
    };
    const handleSetCorrect = (qIdx, oIdx) => {
        setQuestions(qs => qs.map((q, i) => {
            if (i === qIdx) {
                // Toggle: if clicking the already correct answer, uncheck it
                return { ...q, correct: q.correct === oIdx ? -1 : oIdx };
            }
            return q;
        }));
    };
    const handleAddQuestion = () => {
        setQuestions(qs => [...qs, initialQuestion()]);
        setActiveQuestion(questions.length);
        
        // Focus the question prompt textarea after a short delay
        setTimeout(() => {
            const questionPrompt = document.querySelector('.quiz-take-question-prompt');
            if (questionPrompt) {
                questionPrompt.focus();
            }
        }, 50);
    };
    const handleRemoveQuestion = (idx) => {
        const newQuestions = questions.filter((_, i) => i !== idx);
        setQuestions(newQuestions);
        setActiveQuestion(Math.max(0, idx - 1));
    };
    const handleQuestionTypeChange = (idx, value) => {
        setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, question_type: value } : q));
    };

    // Drag and drop handlers
    const handleDragStart = (qIdx, oIdx) => {
        setDraggedOption({ qIdx, oIdx });
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Allow drop
    };

    const handleDrop = (qIdx, oIdx) => {
        if (!draggedOption || draggedOption.qIdx !== qIdx) return;
        
        const fromIdx = draggedOption.oIdx;
        const toIdx = oIdx;
        
        if (fromIdx === toIdx) {
            setDraggedOption(null);
            return;
        }

        setQuestions(qs => qs.map((q, i) => {
            if (i === qIdx) {
                const newOptions = [...q.options];
                const [movedOption] = newOptions.splice(fromIdx, 1);
                newOptions.splice(toIdx, 0, movedOption);
                
                // Update correct index if needed
                let newCorrect = q.correct;
                if (q.correct === fromIdx) {
                    newCorrect = toIdx;
                } else if (fromIdx < toIdx && q.correct > fromIdx && q.correct <= toIdx) {
                    newCorrect = q.correct - 1;
                } else if (fromIdx > toIdx && q.correct >= toIdx && q.correct < fromIdx) {
                    newCorrect = q.correct + 1;
                }
                
                return { ...q, options: newOptions, correct: newCorrect };
            }
            return q;
        }));
        
        setDraggedOption(null);
    };

    const handleDragEnd = () => {
        setDraggedOption(null);
    };

    // Save logic
    const handleSaveQuiz = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const transformedQuestions = questions.map(q => ({
                question_input: q.prompt,
                question_type: q.question_type,
                answers: q.question_type === 'MC' ? q.options.map((opt, idx) => ({
                    answer_input: opt,
                    is_correct: q.correct === idx
                })) : []
            }));
            await api.post('/test/quiz/', {
                topic: title || 'Untitled Quiz',
                questions: transformedQuestions
            });
            setShowSaved(true);
            // Redirect to quiz center after successful save
            navigate('/quiz');
        } catch (err) {
            setSaveError('Failed to save quiz. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        setPreviewMode(prev => {
            const next = !prev;
            if (next) {
                setPreviewActiveQuestion(0);
                setPreviewAnswers({});
            }
            return next;
        });
    };
    const handleBack = () => window.history.back();
    const handlePreviousQuestion = () => {
        if (activeQuestion > 0) setActiveQuestion(activeQuestion - 1);
    };
    const handleNextQuestion = () => {
        if (activeQuestion < questions.length - 1) setActiveQuestion(activeQuestion + 1);
    };

    const currentQuestion = questions[activeQuestion];

    return (
        <div className="quiz-take-bg">
            {/* Navbar with back button on left, progress in center, title on right */}
            <nav className="quiz-take-navbar">
                <div className="quiz-take-navbar-left">
                    <button className="quiz-take-navbar-back-btn" onClick={handleBack}>
                        <FiArrowLeft style={{ marginRight: 6 }} /> Back
                    </button>
                </div>
                <div className="quiz-take-navbar-center-fixed">
                    {editingTitle ? (
                        <input
                            ref={titleInputRef}
                            className="quiz-take-navbar-title-input"
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            maxLength={40}
                            autoFocus
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#f5f5f5',
                                fontSize: '1.3rem',
                                fontWeight: '600',
                                textAlign: 'center',
                                width: '100%'
                            }}
                        />
                    ) : (
                        <div
                            className="quiz-take-navbar-title editable"
                            tabIndex={0}
                            onClick={handleTitleClick}
                            onKeyDown={e => { if (e.key === 'Enter') handleTitleClick(); }}
                            title="Click to edit quiz name"
                        >
                            {title || 'Untitled Quiz'}
                        </div>
                    )}
                </div>
                <div className="quiz-take-navbar-right">
                    <span className="quiz-take-questions-left">{progress}</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="quiz-take-main" style={{ paddingBottom: '100px' }}>
                <div className="quiz-take-question-card">
                    <div className="quiz-take-question-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Question {activeQuestion + 1}</span>
                        <div style={{ position: 'relative' }}>
                            <button 
                                style={{ 
                                    background: 'rgba(191,196,204,0.1)', 
                                    border: '1px solid rgba(191,196,204,0.2)', 
                                    color: '#bfc4cc', 
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => setQuestionTypeDropdown(prev => !prev)}
                            >
                                {currentQuestion.question_type}
                            </button>
                            {questionTypeDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    background: 'rgba(30,32,36,0.95)',
                                    border: '1px solid rgba(191,196,204,0.2)',
                                    borderRadius: '8px',
                                    padding: '8px 0',
                                    marginTop: '4px',
                                    zIndex: 10,
                                    minWidth: '140px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                }}>
                                    <button 
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#bfc4cc',
                                            padding: '8px 16px',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onClick={() => {
                                            handleQuestionTypeChange(activeQuestion, 'MC');
                                            setQuestionTypeDropdown(false);
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(191,196,204,0.1)'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        Multiple Choice
                                    </button>
                                    <button 
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#bfc4cc',
                                            padding: '8px 16px',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onClick={() => {
                                            handleQuestionTypeChange(activeQuestion, 'WR');
                                            setQuestionTypeDropdown(false);
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(191,196,204,0.1)'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        Written
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <textarea
                        className="quiz-take-question-prompt"
                        value={currentQuestion.prompt}
                        onChange={e => handleQuestionPromptChange(activeQuestion, e.target.value)}
                        placeholder="Type your question prompt…"
                        rows={2}
                        spellCheck={false}
                        style={{ 
                            outline: 'none', 
                            border: 'none', 
                            background: 'transparent',
                            resize: 'none'
                        }}
                    />
                    {currentQuestion.question_type === 'MC' && (
                        <div className="quiz-take-options-list">
                            {currentQuestion.options.map((opt, oIdx) => (
                                <div 
                                    key={oIdx} 
                                    className={`quiz-take-option${currentQuestion.correct === oIdx ? ' selected' : ''}${draggedOption?.oIdx === oIdx ? ' dragging' : ''}`}
                                    draggable
                                    onDragStart={() => handleDragStart(activeQuestion, oIdx)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(activeQuestion, oIdx)}
                                    onDragEnd={handleDragEnd}
                                    style={{ cursor: 'move' }}
                                >
                                    {/* Mark as correct button */}
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleSetCorrect(activeQuestion, oIdx); 
                                        }}
                                        style={{ 
                                            background: currentQuestion.correct === oIdx ? 'rgba(167,139,250,0.2)' : 'rgba(191,196,204,0.1)', 
                                            border: currentQuestion.correct === oIdx ? '2px solid #A78BFA' : '2px solid rgba(191,196,204,0.2)',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.2s ease',
                                            color: currentQuestion.correct === oIdx ? '#A78BFA' : '#bfc4cc'
                                        }}
                                        title={currentQuestion.correct === oIdx ? 'Correct answer' : 'Mark as correct'}
                                    >
                                        {currentQuestion.correct === oIdx && <FiCheck size={18} />}
                                    </button>
                                    
                                    <textarea
                                        value={opt}
                                        onChange={e => handleOptionChange(activeQuestion, oIdx, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                        spellCheck={false}
                                        rows={1}
                                        style={{ 
                                            flex: 1,
                                            background: 'transparent', 
                                            border: 'none', 
                                            color: 'inherit', 
                                            fontSize: '1.1rem',
                                            outline: 'none',
                                            resize: 'none',
                                            overflow: 'hidden',
                                            whiteSpace: 'pre-wrap',
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word'
                                        }}
                                        onInput={e => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                    />
                                    
                                    {/* Delete option button */}
                                    {currentQuestion.options.length > 1 && (
                                        <button 
                                            className="quiz-option-delete-btn"
                                            onClick={e => { e.stopPropagation(); handleRemoveOption(activeQuestion, oIdx); }}
                                            title="Delete option"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button style={{ 
                                background: 'rgba(191,196,204,0.1)', 
                                border: '1px solid rgba(191,196,204,0.2)', 
                                color: '#bfc4cc', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.2s ease'
                            }} onClick={() => handleAddOption(activeQuestion)}>
                                <FiPlusCircle /> Add Option
                            </button>
                        </div>
                    )}
                </div>
                <button style={{ 
                    background: 'rgba(191,196,204,0.1)', 
                    border: '1px solid rgba(191,196,204,0.2)', 
                    color: '#bfc4cc', 
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1rem',
                    marginTop: 24,
                    transition: 'all 0.2s ease'
                }} onClick={handleAddQuestion}>
                    <FiPlusCircle /> Add Question
                </button>
            </div>

            {/* Navigation buttons in bottom corners - positioned above footer */}
            <div style={{
                position: 'fixed',
                bottom: '90px',
                left: 0,
                right: 0,
                pointerEvents: 'none',
                zIndex: 25
            }}>
                <button 
                    className="quiz-take-nav-btn quiz-take-nav-btn-back"
                    onClick={handlePreviousQuestion}
                    disabled={activeQuestion === 0}
                    title="Previous question"
                    style={{ pointerEvents: 'auto' }}
                >
                    <FiChevronLeft />
                </button>
                
                <button 
                    className="quiz-take-nav-btn quiz-take-nav-btn-forward"
                    onClick={handleNextQuestion}
                    disabled={activeQuestion === questions.length - 1}
                    title="Next question"
                    style={{ pointerEvents: 'auto' }}
                >
                    <FiChevronRight />
                </button>
            </div>

            {/* Save/Preview Footer */}
            <footer style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                width: '100vw', 
                zIndex: 20, 
                background: 'rgba(30,32,36,0.95)', 
                backdropFilter: 'blur(15px)',
                borderTop: '1px solid rgba(191,196,204,0.1)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: '#bfc4cc', fontWeight: 500 }}>📝 {questions.length} Questions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="quiz-save-draft-btn" onClick={handleSaveQuiz} disabled={saving}>
                        {saving ? 'Saving…' : 'Save Draft'}
                    </button>
                    <button className="quiz-preview-btn" onClick={handlePreview}>
                        <FiEye /> Preview
                    </button>
                </div>
                {showSaved && <div style={{ color: '#5fffd7', marginLeft: 16 }}>✔ Quiz Saved!</div>}
                {saveError && <div style={{ color: '#e05a5a', marginLeft: 16 }}>{saveError}</div>}
            </footer>

            {/* Preview Modal - renders current draft as take-quiz experience */}
            {previewMode && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'stretch',
                        justifyContent: 'center'
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        background: 'transparent'
                    }}>
                        <div className="quiz-take-bg" style={{ minHeight: '100vh' }}>
                            <nav className="quiz-take-navbar">
                                <div className="quiz-take-navbar-left">
                                    <button className="quiz-take-navbar-back-btn" onClick={handlePreview}>
                                        <FiArrowLeft style={{ marginRight: 6 }} /> Close Preview
                                    </button>
                                </div>
                                <div className="quiz-take-navbar-center-fixed">
                                    <div className="quiz-take-progress-container">
                                        <div className="quiz-take-progress-bar">
                                            <div
                                                className="quiz-take-progress-fill"
                                                style={{ width: `${questions.length ? ((previewActiveQuestion + 1) / questions.length) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="quiz-take-questions-left">{questions.length ? (previewActiveQuestion + 1) : 0}/{questions.length}</span>
                                    </div>
                                </div>
                                <div className="quiz-take-navbar-right">
                                    <div className="quiz-take-navbar-title">{title || 'Untitled Quiz'}</div>
                                </div>
                            </nav>

                            <div className="quiz-take-main">
                                <div className="quiz-take-question-card">
                                    <div className="quiz-take-question-header">Question {questions.length ? (previewActiveQuestion + 1) : 0}</div>
                                    <div className="quiz-take-question-prompt">
                                        {questions[previewActiveQuestion]?.prompt || 'No question'}
                                    </div>
                                    {questions[previewActiveQuestion]?.question_type === 'MC' && (
                                        <div className="quiz-take-options-list">
                                            {questions[previewActiveQuestion]?.options?.map((option, oIdx) => {
                                                const isSelected = previewAnswers[previewActiveQuestion] === oIdx;
                                                let optionClass = 'quiz-take-option';
                                                if (isSelected) optionClass += ' selected';
                                                return (
                                                    <button
                                                        key={oIdx}
                                                        className={optionClass}
                                                        type="button"
                                                        onClick={() => setPreviewAnswers(prev => ({ ...prev, [previewActiveQuestion]: oIdx }))}
                                                    >
                                                        {option || `Option ${String.fromCharCode(65 + oIdx)}`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {questions[previewActiveQuestion]?.question_type === 'WR' && (
                                        <div className="quiz-take-options-list">
                                            <div className="quiz-take-option" style={{ cursor: 'text' }}>
                                                <textarea
                                                    placeholder="Type your answer..."
                                                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', outline: 'none', resize: 'none' }}
                                                    rows={3}
                                                    onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [previewActiveQuestion]: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                className="quiz-take-nav-btn quiz-take-nav-btn-back"
                                onClick={() => setPreviewActiveQuestion(q => Math.max(0, q - 1))}
                                disabled={previewActiveQuestion === 0}
                                title="Previous question"
                            >
                                <FiChevronLeft />
                            </button>
                            <button
                                className="quiz-take-nav-btn quiz-take-nav-btn-forward"
                                onClick={() => setPreviewActiveQuestion(q => Math.min(questions.length - 1, q + 1))}
                                disabled={previewActiveQuestion === Math.max(0, questions.length - 1)}
                                title="Next question"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizCreatePage; 