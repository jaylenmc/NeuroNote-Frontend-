import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRotateCcw, FiTarget, FiZap, FiCode, FiEdit, FiArrowRight, FiLock, FiUnlock, FiShuffle } from 'react-icons/fi';
import CodeEditor from './CodeEditor';
import api from '../api/axios';

const FeedbackLoopSession = ({ 
  currentCard, 
  onRatingSelect, 
  isFlipped, 
  setIsFlipped,
  sessionStats,
  onAttemptChange,
  nextCard,
  onShuffle
}) => {
  const [currentStep, setCurrentStep] = useState('practice'); // practice, feedback, reflection
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [contentType, setContentType] = useState('text'); // text, code
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [parsedFeedback, setParsedFeedback] = useState(null);
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
    setParsedFeedback(null);
    setIsSubmitting(false);
    setShowCorrectAnswer(false);
    
    // Detect content type from question
    detectContentType();
  }, [currentCard?.id]);

  const detectContentType = () => {
    if (!currentCard) return;
    
    const question = currentCard.question.toLowerCase();
    
    // Check for coding keywords
    if (question.includes('code') || question.includes('function') || 
        question.includes('algorithm') || question.includes('program') ||
        question.includes('implement') || question.includes('write a')) {
      setContentType('code');
      
      // Detect language from question
      if (question.includes('python')) setCodeLanguage('python');
      else if (question.includes('javascript') || question.includes('js')) setCodeLanguage('javascript');
      else if (question.includes('typescript') || question.includes('ts')) setCodeLanguage('typescript');
      else if (question.includes('java') && !question.includes('javascript')) setCodeLanguage('java');
      else if (question.includes('c++') || question.includes('cpp')) setCodeLanguage('cpp');
      else if (question.includes(' c ') || question.includes('c code')) setCodeLanguage('c');
      else if (question.includes('go') || question.includes('golang')) setCodeLanguage('go');
      else if (question.includes('rust')) setCodeLanguage('rust');
      else if (question.includes('php')) setCodeLanguage('php');
      else if (question.includes('ruby')) setCodeLanguage('ruby');
      else if (question.includes('swift')) setCodeLanguage('swift');
      else if (question.includes('kotlin')) setCodeLanguage('kotlin');
      else setCodeLanguage('javascript'); // Default to JavaScript
    }
    // Default to text
    else {
      setContentType('text');
    }
  };

  // Parse AI feedback response to extract verdict and grade
  const parseAiResponse = (response) => {
    try {
      // Look for verdict and grade patterns in the response - handle multiple formats
      const verdictMatch = response.match(/\*\*Verdict\*\*:\s*([^\n]+)/i) || 
                          response.match(/Verdict:\s*([^\n]+)/i) ||
                          response.match(/verdict\s*([^\n]+)/i) ||
                          response.match(/\*\*Verdict\*\*:\s*([^**]+)/i);
      
      const gradeMatch = response.match(/\*\*Grade\*\*:\s*(\d+)%/i) || 
                        response.match(/Grade:\s*(\d+)%/i) ||
                        response.match(/grade\s*(\d+)%/i) ||
                        response.match(/\*\*Grade\*\*:\s*(\d+)%/i);
      
      const verdict = verdictMatch ? verdictMatch[1].trim() : null;
      const grade = gradeMatch ? parseInt(gradeMatch[1]) : null;
      
      return {
        verdict,
        grade,
        fullResponse: response
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        verdict: null,
        grade: null,
        fullResponse: response
      };
    }
  };

  const generateFeedback = async () => {
    if (!currentCard || !userAnswer.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestData = {
        question: currentCard.question,
        correct_answer: currentCard.answer,
        user_answer: userAnswer,
        attempt_count: attemptCount
      };

      const response = await api.post('/tutor/doingfeedback/', requestData);
      
      if (response.data) {
        const parsedResponse = parseAiResponse(response.data);
        setAiResponse(response.data);
        setParsedFeedback(parsedResponse);
        
        // Set difficulty based on grade if available
        if (parsedResponse.grade !== null) {
          if (parsedResponse.grade >= 80) {
            setDifficulty('easy');
          } else if (parsedResponse.grade >= 60) {
            setDifficulty('intermediate');
          } else {
            setDifficulty('hard');
          }
        } else {
          // Fallback to next card's learning status
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
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setAiResponse('Sorry, there was an error getting feedback. Please try again.');
      setParsedFeedback({
        verdict: null,
        grade: null,
        fullResponse: 'Error getting feedback'
      });
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
      setCurrentStep('reflection');
    } else if (currentStep === 'reflection') {
      // Move to next card
      onRatingSelect(4); // Default rating for feedback loop completion
    }
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
          <h2 className="session-main-title">🔄 Doing + Feedback Loop</h2>
          <div className="session-subtitle">Learn by doing and refining through feedback</div>
        </div>
        
        <div className="practice-content">
                  <div className="question-card">
                    <div className="question-icon">❓</div>
                    <p className="question-text">{currentCard.question}</p>
                  </div>

          <div className="answer-area">
            <div className="answer-area-header">
              <div className="input-mode-label">Select input mode:</div>
              <div className="header-meta">
                <div className="attempts-display">
                  <FiTarget className="attempts-icon" />
                  <span>Attempt {attemptCount + 1}</span>
                </div>
              </div>
            </div>
            <div className="content-type-selector">
              <button
                className={`type-btn ${contentType === 'text' ? 'active' : ''}`}
                onClick={() => setContentType('text')}
                title="Text Answer"
              >
                <FiEdit />
                Text
              </button>
              <button
                className={`type-btn ${contentType === 'code' ? 'active' : ''}`}
                onClick={() => setContentType('code')}
                title="Code Editor"
              >
                <FiCode />
                Code
              </button>
            </div>

            {contentType === 'text' && (
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
            )}

            {contentType === 'code' && (
              <div className="code-input-container">
                <div className="code-header">
                  <label>Write Your Code:</label>
                  <select 
                    className="language-selector"
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="typescript">TypeScript</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="swift">Swift</option>
                    <option value="kotlin">Kotlin</option>
                  </select>
                </div>
                <CodeEditor 
                  language={codeLanguage}
                  onCodeChange={setUserAnswer}
                  initialCode={userAnswer}
                />
              </div>
            )}
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
              <h3>Neuro Feedback</h3>
            </div>
            <div className="feedback-message" style={{ position: 'relative' }}>
              {parsedFeedback && parsedFeedback.grade !== null && (
                <div style={{ 
                  position: 'absolute', 
                  top: '16px', 
                  right: '16px',
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.9rem', 
                  fontWeight: '700',
                  backgroundColor: parsedFeedback.grade >= 70 ? 'rgba(40, 167, 69, 0.15)' : 
                                  parsedFeedback.grade >= 50 ? 'rgba(255, 193, 7, 0.15)' : 
                                  'rgba(255, 107, 107, 0.15)',
                  color: parsedFeedback.grade >= 70 ? '#28a745' : 
                         parsedFeedback.grade >= 50 ? '#ffc107' : 
                         '#ff6b6b',
                  border: `2px solid ${parsedFeedback.grade >= 70 ? 'rgba(40, 167, 69, 0.3)' : 
                                       parsedFeedback.grade >= 50 ? 'rgba(255, 193, 7, 0.3)' : 
                                       'rgba(255, 107, 107, 0.3)'}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  {parsedFeedback.grade}%
                </div>
              )}
              {parsedFeedback && (
                <div style={{ marginBottom: '16px' }}>
                  {parsedFeedback.verdict && (
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.9rem', 
                      fontWeight: '600',
                      marginBottom: '12px',
                      backgroundColor: parsedFeedback.grade >= 70 ? 'rgba(40, 167, 69, 0.1)' : 
                                      parsedFeedback.grade >= 50 ? 'rgba(255, 193, 7, 0.1)' : 
                                      'rgba(255, 107, 107, 0.1)',
                      color: parsedFeedback.grade >= 70 ? '#28a745' : 
                             parsedFeedback.grade >= 50 ? '#ffc107' : 
                             '#ff6b6b',
                      border: `1px solid ${parsedFeedback.grade >= 70 ? 'rgba(40, 167, 69, 0.2)' : 
                                               parsedFeedback.grade >= 50 ? 'rgba(255, 193, 7, 0.2)' : 
                                               'rgba(255, 107, 107, 0.2)'}`
                    }}>
                      <strong>Verdict:</strong> {parsedFeedback.verdict}
                    </div>
                  )}
                </div>
              )}
              <div 
                style={{ 
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}
                dangerouslySetInnerHTML={{
                  __html: (aiResponse || feedback)
                    .replace(/\*\*Verdict\*\*:\s*[^\n]+\n?/gi, '') // Remove verdict line
                    .replace(/\*\*Grade\*\*:\s*\d+%\n?/gi, '') // Remove grade line
                    .replace(/Verdict:\s*[^\n]+\n?/gi, '') // Remove verdict line without **
                    .replace(/Grade:\s*\d+%\n?/gi, '') // Remove grade line without **
                    .replace(/verdict\s*[^\n]+\n?/gi, '') // Remove verdict line lowercase
                    .replace(/grade\s*\d+%\n?/gi, '') // Remove grade line lowercase
                    .replace(/^### (.*$)/gim, '<h3 class="feedback-h3">$1</h3>') // Convert ### to h3
                    .replace(/^## (.*$)/gim, '<h2 class="feedback-h2">$1</h2>') // Convert ## to h2
                    .replace(/^# (.*$)/gim, '<h1 class="feedback-h1">$1</h1>') // Convert # to h1
                    .replace(/^\d+\.\s+(.*$)/gim, '<div style="margin: 8px 0; padding-left: 20px; position: relative;"><span style="color: #7c83fd; font-weight: 600; position: absolute; left: 0;">•</span>$1</div>') // Convert numbered lists
                    .replace(/^- (.*$)/gim, '<div style="margin: 8px 0; padding-left: 20px; position: relative;"><span style="color: #7c83fd; font-weight: 600; position: absolute; left: 0;">•</span>$1</div>') // Convert bullet lists
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--nightowl-text-main); font-weight: 700;">$1</strong>') // Bold text
                    .replace(/\*(.*?)\*/g, '<em style="color: var(--nightowl-text-steel); font-style: italic;">$1</em>') // Italic text
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
            <button className="try-again-btn action-btn" onClick={handleTryAgain}>
              <FiRotateCcw />
              Try Again
            </button>
            <button 
              className={`continue-btn action-btn ${parsedFeedback && parsedFeedback.grade !== null && parsedFeedback.grade < 90 ? 'disabled' : ''}`}
              onClick={handleNextStep}
              disabled={parsedFeedback && parsedFeedback.grade !== null && parsedFeedback.grade < 90}
              title={parsedFeedback && parsedFeedback.grade !== null && parsedFeedback.grade < 90 ? 'Achieve 90% or higher to continue to reflection' : 'Continue to Reflection'}
            >
              Continue to Reflection
            </button>
          </div>
          
          {parsedFeedback && parsedFeedback.grade !== null && parsedFeedback.grade < 90 && (
            <div className="action-hint" style={{ textAlign: 'center', marginTop: '12px', color: '#ff6b6b', fontWeight: '600' }}>
              🎯 Achieve 90% or higher to unlock reflection phase
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
