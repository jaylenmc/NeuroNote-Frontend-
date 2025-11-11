import React, { useState, useEffect } from 'react';
import { FiHelpCircle, FiCheck, FiArrowRight, FiZap, FiTarget, FiEdit, FiAlertCircle, FiMessageCircle, FiLoader } from 'react-icons/fi';
import api from '../api/axios';

const ProblemSolvingSession = ({ 
  currentCard, 
  onRatingSelect, 
  isFlipped, 
  setIsFlipped,
  sessionStats,
  nextCard,
  showNotification
}) => {
  const [currentStep, setCurrentStep] = useState('feynman'); // feynman, problem-based, socratic
  const [userExplanation, setUserExplanation] = useState('');
  const [aiFeedback, setAiFeedback] = useState([]);
  const [clarityScore, setClarityScore] = useState(0);
  const [problemSolution, setProblemSolution] = useState('');
  const [solutionSteps, setSolutionSteps] = useState([]);
  const [currentSolutionStep, setCurrentSolutionStep] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [socraticQuestions, setSocraticQuestions] = useState([]);
  const [socraticAnswers, setSocraticAnswers] = useState({});
  const [insights, setInsights] = useState([]);
  const [stepsChecked, setStepsChecked] = useState(false);
  const [stepsFeedback, setStepsFeedback] = useState([]);
  const [summaryChecked, setSummaryChecked] = useState(false);
  const [summaryFeedback, setSummaryFeedback] = useState([]);
  const [isCheckingExplanation, setIsCheckingExplanation] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [claudeFeedback, setClaudeFeedback] = useState('');
  const [claudeFeedbackHeader, setClaudeFeedbackHeader] = useState('');

  // Reset state when card changes
  useEffect(() => {
    setCurrentStep('feynman');
    setUserExplanation('');
    setAiFeedback([]);
    setClarityScore(0);
    setProblemSolution('');
    setSolutionSteps([]);
    setCurrentSolutionStep('');
    setShowHints(false);
    setSocraticQuestions([]);
    setSocraticAnswers({});
    setInsights([]);
    setStepsChecked(false);
    setStepsFeedback([]);
    setSummaryChecked(false);
    setSummaryFeedback([]);
    setIsCheckingExplanation(false);
    setIsCheckingConnection(false);
    setClaudeFeedback('');
    setClaudeFeedbackHeader('');
    generateSocraticQuestions();
  }, [currentCard?.id]);

  // Helper function to parse markdown formatting from Claude response
  const parseMarkdownFormatting = (text) => {
    if (!text) return { header: '', body: '' };
    
    // Remove score lines (e.g., "Score: 7" or "Score: 7/10" or "• Score: 8")
    let formatted = text.replace(/^.*Score:\s*\d+.*$/gmi, '');
    
    // Extract first h4 header (## Header) and remove it from body
    const h4Match = formatted.match(/^##\s+(.+)$/m);
    let header = '';
    if (h4Match) {
      header = h4Match[1].trim();
      formatted = formatted.replace(/^##\s+(.+)$/m, ''); // Remove the first h4
    }
    
    // Convert remaining markdown to HTML-like structure for better display
    // Convert common subheadings to h4 (Strengths, Improvements, etc.)
    // First handle bold format: **Strengths:** -> <h4>Strengths</h4>
    formatted = formatted.replace(/\*\*(Strengths|Improvements|Suggested improved version):?\*\*/gi, '<h4>$1</h4>');
    
    // Then handle plain format: Strengths: -> <h4>Strengths</h4> (at start of line or after newline)
    formatted = formatted.replace(/(^|\n)(Strengths|Improvements|Suggested improved version):/gim, '$1<h4>$2</h4>');
    
    // Remaining headers (## Header) -> styled headers
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<h5>$1</h5>');
    
    // Wrap "Strengths" and "Improvements" sections in section dividers
    // Process these first, before other wrapping
    formatted = formatted.replace(
      /(<h4>(Strengths|Improvements)[^<]*<\/h4>)([\s\S]*?)(?=<h[4-5]>|<strong>|<div class="claude|$)/gi,
      '<div class="claude-section">$1$3</div>'
    );
    
    // Wrap "Suggested improved version" section in a styled container
    // Match h4 with "Suggested improved version" and everything until next h4/h5/strong/div or end
    formatted = formatted.replace(
      /(<h4>Suggested improved version[^<]*<\/h4>)([\s\S]*?)(?=<h[4-5]>|<strong>|<div class="claude|$)/gi,
      '<div class="claude-suggestion-box">$1$2</div>'
    );
    
    // Bold (**text**) -> <strong> (but skip if already converted to h3)
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic (*text*) -> <em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Bullet points (- item) -> styled list items
    formatted = formatted.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    
    // Numbers (1. item) -> ordered list items
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    return { header, body: formatted.trim() };
  };

  // Feynman Technique - Analyze explanation clarity with backend
  const analyzeExplanation = async () => {
    if (!userExplanation.trim()) return;
    
    setIsCheckingExplanation(true);
    setAiFeedback([]);
    setClaudeFeedback('');
    
    try {
      const response = await api.post('/tutor/upsexplain/?type=explain', {
        question: currentCard.question,
        explanation: userExplanation
      });
      
      // Claude returns text response with score and feedback
      const claudeResponse = response.data;
      const { header, body } = parseMarkdownFormatting(claudeResponse);
      setClaudeFeedbackHeader(header);
      setClaudeFeedback(body);
      
      // Extract score from response (look for patterns like "Score: 7/10" or "Score: 70%")
      const scoreMatch = claudeResponse.match(/Score:\s*(\d+)(?:\/10)?/i) || 
                        claudeResponse.match(/(\d+)%/);
      let extractedScore = 50; // default
      
      if (scoreMatch) {
        const scoreValue = parseInt(scoreMatch[1]);
        // Convert to percentage if it's out of 10
        extractedScore = scoreValue <= 10 ? scoreValue * 10 : scoreValue;
      }
      
      setClarityScore(extractedScore);
      
      // Create simple feedback based on score (80% threshold for passing)
      const feedback = [];
      if (extractedScore >= 80) {
        feedback.push({ type: 'success', message: 'Excellent explanation! You can proceed to the next step.' });
      } else if (extractedScore >= 60) {
        feedback.push({ type: 'suggestion', message: 'Good progress! Aim for 80% to proceed. Review feedback to improve.' });
      } else {
        feedback.push({ type: 'warning', message: 'Your explanation needs work. Aim for at least 80% to continue.' });
      }
      
      setAiFeedback(feedback);
      
      if (showNotification) {
        showNotification(
          extractedScore >= 80 ? 
            'Great work! You can continue to the next step.' : 
            'Keep working on it - aim for 80% to proceed',
          extractedScore >= 80 ? 'success' : null
        );
      }
    } catch (error) {
      console.error('Error analyzing explanation:', error);
      const feedback = [{ 
        type: 'warning', 
        message: 'Failed to analyze explanation. Please try again.' 
      }];
      setAiFeedback(feedback);
      
      if (showNotification) {
        showNotification('Error analyzing explanation. Please try again.');
      }
    } finally {
      setIsCheckingExplanation(false);
    }
  };

  // Problem-Based Learning - Generate scenario
  const generateProblemScenario = () => {
    const question = currentCard.question.toLowerCase();
    
    // Generate contextual scenarios based on question type
    if (question.includes('physics') || question.includes('force') || question.includes('motion')) {
      return "You're designing a roller coaster. How would you apply these principles to ensure safety and excitement?";
    } else if (question.includes('biology') || question.includes('cell') || question.includes('organ')) {
      return "A patient presents with symptoms related to this system. How would you diagnose and explain the underlying process?";
    } else if (question.includes('chemistry') || question.includes('reaction') || question.includes('element')) {
      return "You need to create a compound with specific properties. How would you use this knowledge in the synthesis?";
    } else if (question.includes('math') || question.includes('equation') || question.includes('calculate')) {
      return "You're building a budget model for a startup. How would you apply this mathematical concept?";
    } else {
      return "Apply this concept to a real-world situation in your daily life. How would you use this knowledge?";
    }
  };

  const addSolutionStep = () => {
    if (currentSolutionStep.trim()) {
      setSolutionSteps(prev => [...prev, currentSolutionStep]);
      setCurrentSolutionStep('');
    }
  };

  const getHint = () => {
    const hints = [
      "What information do you already know?",
      "What is the question really asking?",
      "Can you break this into smaller parts?",
      "What principles or concepts apply here?"
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  // Socratic Questioning - Generate probing questions
  const generateSocraticQuestions = () => {
    const questions = [
      {
        id: 1,
        question: "What makes you confident this explanation is accurate?",
        type: 'confidence'
      },
      {
        id: 2,
        question: "What evidence or examples support your understanding?",
        type: 'evidence'
      },
      {
        id: 3,
        question: "What would change if we modified one key assumption?",
        type: 'assumption'
      },
      {
        id: 4,
        question: "How would you explain this to someone with no background knowledge?",
        type: 'simplification'
      },
      {
        id: 5,
        question: "What are the implications or consequences of this concept?",
        type: 'implication'
      }
    ];
    
    setSocraticQuestions(questions.slice(0, 3)); // Show 3 questions
  };

  const handleNextStep = () => {
    if (currentStep === 'feynman') {
      setCurrentStep('problem-based');
    } else if (currentStep === 'problem-based') {
      // Check if both validations are complete
      if (!stepsChecked) {
        if (showNotification) {
          showNotification('Check solution steps before continuing to reflection');
        }
        return;
      }
      if (!summaryChecked) {
        if (showNotification) {
          showNotification('Check summary before continuing to reflection');
        }
        return;
      }
      setCurrentStep('socratic');
    } else if (currentStep === 'socratic') {
      // Complete the understanding session
      onRatingSelect(5); // High rating for completing all steps
    }
  };

  const saveInsight = (insight) => {
    setInsights(prev => [...prev, { text: insight, timestamp: new Date() }]);
  };

  // Check solution steps and summary together with backend (connection type)
  const checkConnectionWithBackend = async () => {
    if (solutionSteps.length < 2 || !problemSolution.trim()) {
      if (showNotification) {
        showNotification('Please provide at least 2 steps and a summary before checking');
      }
      return;
    }
    
    setIsCheckingConnection(true);
    setStepsFeedback([]);
    setSummaryFeedback([]);
    
    try {
      const response = await api.post('/tutor/upsexplain/?type=connection', {
        question: currentCard.question,
        principles: solutionSteps,
        solution_summary: problemSolution
      });
      
      // Claude returns text response with pass/fail and feedback
      const claudeResponse = response.data;
      const { header, body } = parseMarkdownFormatting(claudeResponse);
      
      // Parse the response for pass/fail
      const isPassed = claudeResponse.toLowerCase().includes('pass') && 
                      !claudeResponse.toLowerCase().includes('fail');
      
      const feedback = [{
        type: isPassed ? 'success' : 'suggestion',
        message: isPassed ? 
          'Your principles and solution are well connected!' : 
          'Review the feedback to improve your connection between principles and solution.'
      }];
      
      // Store the full Claude feedback (formatted)
      setStepsFeedback(feedback);
      setSummaryFeedback([{ 
        type: 'info', 
        header: header,
        message: body 
      }]);
      
      setStepsChecked(true);
      setSummaryChecked(true);
      
      if (showNotification) {
        showNotification(
          isPassed ? 
            'Great connection between principles and solution!' : 
            'Review feedback to improve your answer',
          isPassed ? 'success' : null
        );
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      const feedback = [{ 
        type: 'warning', 
        message: 'Failed to analyze connection. Please try again.' 
      }];
      setStepsFeedback(feedback);
      
      if (showNotification) {
        showNotification('Error analyzing connection. Please try again.');
      }
    } finally {
      setIsCheckingConnection(false);
    }
  };

  // Legacy check functions (now just mark as checked for UI flow)
  const checkSolutionSteps = () => {
    if (solutionSteps.length < 2) return;
    setStepsChecked(true);
  };

  const checkFinalSummary = () => {
    if (!problemSolution.trim()) return;
    setSummaryChecked(true);
  };

  const resetClarityFeedback = () => {
    setAiFeedback([]);
    setClaudeFeedback('');
    setClaudeFeedbackHeader('');
    setClarityScore(0);
  };

  // Feynman Technique Step
  if (currentStep === 'feynman') {
    return (
      <div className="problem-solving-feynman">
        <div className="session-title-center">
          <h2 className="session-main-title">🧩 Understanding + Problem Solving</h2>
          <div className="session-subtitle">Teach to learn - Explain the concept in simple terms</div>
        </div>

        <div className="feynman-content">
          {aiFeedback.length === 0 && (
            <>
              <div className="question-card">
                <div className="question-icon">📚</div>
                <p className="question-text">{currentCard.question}</p>
              </div>

              <div className="explain-box">
                <div className="explain-header">
                  <div className="explain-header-text">
                    <h3>Explain this concept as if teaching it to a 10-year-old</h3>
                    <p>Use simple language, examples, and avoid jargon</p>
                  </div>
                  <button
                    className="analyze-btn action-btn explain-analyze-btn"
                    onClick={analyzeExplanation}
                    disabled={!userExplanation.trim() || isCheckingExplanation}
                  >
                    {isCheckingExplanation ? <FiLoader className="spinner-icon" /> : <FiCheck />}
                    {isCheckingExplanation ? 'Analyzing...' : 'Check Clarity'}
                  </button>
                </div>
                <textarea
                  value={userExplanation}
                  onChange={(e) => setUserExplanation(e.target.value)}
                  placeholder="Type your explanation here... Try to make it as simple and clear as possible."
                  rows="8"
                />
              </div>
            </>
          )}

          {aiFeedback.length > 0 && (
            <div className="clarity-feedback">
              {claudeFeedback && (
                <div className="claude-detailed-feedback">
                  <div className="claude-feedback-header">
                    <h2 className="claude-feedback-title">NeuroNote AI Detailed Feedback:</h2>
                    <div 
                      className={`claude-feedback-score ${
                        clarityScore >= 80 ? 'score-excellent' : 
                        clarityScore >= 60 ? 'score-good' : 
                        'score-poor'
                      }`}
                    >
                      Score: {clarityScore}%
                    </div>
                  </div>
                  <div 
                    className="claude-feedback-text" 
                    dangerouslySetInnerHTML={{ __html: claudeFeedback }}
                  />
                </div>
              )}
            </div>
          )}

          {aiFeedback.length > 0 && (
            <div className="feynman-actions">
              {clarityScore >= 80 ? (
                <button 
                  className="continue-btn action-btn"
                  onClick={handleNextStep}
                  title="Continue to next step"
                >
                  Continue to Problem Solving
                </button>
              ) : (
                <button 
                  className="retry-btn action-btn"
                  onClick={resetClarityFeedback}
                >
                  Retry Explanation
                </button>
              )}
            </div>
          )}

          {clarityScore < 80 && aiFeedback.length > 0 && (
            <div className="action-hint">Refine your explanation and try again</div>
          )}
        </div>
      </div>
    );
  }

  // Problem-Based Learning Step
  if (currentStep === 'problem-based') {
    return (
      <div className="problem-solving-pbl">
        <div className="scenario-card">
          <div className="scenario-content">
            <h3>🌍 Real-World Scenario</h3>
            <p>{generateProblemScenario()}</p>
          </div>
        </div>

        <div className="pbl-content">
          <div className="solution-area">
            <div className="solution-area-header">
              <div>
                <h3>Your Solution Approach</h3>
                <p className="solution-hint">Break down your solution into steps (principles). What principles apply?</p>
              </div>
              <div className="solution-area-help" role="tooltip">
                <button
                  type="button"
                  className="solution-help-btn"
                  aria-label="Solution guidance"
                >
                  <FiHelpCircle />
                </button>
                <div className="solution-help-tooltip">
                  Give real world connections about this topic
                </div>
              </div>
            </div>

            <div className="solution-steps-list">
              {solutionSteps.map((step, index) => (
                <div key={index} className="solution-step-item">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-text">{step}</div>
                </div>
              ))}
            </div>


            <div className="add-step-section">
              <div className="input-group">
                <input
                  type="text"
                  value={currentSolutionStep}
                  onChange={(e) => setCurrentSolutionStep(e.target.value)}
                  placeholder="Add your next reasoning step..."
                  onKeyPress={(e) => e.key === 'Enter' && addSolutionStep()}
                />
                <button onClick={addSolutionStep}>
                  <FiArrowRight />
                </button>
              </div>
            </div>

            {showHints && (
              <div className="hint-section">
                <FiZap className="hint-icon" />
                <p className="hint-text">{getHint()}</p>
              </div>
            )}
          </div>

          <div className="final-solution-area">
            <div className="solution-summary-header">
              <label>Final Solution Summary:</label>
            </div>
            <textarea
              value={problemSolution}
              onChange={(e) => {
                setProblemSolution(e.target.value);
                setStepsChecked(false); // Reset check when editing
                setSummaryChecked(false);
              }}
              placeholder="Summarize your complete solution and how it applies the concept..."
              rows="5"
            />
          </div>

          {/* Unified Check Button */}
          <div className="connection-check-section">
            <button 
              className={`check-connection-btn action-btn ${(solutionSteps.length < 2 || !problemSolution.trim() || isCheckingConnection) ? 'disabled' : ''}`}
              onClick={() => {
                const isDisabled = solutionSteps.length < 2 || !problemSolution.trim() || isCheckingConnection;
                
                if (isDisabled) {
                  let reason = '';
                  if (isCheckingConnection) {
                    reason = 'Please wait for the current analysis to complete.';
                  } else if (solutionSteps.length < 2) {
                    reason = 'Please add at least 2 principle steps before checking.';
                  } else if (!problemSolution.trim()) {
                    reason = 'Please provide a solution summary before checking.';
                  }
                  
                  if (showNotification && reason) {
                    showNotification(reason);
                  }
                  return;
                }
                
                checkConnectionWithBackend();
              }}
            >
              {isCheckingConnection ? <FiLoader className="spinner-icon" /> : <FiCheck />}
              {isCheckingConnection ? 'Analyzing Connection...' : 'Check with NeuroNote AI'}
            </button>
          </div>

          {isCheckingConnection && (
            <div className="checking-feedback">
              <FiLoader className="spinner-icon" />
              <span>NeuroNote AI is analyzing your principles and solution...</span>
            </div>
          )}

          {(stepsChecked || summaryChecked) && (stepsFeedback.length > 0 || summaryFeedback.length > 0) && (
            <div className="connection-feedback">
              {stepsFeedback.length > 0 && (
                <div className="steps-feedback">
                  {stepsFeedback.map((item, index) => (
                    <div key={index} className={`feedback-item ${item.type}`}>
                      {item.type === 'success' && '✓'}
                      {item.type === 'warning' && '⚠️'}
                      {item.type === 'suggestion' && '💡'}
                      {item.type === 'info' && 'ℹ️'}
                      <span>{item.message}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {summaryFeedback.length > 0 && (
                <div className="claude-detailed-feedback">
                  {summaryFeedback.map((item, index) => (
                    <div key={index}>
                      {item.header && (
                        <div className="claude-feedback-header">
                          <h4 className="claude-feedback-title">{item.header}</h4>
                        </div>
                      )}
                      <div 
                        className="claude-feedback-text"
                        dangerouslySetInnerHTML={{ __html: item.message }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pbl-actions">
            <button 
              className="hint-btn action-btn"
              onClick={() => setShowHints(!showHints)}
            >
              <FiZap />
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </button>
            <button 
              className={`continue-btn action-btn ${(!stepsChecked || !summaryChecked) ? 'disabled' : ''}`}
              onClick={handleNextStep}
              title={
                !stepsChecked && !summaryChecked 
                  ? 'Check your steps and summary to unlock' 
                  : !stepsChecked 
                    ? 'Check your solution steps first'
                    : !summaryChecked
                      ? 'Check your summary to unlock'
                      : 'Continue to reflection'
              }
            >
              Continue to Reflection
            </button>
          </div>

          {!stepsChecked && !summaryChecked && solutionSteps.length >= 2 && problemSolution.trim() && (
            <div className="action-hint">Click "Check with NeuroNote AI" to validate your solution</div>
          )}
          {(stepsChecked && summaryChecked) && (
            <div className="action-hint">Review the feedback and continue to reflection when ready</div>
          )}
          {(solutionSteps.length < 2 || !problemSolution.trim()) && (
            <div className="action-hint">Add at least 2 principle steps and a final summary before checking</div>
          )}
        </div>
      </div>
    );
  }

  // Socratic Self-Questioning Step
  if (currentStep === 'socratic') {
    return (
      <div className="problem-solving-socratic">
        <div className="session-title-center">
          <h2 className="session-main-title">🧩 Understanding + Problem Solving</h2>
          <div className="session-subtitle">Deepen your understanding through self-questioning</div>
        </div>

        <div className="socratic-content">
          <div className="socratic-intro">
            <p>Answer these reflective questions to strengthen your reasoning and expose any gaps in understanding.</p>
          </div>

          <div className="socratic-questions-list">
            {socraticQuestions.map((q) => (
              <div key={q.id} className="socratic-question-item">
                <div className="question-header">
                  <FiMessageCircle className="question-type-icon" />
                  <h4>{q.question}</h4>
                </div>
                <textarea
                  value={socraticAnswers[q.id] || ''}
                  onChange={(e) => setSocraticAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Your thoughtful response..."
                  rows="4"
                />
              </div>
            ))}
          </div>

          <div className="insight-tracker">
            <h4>💡 Key Insights</h4>
            <p>What are your main takeaways from this exploration?</p>
            <div className="insights-list">
              {insights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <span className="insight-bullet">•</span>
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
            <div className="add-insight">
              <input
                type="text"
                placeholder="Add a key insight or 'aha' moment..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    saveInsight(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>

          <div className="socratic-actions">
            <button 
              className={`complete-btn action-btn ${Object.keys(socraticAnswers).length < 2 ? 'disabled' : ''}`}
              onClick={() => {
                const isDisabled = Object.keys(socraticAnswers).length < 2;
                
                if (isDisabled) {
                  const answeredCount = Object.keys(socraticAnswers).length;
                  const reason = `Please answer at least 2 reflective questions to complete. You have answered ${answeredCount} question${answeredCount !== 1 ? 's' : ''}.`;
                  
                  if (showNotification) {
                    showNotification(reason);
                  }
                  return;
                }
                
                handleNextStep();
              }}
              title={Object.keys(socraticAnswers).length < 2 ? 'Answer at least 2 questions' : 'Complete understanding session'}
            >
              Complete Understanding Session
            </button>
          </div>

          {Object.keys(socraticAnswers).length < 2 && (
            <div className="action-hint">Answer at least 2 reflective questions to complete</div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ProblemSolvingSession;