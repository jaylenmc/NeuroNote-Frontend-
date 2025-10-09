import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRotateCcw, FiTarget, FiZap, FiCode, FiEdit, FiArrowRight } from 'react-icons/fi';
import CodeEditor from './CodeEditor';

const FeedbackLoopSession = ({ 
  currentCard, 
  onRatingSelect, 
  isFlipped, 
  setIsFlipped,
  sessionStats,
  onAttemptChange,
  nextCard
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

  // Reset state when card changes
  useEffect(() => {
    setCurrentStep('practice');
    setUserAnswer('');
    setFeedback('');
    setAttemptCount(0);
    setShowHint(false);
    setReflectionAnswer('');
    setDifficulty('medium');
    
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

  const generateFeedback = () => {
    const correctAnswer = currentCard.answer.toLowerCase();
    const userInput = userAnswer.toLowerCase();
    
    // Simple feedback logic - in a real app, this would be AI-generated
    if (userInput.includes(correctAnswer) || correctAnswer.includes(userInput)) {
      setFeedback("Great job! You're on the right track. Let's see if you can be more specific.");
    } else if (userInput.length > 0) {
      setFeedback("Good attempt! Here's a hint: think about the key concepts in the question.");
    } else {
      setFeedback("No worries! Let's break this down step by step.");
    }
    
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
  };

  const handleSubmitAnswer = () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    if (onAttemptChange) {
      onAttemptChange(newAttemptCount);
    }
    generateFeedback();
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
      <div className="feedback-loop-practice">
        <div className="session-title-center">
          <h2 className="session-main-title">🔄 Doing + Feedback Loop</h2>
          <div className="session-subtitle">Learn by doing and refining through feedback</div>
        </div>
        
        <div className="practice-content">
          <div className="question-card">
            <div className="question-icon">🧩</div>
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
            <button 
              className="submit-btn action-btn"
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
              title={!userAnswer.trim() ? 'Complete answer to unlock' : 'Submit your answer'}
            >
              Submit Answer
            </button>
          </div>
          
          {!userAnswer.trim() && (
            <div className="action-hint">Complete your answer to submit</div>
          )}
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
            <div className="feedback-message">
              <p>{feedback}</p>
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
              </div>
              <div className="correct-answer-content">
                {currentCard.answer}
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
            <button className="continue-btn action-btn" onClick={handleNextStep}>
              Continue to Reflection
            </button>
          </div>
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
