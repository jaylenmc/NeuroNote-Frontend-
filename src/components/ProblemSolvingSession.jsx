import React, { useState, useEffect } from 'react';
import { FiHelpCircle, FiCheck, FiArrowRight, FiZap, FiTarget, FiEdit, FiAlertCircle, FiMessageCircle } from 'react-icons/fi';

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
    generateSocraticQuestions();
  }, [currentCard?.id]);

  // Feynman Technique - Analyze explanation clarity
  const analyzeExplanation = () => {
    if (!userExplanation.trim()) return;
    
    const feedback = [];
    let score = 0;
    
    // Simple analysis - in a real app, this would be AI-powered
    const wordCount = userExplanation.split(' ').length;
    const hasExample = userExplanation.toLowerCase().includes('example') || 
                       userExplanation.toLowerCase().includes('like') ||
                       userExplanation.toLowerCase().includes('such as');
    const isSimple = !userExplanation.match(/\b(moreover|furthermore|subsequently|nevertheless)\b/i);
    
    if (wordCount < 20) {
      feedback.push({ type: 'warning', message: 'Your explanation is quite brief. Try to add more detail.' });
    } else {
      feedback.push({ type: 'success', message: 'Good length for an explanation!' });
      score += 25;
    }
    
    if (hasExample) {
      feedback.push({ type: 'success', message: 'Great! You included an example to illustrate your point.' });
      score += 25;
    } else {
      feedback.push({ type: 'suggestion', message: 'Try adding a real-world example to make it clearer.' });
    }
    
    if (isSimple) {
      feedback.push({ type: 'success', message: 'Your language is clear and accessible!' });
      score += 25;
    } else {
      feedback.push({ type: 'warning', message: 'Try using simpler language - explain as if to a 10-year-old.' });
    }
    
    if (userExplanation.includes('?')) {
      feedback.push({ type: 'success', message: 'You\'re asking questions - that\'s good metacognition!' });
      score += 25;
    }
    
    setAiFeedback(feedback);
    setClarityScore(Math.min(score, 100));
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

  // Check solution steps logic
  const checkSolutionSteps = () => {
    if (solutionSteps.length < 2) return;
    
    const feedback = [];
    
    // Stock data analysis - in real app, backend would process this
    if (solutionSteps.length >= 3) {
      feedback.push({ type: 'success', message: 'Good detail! You\'ve broken down the problem into clear steps.' });
    } else {
      feedback.push({ type: 'suggestion', message: 'Consider adding more intermediate steps for clarity.' });
    }
    
    // Check if steps use relevant keywords from the concept
    const hasRelevantTerms = solutionSteps.some(step => 
      step.toLowerCase().includes(currentCard.question.split(' ')[0].toLowerCase())
    );
    
    if (hasRelevantTerms) {
      feedback.push({ type: 'success', message: 'Your steps reference the concept - good connection!' });
    } else {
      feedback.push({ type: 'warning', message: 'Make sure your steps connect back to the core concept.' });
    }
    
    setStepsFeedback(feedback);
    setStepsChecked(true);
  };

  // Check final summary logic
  const checkFinalSummary = () => {
    if (!problemSolution.trim()) return;
    
    const feedback = [];
    const wordCount = problemSolution.split(' ').length;
    
    // Stock data analysis - in real app, backend would process this
    if (wordCount >= 30) {
      feedback.push({ type: 'success', message: 'Comprehensive summary with good detail!' });
    } else {
      feedback.push({ type: 'suggestion', message: 'Try to provide more detail in your summary.' });
    }
    
    // Check if summary mentions the steps
    const referencesSteps = problemSolution.toLowerCase().includes('step') || 
                           problemSolution.toLowerCase().includes('first') ||
                           problemSolution.toLowerCase().includes('then');
    
    if (referencesSteps) {
      feedback.push({ type: 'success', message: 'Great! Your summary ties together your reasoning steps.' });
    } else {
      feedback.push({ type: 'suggestion', message: 'Consider referencing your step-by-step reasoning.' });
    }
    
    // Check if it applies to real-world
    const hasApplication = problemSolution.toLowerCase().includes('apply') ||
                          problemSolution.toLowerCase().includes('use') ||
                          problemSolution.toLowerCase().includes('real');
    
    if (hasApplication) {
      feedback.push({ type: 'success', message: 'Excellent real-world application!' });
    } else {
      feedback.push({ type: 'warning', message: 'Make sure to explain how this applies in practice.' });
    }
    
    setSummaryFeedback(feedback);
    setSummaryChecked(true);
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
          <div className="question-card">
            <div className="question-icon">📚</div>
            <p className="question-text">{currentCard.question}</p>
          </div>

          <div className="explain-box">
            <div className="explain-header">
              <h3>Explain this concept as if teaching it to a 10-year-old</h3>
              <p>Use simple language, examples, and avoid jargon</p>
            </div>
            <textarea
              value={userExplanation}
              onChange={(e) => setUserExplanation(e.target.value)}
              placeholder="Type your explanation here... Try to make it as simple and clear as possible."
              rows="8"
            />
          </div>

          {aiFeedback.length > 0 && (
            <div className="clarity-feedback">
              <div className="clarity-score-section">
                <h4>Clarity Score</h4>
                <div className="clarity-meter">
                  <div className="clarity-fill" style={{ width: `${clarityScore}%` }}></div>
                </div>
                <span className="clarity-percentage">{clarityScore}%</span>
              </div>

              <div className="feedback-items">
                {aiFeedback.map((item, index) => (
                  <div key={index} className={`feedback-item ${item.type}`}>
                    {item.type === 'success' && '✓'}
                    {item.type === 'warning' && '⚠️'}
                    {item.type === 'suggestion' && '💡'}
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="feynman-actions">
            <button 
              className="analyze-btn action-btn"
              onClick={analyzeExplanation}
              disabled={!userExplanation.trim()}
            >
              <FiCheck />
              Check Clarity
            </button>
            <button 
              className="continue-btn action-btn"
              onClick={handleNextStep}
              disabled={clarityScore < 50}
              title={clarityScore < 50 ? 'Improve your clarity score to continue' : 'Continue to next step'}
            >
              Continue to Problem Solving
            </button>
          </div>

          {clarityScore < 50 && aiFeedback.length > 0 && (
            <div className="action-hint">Achieve 50% clarity score to continue</div>
          )}
        </div>
      </div>
    );
  }

  // Problem-Based Learning Step
  if (currentStep === 'problem-based') {
    return (
      <div className="problem-solving-pbl">
        <div className="session-title-center">
          <h2 className="session-main-title">🧩 Understanding + Problem Solving</h2>
          <div className="session-subtitle">Apply your knowledge to solve real-world scenarios</div>
        </div>

        <div className="pbl-content">
          <div className="scenario-card">
            <div className="scenario-icon">🌍</div>
            <div className="scenario-content">
              <h3>Real-World Scenario</h3>
              <p>{generateProblemScenario()}</p>
            </div>
          </div>

          <div className="solution-area">
            <div className="solution-area-header">
              <div>
                <h3>Your Solution Approach</h3>
                <p className="solution-hint">Break down your solution into steps. What principles apply?</p>
              </div>
              {solutionSteps.length >= 2 && !stepsChecked && (
                <button 
                  className="check-steps-btn"
                  onClick={checkSolutionSteps}
                >
                  <FiCheck />
                  Check Steps
                </button>
              )}
            </div>

            <div className="solution-steps-list">
              {solutionSteps.map((step, index) => (
                <div key={index} className="solution-step-item">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-text">{step}</div>
                </div>
              ))}
            </div>

            {stepsChecked && stepsFeedback.length > 0 && (
              <div className="steps-feedback">
                {stepsFeedback.map((item, index) => (
                  <div key={index} className={`feedback-item ${item.type}`}>
                    {item.type === 'success' && '✓'}
                    {item.type === 'warning' && '⚠️'}
                    {item.type === 'suggestion' && '💡'}
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            )}

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
              {problemSolution.trim() && !summaryChecked && (
                <button 
                  className="check-summary-btn"
                  onClick={checkFinalSummary}
                >
                  <FiCheck />
                  Check Summary
                </button>
              )}
            </div>
            <textarea
              value={problemSolution}
              onChange={(e) => {
                setProblemSolution(e.target.value);
                setSummaryChecked(false); // Reset check when editing
              }}
              placeholder="Summarize your complete solution and how it applies the concept..."
              rows="5"
            />

            {summaryChecked && summaryFeedback.length > 0 && (
              <div className="summary-feedback">
                {summaryFeedback.map((item, index) => (
                  <div key={index} className={`feedback-item ${item.type}`}>
                    {item.type === 'success' && '✓'}
                    {item.type === 'warning' && '⚠️'}
                    {item.type === 'suggestion' && '💡'}
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          {!stepsChecked && solutionSteps.length >= 2 && (
            <div className="action-hint">Click "Check Steps" to validate your reasoning</div>
          )}
          {stepsChecked && !summaryChecked && problemSolution.trim() && (
            <div className="action-hint">Click "Check Summary" to validate before continuing</div>
          )}
          {(solutionSteps.length < 2 || !problemSolution.trim()) && (
            <div className="action-hint">Add at least 2 reasoning steps and a final summary</div>
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
              className="complete-btn action-btn"
              onClick={handleNextStep}
              disabled={Object.keys(socraticAnswers).length < 2}
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