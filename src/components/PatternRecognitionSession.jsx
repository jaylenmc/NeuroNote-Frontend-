import React, { useState, useEffect } from 'react';
import { FiLink, FiEye, FiTarget, FiCheck, FiArrowRight, FiZap } from 'react-icons/fi';

const PatternRecognitionSession = ({ 
  currentCard, 
  onRatingSelect, 
  isFlipped, 
  setIsFlipped,
  sessionStats 
}) => {
  const [currentStep, setCurrentStep] = useState('pattern-discovery'); // pattern-discovery, analogy, application, synthesis
  const [discoveredPatterns, setDiscoveredPatterns] = useState([]);
  const [analogies, setAnalogies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [synthesisExample, setSynthesisExample] = useState('');
  const [patternInput, setPatternInput] = useState('');
  const [analogyInput, setAnalogyInput] = useState('');
  const [applicationInput, setApplicationInput] = useState('');

  // Reset state when card changes
  useEffect(() => {
    setCurrentStep('pattern-discovery');
    setDiscoveredPatterns([]);
    setAnalogies([]);
    setApplications([]);
    setSynthesisExample('');
    setPatternInput('');
    setAnalogyInput('');
    setApplicationInput('');
    generatePatternExamples();
  }, [currentCard?.id]);

  const generatePatternExamples = () => {
    // Generate example patterns based on the card content
    const question = currentCard.question.toLowerCase();
    const answer = currentCard.answer.toLowerCase();
    
    // Simple pattern extraction - in a real app, this would be AI-powered
    const examples = [];
    
    if (question.includes('formula') || question.includes('equation')) {
      examples.push({
        type: 'Mathematical Pattern',
        example: 'Variables + Operations = Result',
        description: 'Mathematical relationships follow structured patterns'
      });
    } else if (question.includes('process') || question.includes('step')) {
      examples.push({
        type: 'Process Pattern',
        example: 'Input → Process → Output',
        description: 'Sequential processes follow predictable patterns'
      });
    } else if (question.includes('cause') || question.includes('effect')) {
      examples.push({
        type: 'Causal Pattern',
        example: 'Cause → Effect → Consequence',
        description: 'Cause-effect relationships follow logical patterns'
      });
    } else {
      examples.push({
        type: 'Conceptual Pattern',
        example: 'Definition → Characteristics → Applications',
        description: 'Concepts follow structured understanding patterns'
      });
    }
    
    setDiscoveredPatterns(examples);
  };

  const addPattern = () => {
    if (patternInput.trim()) {
      setDiscoveredPatterns(prev => [...prev, {
        type: 'Custom Pattern',
        example: patternInput,
        description: 'User-identified pattern'
      }]);
      setPatternInput('');
    }
  };

  const addAnalogy = () => {
    if (analogyInput.trim()) {
      setAnalogies(prev => [...prev, {
        source: analogyInput.split(' is like ')[0] || analogyInput,
        target: analogyInput.split(' is like ')[1] || 'the concept',
        connection: 'Similar structure or function'
      }]);
      setAnalogyInput('');
    }
  };

  const addApplication = () => {
    if (applicationInput.trim()) {
      setApplications(prev => [...prev, {
        scenario: applicationInput,
        pattern: 'Real-world application',
        relevance: 'High'
      }]);
      setApplicationInput('');
    }
  };

  const generateAnalogy = () => {
    const analogies = [
      'Learning is like building a house - you need a strong foundation',
      'Memory is like a library - organized storage and retrieval',
      'Understanding is like solving a puzzle - pieces fit together',
      'Knowledge is like a tree - roots, trunk, and branches',
      'Practice is like exercising - repetition builds strength'
    ];
    
    const randomAnalogy = analogies[Math.floor(Math.random() * analogies.length)];
    setAnalogyInput(randomAnalogy);
  };

  const generateApplication = () => {
    const applications = [
      'How would this apply in a work environment?',
      'What real-world problem does this solve?',
      'How might this be used in daily life?',
      'What industry applications exist?',
      'How does this relate to current events?'
    ];
    
    const randomApplication = applications[Math.floor(Math.random() * applications.length)];
    setApplicationInput(randomApplication);
  };

  const handleNextStep = () => {
    if (currentStep === 'pattern-discovery') {
      setCurrentStep('analogy');
    } else if (currentStep === 'analogy') {
      setCurrentStep('application');
    } else if (currentStep === 'application') {
      setCurrentStep('synthesis');
    } else if (currentStep === 'synthesis') {
      // Complete the pattern recognition session
      onRatingSelect(5); // High rating for completing pattern recognition
    }
  };

  if (currentStep === 'pattern-discovery') {
    return (
      <div className="pattern-recognition-discovery">
        <div className="pattern-discovery-content">
          <div className="question-section">
            <p className="question-text">{currentCard.question}</p>
          </div>

          <div className="pattern-examples">
            <h4>Identified Patterns:</h4>
            {discoveredPatterns.map((pattern, index) => (
              <div key={index} className="pattern-item">
                <div className="pattern-type">{pattern.type}</div>
                <div className="pattern-example">{pattern.example}</div>
                <div className="pattern-description">{pattern.description}</div>
              </div>
            ))}
          </div>

          <div className="pattern-input">
            <div className="input-group">
              <input
                type="text"
                value={patternInput}
                onChange={(e) => setPatternInput(e.target.value)}
                placeholder="Describe a pattern you notice..."
                onKeyPress={(e) => e.key === 'Enter' && addPattern()}
              />
              <button onClick={addPattern}>
                <FiArrowRight />
              </button>
            </div>
          </div>

          <div className="pattern-actions">
            <button className="continue-btn" onClick={handleNextStep}>
              <FiArrowRight />
              Continue to Analogies
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'analogy') {
    return (
      <div className="pattern-recognition-analogy">
        <div className="analogy-content">
          <div className="analogy-prompt">
            <h3>Find Similarities</h3>
            <p>What does this remind you of? Find connections to other concepts.</p>
          </div>

          <div className="analogy-examples">
            {analogies.map((analogy, index) => (
              <div key={index} className="analogy-item">
                <div className="analogy-source">{analogy.source}</div>
                <div className="analogy-connector">is like</div>
                <div className="analogy-target">{analogy.target}</div>
                <div className="analogy-connection">{analogy.connection}</div>
              </div>
            ))}
          </div>

          <div className="analogy-input">
            <div className="input-group">
              <input
                type="text"
                value={analogyInput}
                onChange={(e) => setAnalogyInput(e.target.value)}
                placeholder="This is like..."
                onKeyPress={(e) => e.key === 'Enter' && addAnalogy()}
              />
              <button onClick={addAnalogy}>
                <FiArrowRight />
              </button>
            </div>
          </div>

          <div className="analogy-help">
            <button className="generate-analogy-btn" onClick={generateAnalogy}>
              <FiZap />
              Generate Example
            </button>
          </div>

          <div className="analogy-actions">
            <button className="continue-btn" onClick={handleNextStep}>
              <FiArrowRight />
              Continue to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'application') {
    return (
      <div className="pattern-recognition-application">
        <div className="application-content">
          <div className="application-prompt">
            <h3>Apply to Real Situations</h3>
            <p>How would you use this pattern in authentic contexts?</p>
          </div>

          <div className="application-examples">
            {applications.map((application, index) => (
              <div key={index} className="application-item">
                <div className="application-scenario">{application.scenario}</div>
                <div className="application-pattern">Pattern: {application.pattern}</div>
                <div className="application-relevance">Relevance: {application.relevance}</div>
              </div>
            ))}
          </div>

          <div className="application-input">
            <div className="input-group">
              <input
                type="text"
                value={applicationInput}
                onChange={(e) => setApplicationInput(e.target.value)}
                placeholder="Describe a real-world application..."
                onKeyPress={(e) => e.key === 'Enter' && addApplication()}
              />
              <button onClick={addApplication}>
                <FiArrowRight />
              </button>
            </div>
          </div>

          <div className="application-help">
            <button className="generate-application-btn" onClick={generateApplication}>
              <FiZap />
              Generate Scenario
            </button>
          </div>

          <div className="application-actions">
            <button className="continue-btn" onClick={handleNextStep}>
              <FiArrowRight />
              Continue to Synthesis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'synthesis') {
    return (
      <div className="pattern-recognition-synthesis">
        <div className="synthesis-content">
          <div className="synthesis-prompt">
            <h3>Create Your Own Example</h3>
            <p>Now create your own example following the patterns you've discovered.</p>
          </div>

          <div className="synthesis-input">
            <textarea
              value={synthesisExample}
              onChange={(e) => setSynthesisExample(e.target.value)}
              placeholder="Create your own example following the pattern..."
              rows="6"
            />
          </div>

          <div className="synthesis-criteria">
            <h4>Your example should:</h4>
            <ul>
              <li>✓ Follow the identified pattern</li>
              <li>✓ Be original and creative</li>
              <li>✓ Demonstrate understanding</li>
              <li>✓ Be applicable to real situations</li>
            </ul>
          </div>

          <div className="synthesis-actions">
            <button 
              className="complete-btn"
              onClick={handleNextStep}
              disabled={!synthesisExample.trim()}
            >
              Complete Pattern Recognition
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PatternRecognitionSession;
