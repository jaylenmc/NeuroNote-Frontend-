import React, { useState, useEffect } from 'react';
import { FiMap, FiHelpCircle, FiCheck, FiArrowRight, FiZap, FiTarget } from 'react-icons/fi';

const ProblemSolvingSession = ({ 
  currentCard, 
  onRatingSelect, 
  isFlipped, 
  setIsFlipped,
  sessionStats 
}) => {
  const [currentStep, setCurrentStep] = useState('concept-mapping'); // concept-mapping, reasoning, explanation
  const [conceptMap, setConceptMap] = useState({});
  const [reasoningSteps, setReasoningSteps] = useState([]);
  const [currentStepInput, setCurrentStepInput] = useState('');
  const [userExplanation, setUserExplanation] = useState('');
  const [scaffolding, setScaffolding] = useState('');
  const [showScaffolding, setShowScaffolding] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setCurrentStep('concept-mapping');
    setConceptMap({});
    setReasoningSteps([]);
    setCurrentStepInput('');
    setUserExplanation('');
    setScaffolding('');
    setShowScaffolding(false);
    generateConceptMap();
  }, [currentCard?.id]);

  const generateConceptMap = () => {
    // Generate initial concept map based on the question
    const question = currentCard.question;
    const answer = currentCard.answer;
    
    // Simple concept extraction - in a real app, this would be AI-powered
    const concepts = {
      main: question.split(' ').slice(0, 3).join(' '),
      related: answer.split(' ').slice(0, 5).join(' '),
      context: 'Key concepts and relationships'
    };
    
    setConceptMap(concepts);
  };

  const addReasoningStep = () => {
    if (currentStepInput.trim()) {
      setReasoningSteps(prev => [...prev, currentStepInput]);
      setCurrentStepInput('');
    }
  };

  const generateScaffolding = () => {
    const question = currentCard.question.toLowerCase();
    
    if (question.includes('why')) {
      setScaffolding("Consider the underlying causes and effects. What leads to this outcome?");
    } else if (question.includes('how')) {
      setScaffolding("Break down the process step by step. What are the key stages or components?");
    } else if (question.includes('compare') || question.includes('difference')) {
      setScaffolding("Identify similarities and differences. What makes them distinct?");
    } else if (question.includes('explain')) {
      setScaffolding("Think about the main components and how they relate to each other.");
    } else {
      setScaffolding("Consider the key concepts and their relationships. What's the logical connection?");
    }
    
    setShowScaffolding(true);
  };

  const handleNextStep = () => {
    if (currentStep === 'concept-mapping') {
      setCurrentStep('reasoning');
    } else if (currentStep === 'reasoning') {
      setCurrentStep('explanation');
    } else if (currentStep === 'explanation') {
      // Complete the problem-solving session
      onRatingSelect(5); // High rating for completing problem-solving
    }
  };

  const handleWhatIfScenario = () => {
    // Generate a what-if scenario
    const scenarios = [
      "What if we changed the main assumption?",
      "How would this work in a different context?",
      "What if we removed one of the key components?",
      "How would this apply to a similar but different situation?"
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCurrentStepInput(randomScenario);
  };

  if (currentStep === 'concept-mapping') {
    return (
      <div className="problem-solving-concept-mapping">
        <div className="concept-mapping-content">
          <div className="question-section">
            <h3>Analyze the Question</h3>
            <p className="question-text">{currentCard.question}</p>
          </div>

          <div className="concept-map-section">
            <h4>Identify Key Concepts</h4>
            <div className="concept-map">
              <div className="concept-node main">
                <span className="concept-label">Main Concept</span>
                <input 
                  type="text" 
                  value={conceptMap.main || ''}
                  onChange={(e) => setConceptMap(prev => ({ ...prev, main: e.target.value }))}
                  placeholder="Main concept or topic"
                />
              </div>
              
              <div className="concept-connections">
                <div className="connection-line"></div>
              </div>
              
              <div className="concept-node related">
                <span className="concept-label">Related Concepts</span>
                <input 
                  type="text" 
                  value={conceptMap.related || ''}
                  onChange={(e) => setConceptMap(prev => ({ ...prev, related: e.target.value }))}
                  placeholder="Related ideas or components"
                />
              </div>
              
              <div className="concept-node context">
                <span className="concept-label">Context</span>
                <input 
                  type="text" 
                  value={conceptMap.context || ''}
                  onChange={(e) => setConceptMap(prev => ({ ...prev, context: e.target.value }))}
                  placeholder="Context or framework"
                />
              </div>
            </div>
          </div>

          <div className="concept-actions">
            <button className="continue-btn" onClick={handleNextStep}>
              <FiArrowRight />
              Continue to Reasoning
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'reasoning') {
    return (
      <div className="problem-solving-reasoning">
        <div className="reasoning-content">
          <div className="reasoning-prompt">
            <h3>Work Through Your Reasoning</h3>
            <p>Break down your thinking process step by step.</p>
          </div>

          <div className="reasoning-steps">
            {reasoningSteps.map((step, index) => (
              <div key={index} className="reasoning-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">{step}</div>
              </div>
            ))}
          </div>

          <div className="reasoning-input">
            <div className="input-group">
              <input
                type="text"
                value={currentStepInput}
                onChange={(e) => setCurrentStepInput(e.target.value)}
                placeholder="Add your next reasoning step..."
                onKeyPress={(e) => e.key === 'Enter' && addReasoningStep()}
              />
              <button onClick={addReasoningStep}>
                <FiArrowRight />
              </button>
            </div>
          </div>

          <div className="reasoning-help">
            <button 
              className="scaffolding-btn"
              onClick={generateScaffolding}
            >
              <FiHelpCircle />
              Get Guidance
            </button>
            
            <button 
              className="whatif-btn"
              onClick={handleWhatIfScenario}
            >
              <FiZap />
              What-If Scenario
            </button>
          </div>

          {showScaffolding && (
            <div className="scaffolding-hint">
              <FiHelpCircle className="hint-icon" />
              <p>{scaffolding}</p>
            </div>
          )}

          <div className="reasoning-actions">
            <button className="continue-btn" onClick={handleNextStep}>
              <FiArrowRight />
              Continue to Explanation
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'explanation') {
    return (
      <div className="problem-solving-explanation">
        <div className="explanation-content">
          <div className="explanation-prompt">
            <h3>Explain Your Understanding</h3>
            <p>Now explain your reasoning and understanding in your own words.</p>
          </div>

          <div className="explanation-input">
            <textarea
              value={userExplanation}
              onChange={(e) => setUserExplanation(e.target.value)}
              placeholder="Explain your understanding and reasoning..."
              rows="6"
            />
          </div>

          <div className="explanation-criteria">
            <h4>Check your explanation for:</h4>
            <ul>
              <li>✓ Clear logical flow</li>
              <li>✓ Key concepts included</li>
              <li>✓ Proper reasoning</li>
              <li>✓ Complete understanding</li>
            </ul>
          </div>

          <div className="explanation-actions">
            <button 
              className="complete-btn"
              onClick={handleNextStep}
              disabled={!userExplanation.trim()}
            >
              Complete Problem Solving
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProblemSolvingSession;
