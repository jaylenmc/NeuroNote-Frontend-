import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRotateCcw, FiTarget, FiZap, FiEdit, FiArrowRight, FiLock, FiUnlock, FiShuffle, FiLayers } from 'react-icons/fi';
import api from '../api/axios';

const FeedbackLoopSession = ({ 
  currentCard, 
  onRatingSelect, 
  isFlipped, 
  setIsFlipped,
  sessionStats,
  onAttemptChange,
  nextCard,
  onShuffle,
  tutorStyle = 'socratic',
  setTutorStyle,
  currentLayer = 1,
  setCurrentLayer
}) => {
  const [currentStep, setCurrentStep] = useState('practice'); // practice, feedback, reflection
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setCurrentStep('practice');
    setUserAnswer('');
    setFeedback('');
    setAttemptCount(0);
    setShowHint(false);
    setReflectionAnswer('');
    setDifficulty('medium');
    setAiResponse('');
    setIsSubmitting(false);
    setShowCorrectAnswer(false);
    setCurrentLayer(1); // Reset to layer 1 when card changes
  }, [currentCard?.id]);

  // Tutor style descriptions
  const tutorStyles = {
    strict: { label: 'Strict', description: 'No-nonsense tutor who challenges you' },
    friendly: { label: 'Friendly', description: 'Warm, casual tutor who explains gently' },
    professional: { label: 'Professional', description: 'Polished, classroom-style instructor' },
    speed_run: { label: 'Speed Run', description: 'Fast-paced, optimized explanations' },
    socratic: { label: 'Socratic', description: 'Question-driven tutor that guides you' },
    supportive: { label: 'Supportive', description: 'Motivational guide who reassures you' }
  };

  // Layer descriptions
  const layerDescriptions = {
    1: { label: 'Layer 1', description: 'Quick Definition - Short, simple explanation' },
    2: { label: 'Layer 2', description: 'Deeper Concept - How and why it works' },
    3: { label: 'Layer 3', description: 'Applied Example - Real-world scenarios' }
  };

  const generateFeedback = async () => {
    if (!currentCard || !userAnswer.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // New API format: card (ID), user_answer, tutor_style, layer
      const requestData = {
        card: currentCard.id,
        user_answer: userAnswer,
        tutor_style: tutorStyle,
        layer: currentLayer
      };

      const response = await api.post('/tutor/doingfeedback/', requestData);
      
      if (response.data) {
        // Backend now returns plain text response
        setAiResponse(response.data);
        
        // Set difficulty based on next card's learning status
        if (nextCard) {
          const learningStatus = nextCard.learning_status;
          switch (learningStatus) {
            case 'strgl': // Struggling
              setDifficulty('hard');
              break;
            case 'imprv': // In Progress
              setDifficulty('intermediate');
              break;
            case 'unseen': // Unseen
              setDifficulty('new');
              break;
            case 'mstrd': // Mastered
              setDifficulty('easy');
              break;
            default:
              setDifficulty('intermediate');
          }
        } else {
          setDifficulty('intermediate');
        }
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setAiResponse('Sorry, there was an error getting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    if (onAttemptChange) {
      onAttemptChange(newAttemptCount);
    }
    
    await generateFeedback();
    setCurrentStep('feedback');
  };

  const handleNextStep = () => {
    if (currentStep === 'feedback') {
      // Check if we should advance to next layer or go to reflection
      // Based on AI feedback, user might need to stay at current layer or advance
      // For now, we'll let users manually choose to advance layers or go to reflection
      setCurrentStep('reflection');
    } else if (currentStep === 'reflection') {
      // Move to next card
      onRatingSelect(4); // Default rating for feedback loop completion
    }
  };

  const handleAdvanceLayer = () => {
    if (currentLayer < 3) {
      setCurrentLayer(currentLayer + 1);
      setCurrentStep('practice');
      setUserAnswer('');
      setAiResponse('');
    }
  };

  const handleRetryLayer = () => {
    setCurrentStep('practice');
    setUserAnswer('');
    setAiResponse('');
  };

  const handleTryAgain = () => {
    setCurrentStep('practice');
    setUserAnswer('');
    setShowHint(false);
    if (onAttemptChange) {
      onAttemptChange(attemptCount);
    }
  };

  const getHint = () => {
    // Generate contextual hints based on the question
    const question = currentCard.question.toLowerCase();
    if (question.includes('define') || question.includes('what is')) {
      return "Focus on the main characteristics or properties.";
    } else if (question.includes('explain') || question.includes('how')) {
      return "Break it down into steps or components.";
    } else if (question.includes('compare') || question.includes('difference')) {
      return "Think about similarities and differences.";
    }
    return "Consider the context and key terms in the question.";
  };

  if (currentStep === 'practice') {
    return (
      <div className="feedback-loop-session">
        <div className="feedback-loop-practice">
        <div className="session-title-center">
          <h2 className="session-main-title">Doing + Feedback Loop</h2>
          <div className="session-subtitle">Learn by doing and refining through feedback</div>
        </div>
        
        <div className="practice-content">
          <div className="answer-area">
            <div className="answer-area-header">
              <div className="header-meta" style={{ marginLeft: 'auto' }}>
                <div className="attempts-display">
                  <FiTarget className="attempts-icon" />
                  <span>Attempt {attemptCount + 1}</span>
                </div>
              </div>
            </div>

            <div className="question-display">
              <p className="question-text">{currentCard.question}</p>
            </div>

            <div className="text-input-container">
              <label htmlFor="user-answer">Your Answer:</label>
              <textarea
                id="user-answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows="6"
              />
            </div>
          </div>

          {showHint && (
            <div className="hint-section">
              <FiZap className="hint-icon" />
              <p className="hint-text">{getHint()}</p>
            </div>
          )}

          <div className="practice-actions">
            <button 
              className="hint-btn action-btn"
              onClick={() => setShowHint(!showHint)}
            >
              <FiZap />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {onShuffle && (
              <button 
                className="hint-btn action-btn"
                onClick={onShuffle}
                title="Shuffle cards"
              >
                <FiShuffle />
                Shuffle
              </button>
            )}
            <button 
              className="submit-btn action-btn"
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || isSubmitting}
              title={!userAnswer.trim() ? 'Complete answer to unlock' : 'Submit your answer'}
            >
              {isSubmitting ? 'Getting Feedback...' : 'Submit Answer'}
            </button>
          </div>
          
          {!userAnswer.trim() && (
            <div className="action-hint">Complete your answer to submit</div>
          )}
        </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'feedback') {
    return (
      <div className="feedback-loop-feedback">
        <div className="session-title-center">
          <h2 className="session-main-title">Instant Feedback</h2>
          <div className="session-subtitle">Review your performance and learn from mistakes</div>
        </div>
        
        <div className="feedback-content">
          <div className="feedback-card">
            <div className="feedback-header">
              <span className="feedback-emoji">🗣️</span>
              <h3>Neuro Feedback - {layerDescriptions[currentLayer].label}</h3>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--nightowl-text-steel)',
                  padding: '4px 12px',
                  background: 'rgba(124, 131, 253, 0.1)',
                  borderRadius: '12px'
                }}>
                  {tutorStyles[tutorStyle].label} Style
                </span>
              </div>
            </div>
            <div className="feedback-message">
              <div 
                style={{ 
                  lineHeight: '1.6',
                  fontSize: '1rem',
                  color: 'var(--nightowl-text-main)'
                }}
                dangerouslySetInnerHTML={{
                  __html: (aiResponse || feedback || 'Loading feedback...')
                    .replace(/^### (.*$)/gim, '<h3 class="feedback-h3">$1</h3>') // Convert ### to h3
                    .replace(/^## (.*$)/gim, '<h2 class="feedback-h2">$1</h2>') // Convert ## to h2
                    .replace(/^# (.*$)/gim, '<h1 class="feedback-h1">$1</h1>') // Convert # to h1
                    .replace(/^\d+\.\s+(.*$)/gim, '<div style="margin: 8px 0; padding-left: 20px; position: relative;"><span style="color: #7c83fd; font-weight: 600; position: absolute; left: 0;">•</span>$1</div>') // Convert numbered lists
                    .replace(/^- (.*$)/gim, '<div style="margin: 8px 0; padding-left: 20px; position: relative;"><span style="color: #7c83fd; font-weight: 600; position: absolute; left: 0;">•</span>$1</div>') // Convert bullet lists
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--nightowl-text-main); font-weight: 700;">$1</strong>') // Bold text
                    .replace(/\*(.*?)\*/g, '<em style="color: var(--nightowl-text-steel); font-style: italic;">$1</em>') // Italic text
                    .replace(/\n/g, '<br>') // Convert line breaks
                    .trim()
                }}
              />
            </div>
          </div>

          <div className="answer-comparison">
            <div className="user-answer-section">
              <div className="answer-label">
                <FiEdit className="answer-label-icon" />
                <h4>Your Answer</h4>
              </div>
              <div className="user-answer-content">
                {userAnswer || "No answer provided"}
              </div>
            </div>

            <div className="answer-divider">
              <FiArrowRight className="divider-icon" />
            </div>

            <div className="correct-answer-section">
              <div className="answer-label">
                <FiCheck className="answer-label-icon" />
                <h4>Correct Answer</h4>
                <button 
                  onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#28a745',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    marginLeft: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  title={showCorrectAnswer ? 'Hide correct answer' : 'Show correct answer'}
                >
                  {showCorrectAnswer ? <FiUnlock size={16} /> : <FiLock size={16} />}
                </button>
              </div>
              <div className="correct-answer-content">
                {showCorrectAnswer ? (
                  currentCard.answer
                ) : (
                  <div style={{ 
                    color: 'var(--nightowl-text-muted)', 
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiLock size={16} />
                    Click the lock to reveal the correct answer
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="difficulty-card">
            <span className="difficulty-label">Next Challenge Level:</span>
            <span className={`difficulty-badge ${difficulty}`}>
              {difficulty === 'easy' && 'Easy'}
              {difficulty === 'intermediate' && 'Intermediate'}
              {difficulty === 'new' && 'New Content'}
              {difficulty === 'hard' && 'Hard'}
            </span>
          </div>

          <div className="feedback-actions">
            <button className="try-again-btn action-btn" onClick={handleRetryLayer}>
              <FiRotateCcw />
              Try Again (Same Layer)
            </button>
            {currentLayer < 3 && (
              <button 
                className="continue-btn action-btn"
                onClick={handleAdvanceLayer}
                title={`Advance to ${layerDescriptions[currentLayer + 1].label}`}
              >
                <FiLayers />
                Advance to {layerDescriptions[currentLayer + 1].label}
              </button>
            )}
            <button 
              className="continue-btn action-btn"
              onClick={handleNextStep}
              title="Continue to Reflection"
            >
              Continue to Reflection
            </button>
          </div>
          
          {currentLayer < 3 && (
            <div className="action-hint" style={{ textAlign: 'center', marginTop: '12px', color: 'var(--nightowl-text-steel)' }}>
              💡 You can advance to {layerDescriptions[currentLayer + 1].label} for deeper understanding, or continue to reflection
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'reflection') {
    return (
      <div className="feedback-loop-reflection">
        <div className="session-title-center">
          <h2 className="session-main-title">Reflection</h2>
          <div className="session-subtitle">Reflect on what you learned and how to apply it</div>
        </div>
        
        <div className="reflection-content">
          <div className="reflection-card">
            <div className="reflection-icon">💭</div>
            <div className="reflection-prompt">
              <h3>What did you learn from this practice?</h3>
              <p>Reflect on your understanding and how you might apply this knowledge.</p>
            </div>
          </div>

          <div className="reflection-input-area">
            <label>Your Reflection:</label>
            <textarea
              value={reflectionAnswer}
              onChange={(e) => setReflectionAnswer(e.target.value)}
              placeholder="Share your thoughts about what you learned..."
              rows="6"
            />
          </div>

          <div className="reflection-actions">
            <button 
              className="complete-btn action-btn"
              onClick={handleNextStep}
              disabled={!reflectionAnswer.trim()}
              title={!reflectionAnswer.trim() ? 'Add your reflection to continue' : 'Complete this practice'}
            >
              Complete Practice
            </button>
          </div>
          
          {!reflectionAnswer.trim() && (
            <div className="action-hint">Share your reflection to complete</div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default FeedbackLoopSession;
