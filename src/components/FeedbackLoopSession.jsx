import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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
  const [canAdvanceLayer, setCanAdvanceLayer] = useState(false);
  const [passFailStatus, setPassFailStatus] = useState(null); // 'pass', 'fail', or null
  const [showLayerTransition, setShowLayerTransition] = useState(false);
  const [transitioningToLayer, setTransitioningToLayer] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldFadeIn, setShouldFadeIn] = useState(false);
  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false);

  // Function to fetch previous attempts
  const fetchPreviousAttempts = async () => {
    if (!currentCard?.id) return;
    
    try {
      // Call GET endpoint to get previous attempts for this card
      // Pass card ID in URL path: /tutor/doingfeedback/<card_id>/
      const response = await api.get(`/tutor/doingfeedback/${currentCard.id}/`);
      
      // Backend returns the attempts number directly
      if (response.data !== null && response.data !== undefined) {
        const attempts = typeof response.data === 'number' ? response.data : (response.data.attempts || 1);
        setAttemptCount(attempts);
        if (onAttemptChange) {
          onAttemptChange(attempts);
        }
      } else {
        // No previous attempts found, start at 1
        setAttemptCount(1);
        if (onAttemptChange) {
          onAttemptChange(1);
        }
      }
    } catch (error) {
      // If no interaction found (404), start with 1 attempt
      if (error.response?.status === 404) {
        setAttemptCount(1);
        if (onAttemptChange) {
          onAttemptChange(1);
        }
      } else {
        console.error('Error fetching previous attempts:', error);
        // Default to 1 on error
        setAttemptCount(1);
        if (onAttemptChange) {
          onAttemptChange(1);
        }
      }
    }
  };

  // Fetch previous attempts when card changes
  useEffect(() => {
    // Reset state when card changes
    setCurrentStep('practice');
    setUserAnswer('');
    setFeedback('');
    setShowHint(false);
    setReflectionAnswer('');
    setDifficulty('medium');
    setAiResponse('');
    setIsSubmitting(false);
    setShowCorrectAnswer(false);
    setCanAdvanceLayer(false);
    setPassFailStatus(null);
    setShowLayerTransition(false);
    setTransitioningToLayer(null);
    setIsFadingOut(false);
    setShouldFadeIn(false);
    setCurrentLayer(1); // Reset to layer 1 when card changes
    
    // Fetch previous attempts before loading anything
    fetchPreviousAttempts();
  }, [currentCard?.id, onAttemptChange]);

  // Handle shuffle - call parent's shuffle and then fetch attempts for new card
  const handleShuffle = async () => {
    // If user is on layer > 1, show confirmation modal
    if (currentLayer > 1) {
      setShowShuffleConfirm(true);
      return;
    }
    
    // Proceed with shuffle if on layer 1
    await proceedWithShuffle();
  };

  // Actually perform the shuffle
  const proceedWithShuffle = async () => {
    // Close confirmation modal first
    setShowShuffleConfirm(false);
    
    // Call parent's shuffle handler if it exists
    if (onShuffle) {
      onShuffle();
    }
    
    // Wait a moment for the card to change after shuffle
    // Then fetch attempts for the new current card
    setTimeout(async () => {
      await fetchPreviousAttempts();
    }, 100);
  };

  // Cancel shuffle
  const cancelShuffle = () => {
    setShowShuffleConfirm(false);
  };

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
    1: { label: 'Layer 1', description: 'Recognition: You must identify what the question refers to when prompted, without needing detail, structure, or justification.' },
    2: { label: 'Layer 2', description: 'Structure: You must explain the essential parts or rules that make the concept what it is.' },
    3: { label: 'Layer 3', description: 'Implication: You must reason about what follows from the concept being true — consequences, effects, or constraints.' }
  };

  // Remove any decision text from feedback HTML
  const cleanFeedbackHtml = (html) => {
    if (!html) return html;
    
    // Remove various patterns of decision text that might appear in HTML
    let cleaned = html;
    
    // Remove "Decision: #Pass#" or "Decision: #Fail#" patterns (case insensitive)
    cleaned = cleaned.replace(/Decision:\s*#(Pass|Fail)#/gi, '');
    
    // Remove any standalone "Pass" or "Fail" that might be wrapped in tags or appear alone
    // Be careful not to remove these words if they're part of normal text
    // Only remove if they appear in specific decision-related contexts
    
    // Remove decision in various HTML tag patterns
    cleaned = cleaned.replace(/<[^>]*>\s*Decision:\s*#?(Pass|Fail)#?\s*<\/[^>]*>/gi, '');
    cleaned = cleaned.replace(/Decision:\s*#?(Pass|Fail)#?/gi, '');
    
    // Clean up any extra whitespace or empty tags left behind
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.trim();
    
    return cleaned;
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
        // Backend now returns structured JSON with 'feedback' and 'decision' fields
        let responseData;
        
        // Handle both JSON object and JSON string responses
        if (typeof response.data === 'string') {
          try {
            // Clean up the response if it's wrapped in quotes
            let cleanedData = response.data.trim();
            if (cleanedData.startsWith("'") && cleanedData.endsWith("'")) {
              cleanedData = cleanedData.slice(1, -1);
            }
            cleanedData = cleanedData.replace(/\\'/g, "'");
            responseData = JSON.parse(cleanedData);
          } catch (error) {
            console.error('Error parsing JSON response:', error);
            setAiResponse('Sorry, there was an error parsing the feedback response.');
            return;
          }
        } else {
          responseData = response.data;
        }
        
        // Extract feedback and decision from structured response
        let feedbackHtml = responseData.feedback || '';
        const decision = responseData.decision || '';
        
        // Clean feedback HTML to remove any decision text
        feedbackHtml = cleanFeedbackHtml(feedbackHtml);
        
        // Set pass/fail status based on decision
        const status = decision.toLowerCase() === 'pass' ? 'pass' : (decision.toLowerCase() === 'fail' ? 'fail' : null);
        
        setPassFailStatus(status);
        setAiResponse(feedbackHtml);
        setFeedback(feedbackHtml);
        
        // Allow layer advancement only if status is 'pass'
        setCanAdvanceLayer(status === 'pass');
        
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

  const handleAdvanceLayer = async () => {
    if (currentLayer < 3) {
      const nextLayer = currentLayer + 1;
      setTransitioningToLayer(nextLayer);
      setShowLayerTransition(true);
      
      // Play success chime sound (played here to ensure it works after user interaction)
      try {
        const audio = new Audio('/sounds/pass.wav');
        audio.volume = 0.7;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing success sound:', error);
          });
        }
      } catch (error) {
        console.error('Error creating audio:', error);
      }
      
      // Hide overlay after 3 seconds with fade out
      setTimeout(async () => {
        setIsFadingOut(true);
        // Wait for fade out animation to complete (300ms)
        setTimeout(async () => {
          setShowLayerTransition(false);
          setIsFadingOut(false);
          setCurrentLayer(nextLayer);
          setCurrentStep('practice');
          setUserAnswer('');
          setAiResponse('');
          setTransitioningToLayer(null);
          // Trigger fade in for content
          setShouldFadeIn(true);
          // Fetch updated attempts after advancing layer
          await fetchPreviousAttempts();
          // Reset fade in after animation completes
          setTimeout(() => {
            setShouldFadeIn(false);
          }, 500);
        }, 300);
      }, 3000);
    }
  };

  const handleRetryLayer = async () => {
    setCurrentStep('practice');
    setUserAnswer('');
    setAiResponse('');
    // Fetch updated attempts after retry
    await fetchPreviousAttempts();
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

  // Render overlay via Portal so it appears above everything, regardless of step
  const renderOverlayPortal = () => {
    if (!showLayerTransition || !transitioningToLayer) return null;
    
    return ReactDOM.createPortal(
      <div className={`layer-transition-overlay ${isFadingOut ? 'fade-out' : ''}`}>
        <div className="layer-transition-content">
          <div className="layer-transition-title">
            You made it to {layerDescriptions[transitioningToLayer]?.label}!
          </div>
          <div className="layer-transition-description">
            {layerDescriptions[transitioningToLayer]?.description}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Render shuffle confirmation modal
  const renderShuffleConfirmModal = () => {
    if (!showShuffleConfirm) return null;
    
    return ReactDOM.createPortal(
      <div className="shuffle-confirm-overlay" onClick={cancelShuffle}>
        <div className="shuffle-confirm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="shuffle-confirm-header">
            <FiLayers className="shuffle-confirm-icon" />
            <h3 className="shuffle-confirm-title">Shuffle Cards?</h3>
          </div>
          <div className="shuffle-confirm-body">
            <p className="shuffle-confirm-message">
              You're currently on <strong>Layer {currentLayer}</strong> of this card. If you shuffle, you'll lose your progress on this card and start over with a new card.
            </p>
            <p className="shuffle-confirm-submessage">
              Are you sure you want to continue?
            </p>
          </div>
          <div className="shuffle-confirm-actions">
            <button 
              className="shuffle-confirm-btn shuffle-confirm-cancel"
              onClick={cancelShuffle}
            >
              Cancel
            </button>
            <button 
              className="shuffle-confirm-btn shuffle-confirm-proceed"
              onClick={proceedWithShuffle}
            >
              Yes, Shuffle
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (currentStep === 'practice') {
    return (
      <>
        {renderOverlayPortal()}
        {renderShuffleConfirmModal()}
        <div className={`feedback-loop-session ${shouldFadeIn ? 'fade-in' : ''}`}>
        <div className="feedback-loop-practice">
        <div className="session-title-center">
          <h2 className="session-main-title">Doing + Feedback Loop</h2>
          <div className="session-subtitle">Learn by doing and refining through feedback</div>
        </div>
        
        <div className="practice-content">
          <div className="answer-area">
            <div className="answer-area-header">
              <span className="question-label">Question:</span>
              <div className="header-meta" style={{ marginLeft: 'auto' }}>
                <div className="attempts-display">
                  <FiTarget className="attempts-icon" />
                  <span>Attempt {attemptCount}</span>
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
                onClick={handleShuffle}
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
      </>
    );
  }

  if (currentStep === 'feedback') {
    return (
      <>
        {renderOverlayPortal()}
        {renderShuffleConfirmModal()}
        <div className="feedback-loop-feedback">
        <div className="session-title-center">
          <h2 className="session-main-title">Instant Feedback</h2>
          <div className="session-subtitle">Review your performance and learn from mistakes</div>
        </div>
        
        <div className="feedback-content">
          <div className="user-answer-section">
            <div className="answer-label">
              <FiEdit className="answer-label-icon" />
              <h4>Your Answer</h4>
            </div>
            <div className="user-answer-content">
              {userAnswer || "No answer provided"}
            </div>
          </div>

          <div className="feedback-card">
            <div className="feedback-header">
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--nightowl-text-main)' }}>Neuro Feedback</h3>
              <div className="feedback-header-badges">
                {passFailStatus && (
                  <span className={`feedback-status-badge ${passFailStatus}`}>
                    {passFailStatus === 'pass' ? '✓ Pass' : '✗ Fail'}
                  </span>
                )}
                <span className="tutor-style-badge">
                  {tutorStyles[tutorStyle].label} Style
                </span>
              </div>
            </div>
            <div className="feedback-message">
              <div 
                className="feedback-html-content"
                dangerouslySetInnerHTML={{
                  __html: aiResponse || feedback || 'Loading feedback...'
                }}
              />
            </div>
          </div>

          {currentLayer === 1 && canAdvanceLayer && (
            <div className="difficulty-card">
              <span className="difficulty-label">Next Challenge Level:</span>
              <span className={`difficulty-badge ${difficulty}`}>
                {difficulty === 'easy' && 'Easy'}
                {difficulty === 'intermediate' && 'Intermediate'}
                {difficulty === 'new' && 'New Content'}
                {difficulty === 'hard' && 'Hard'}
              </span>
            </div>
          )}

          <div className="feedback-actions">
            <button className="try-again-btn action-btn" onClick={handleRetryLayer}>
              <FiRotateCcw />
              Try Again (Same Layer)
            </button>
            {currentLayer < 3 && (
              <button 
                className={`continue-btn action-btn ${!canAdvanceLayer ? 'disabled' : ''}`}
                onClick={handleAdvanceLayer}
                disabled={!canAdvanceLayer}
                title={canAdvanceLayer ? `Advance to ${layerDescriptions[currentLayer + 1].label}` : 'Complete current layer to advance'}
              >
                <FiLayers />
                Advance to {layerDescriptions[currentLayer + 1].label}
              </button>
            )}
            {currentLayer === 3 && canAdvanceLayer && (
              <button 
                className="continue-btn action-btn"
                onClick={handleNextStep}
                title="Continue to Reflection"
              >
                Continue to Reflection
              </button>
            )}
          </div>
          
          {currentLayer < 3 && (
            <div className="action-hint" style={{ textAlign: 'center', marginTop: '12px', color: 'var(--nightowl-text-steel)' }}>
              💡 You can advance to {layerDescriptions[currentLayer + 1].label} for deeper understanding, or continue to reflection
            </div>
          )}
        </div>
      </div>
      {renderShuffleConfirmModal()}
      </>
    );
  }

  if (currentStep === 'reflection') {
    return (
      <>
        {renderOverlayPortal()}
        {renderShuffleConfirmModal()}
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
      </>
    );
  }

  return null;
};

export default FeedbackLoopSession;
