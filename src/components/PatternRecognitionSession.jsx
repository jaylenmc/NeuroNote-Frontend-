import React, { useState, useEffect } from 'react';
import { 
  FiEye, 
  FiTarget, 
  FiEdit, 
  FiCheck, 
  FiArrowRight, 
  FiZap,
  FiBookmark,
  FiLayers,
  FiRefreshCw,
  FiCpu,
  FiTrendingUp,
  FiAward,
  FiCode,
  FiFileText,
  FiPenTool
} from 'react-icons/fi';

/**
 * Pattern Recognition + Applied Learning Session
 * 
 * 5-Phase Learning Cycle:
 * 1. Observe - Study expert examples and identify patterns
 * 2. Deconstruct - Break patterns into skill chunks
 * 3. Recreate - Build your own version using patterns
 * 4. Feedback - AI analyzes and compares your work
 * 5. Reflect - Summarize and save patterns learned
 */
const PatternRecognitionSession = ({ 
  currentCard, 
  onRatingSelect, 
  isFlipped, 
  setIsFlipped,
  sessionStats 
}) => {
  // Phase management
  const [currentPhase, setCurrentPhase] = useState('observe'); // observe, deconstruct, recreate, feedback, reflect
  
  // Observe phase
  const [expertExamples, setExpertExamples] = useState([]);
  const [selectedExample, setSelectedExample] = useState(0);
  const [highlights, setHighlights] = useState([]);
  const [highlightMode, setHighlightMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [labelInput, setLabelInput] = useState('');
  
  // Deconstruct phase
  const [skillChunks, setSkillChunks] = useState([]);
  const [completedChunks, setCompletedChunks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [chunkAnswer, setChunkAnswer] = useState('');
  
  // Recreate phase
  const [recreationMode, setRecreationMode] = useState('guided'); // guided or freestyle
  const [userCreation, setUserCreation] = useState('');
  const [scaffoldingComplete, setScaffoldingComplete] = useState([]);
  
  // Feedback phase
  const [aiFeedback, setAiFeedback] = useState(null);
  const [comparisonView, setComparisonView] = useState(false);
  
  // Reflect phase
  const [patternSummary, setPatternSummary] = useState('');
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [nextSteps, setNextSteps] = useState('');

  // Reset state when card changes
  useEffect(() => {
    setCurrentPhase('observe');
    setHighlights([]);
    setSkillChunks([]);
    setCompletedChunks([]);
    setUserCreation('');
    setAiFeedback(null);
    setPatternSummary('');
    generateExpertExamples();
  }, [currentCard?.id]);

  // Generate expert examples based on card content
  const generateExpertExamples = () => {
    const question = currentCard.question.toLowerCase();
    const answer = currentCard.answer;
    
    // Generate multiple expert examples for comparison
    const examples = [];
    
    // Example 1 - The Answer (Core Expert Pattern)
      examples.push({
      title: 'Expert Example 1',
      type: 'Core Pattern',
      content: answer,
      highlights: [],
      description: 'This is the foundational answer demonstrating the core pattern.'
    });
    
    // Example 2 - Extended Version
      examples.push({
      title: 'Expert Example 2',
      type: 'Extended Pattern',
      content: `${answer}\n\nApplication: This concept applies when you need to understand the relationship between elements. Notice how the structure follows a logical progression from definition to application.`,
      highlights: [],
      description: 'An extended version showing how the pattern scales.'
    });
    
    // Example 3 - Annotated Version
      examples.push({
      title: 'Expert Example 3',
      type: 'Annotated Pattern',
      content: `[Introduction] ${answer.split('.')[0]}.\n\n[Core Concept] ${answer.split('.').slice(1).join('.')}\n\n[Key Takeaway] The pattern demonstrates systematic thinking.`,
      highlights: [],
      description: 'A structured version with clear sections labeled.'
    });
    
    setExpertExamples(examples);
  };

  // Handle text selection for highlighting
  const handleTextSelection = () => {
    if (!highlightMode) return;
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  // Add highlight with label
  const addHighlight = () => {
    if (selectedText && labelInput) {
      setHighlights(prev => [...prev, {
        text: selectedText,
        label: labelInput,
        id: Date.now()
      }]);
      setSelectedText('');
      setLabelInput('');
    }
  };

  // AI Pattern Analysis
  const analyzePatterns = () => {
    const analysis = {
      confirmedPatterns: highlights.map(h => ({
        text: h.text,
        label: h.label,
        aiInsight: `Yes, this represents a "${h.label}" pattern. Notice how it creates structure and clarity.`
      })),
      additionalPatterns: [
        {
          pattern: 'Logical Progression',
          description: 'The expert example follows a clear beginning → middle → end structure.',
          occurrences: 'Throughout the entire example'
        },
        {
          pattern: 'Evidence-Based Reasoning',
          description: 'Claims are supported with specific details and explanations.',
          occurrences: 'In the middle sections'
        }
      ],
      commonalities: 'All expert examples share: Clear structure, specific details, logical flow, and practical application.'
    };
    
    return analysis;
  };

  // Generate skill chunks
  const generateSkillChunks = () => {
    const chunks = [
      {
        title: 'Foundation Building',
        description: 'Understand the core concept and its basic structure',
        challenge: `What is the main idea being expressed in this concept?`,
        hint: 'Look at how the expert introduces the topic',
        completed: false
      },
      {
        title: 'Pattern Recognition',
        description: 'Identify the recurring structure or method',
        challenge: `What pattern or structure does this follow?`,
        hint: 'Notice the organization and flow',
        completed: false
      },
      {
        title: 'Application Understanding',
        description: 'See how the concept applies in practice',
        challenge: `How would you use this in a real situation?`,
        hint: 'Think about practical scenarios',
        completed: false
      },
      {
        title: 'Synthesis',
        description: 'Combine all elements into a cohesive understanding',
        challenge: `Explain this concept in your own words using the pattern you identified`,
        hint: 'Use the structure but make it your own',
        completed: false
      }
    ];
    
    setSkillChunks(chunks);
  };

  // Handle chunk completion
  const completeChunk = () => {
    if (chunkAnswer.trim()) {
      const updatedChunks = [...completedChunks, {
        ...skillChunks[currentChunk],
        userAnswer: chunkAnswer,
        completed: true
      }];
      
      setCompletedChunks(updatedChunks);
      setChunkAnswer('');
      
      if (currentChunk < skillChunks.length - 1) {
        setCurrentChunk(currentChunk + 1);
      } else {
        // All chunks complete, move to recreate phase
        setTimeout(() => {
          setCurrentPhase('recreate');
        }, 500);
      }
    }
  };

  // Generate AI Feedback
  const generateFeedback = () => {
    const feedback = {
      overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
      strengths: [
        'You successfully identified the core pattern structure',
        'Your recreation maintains logical flow',
        'Good use of specific details and examples'
      ],
      improvements: [
        'Consider adding more transitional phrases',
        'The conclusion could be strengthened',
        'Try incorporating more of the evidence pattern'
      ],
      patternAlignment: {
        structure: 85,
        clarity: 90,
        application: 80,
        innovation: 75
      },
      comparison: {
        similarities: 'Your work closely follows the expert pattern with good structural alignment.',
        differences: 'You added creative elements while maintaining the core pattern.',
        evolution: 'Your approach shows understanding and adaptation of the pattern.'
      },
      nextLevel: 'Try incorporating multiple patterns in one creation for added complexity.'
    };
    
    setAiFeedback(feedback);
  };

  // Phase navigation
  const handleNextPhase = () => {
    switch (currentPhase) {
      case 'observe':
        generateSkillChunks();
        setCurrentPhase('deconstruct');
        break;
      case 'deconstruct':
        setCurrentPhase('recreate');
        break;
      case 'recreate':
        generateFeedback();
        setCurrentPhase('feedback');
        break;
      case 'feedback':
        setCurrentPhase('reflect');
        break;
      case 'reflect':
        // Complete the session with high rating
        onRatingSelect(5);
        break;
    }
  };

  const handleSkipToRecreate = () => {
    setCurrentPhase('recreate');
  };

  // Save pattern to library
  const savePattern = () => {
    if (patternSummary.trim()) {
      const pattern = {
        title: `Pattern from: ${currentCard.question.substring(0, 50)}...`,
        summary: patternSummary,
        chunks: completedChunks,
        dateCreated: new Date().toLocaleDateString(),
        tags: ['pattern-recognition', 'applied-learning']
      };
      
      setSavedPatterns(prev => [...prev, pattern]);
      
      // Show success message
      alert('Pattern saved to your library!');
    }
  };

  // PHASE 1: OBSERVE
  if (currentPhase === 'observe') {
    const analysis = highlights.length >= 3 ? analyzePatterns() : null;
    
    return (
      <div className="pattern-phase pattern-observe">
        <div className="phase-container">
          {/* Phase Header */}
          <div className="phase-header">
            <div className="phase-icon-badge">
              <FiEye className="phase-icon" />
            </div>
            <div className="phase-title-section">
              <h2 className="phase-title">Phase 1: Observe Expert Patterns</h2>
              <p className="phase-subtitle">Study excellence and identify the hidden structures</p>
            </div>
          </div>

          {/* Example Tabs */}
          <div className="example-tabs">
            {expertExamples.map((example, index) => (
              <button
                key={index}
                className={`example-tab ${selectedExample === index ? 'active' : ''}`}
                onClick={() => setSelectedExample(index)}
              >
                <FiFileText />
                <span>{example.title}</span>
                <span className="example-type">{example.type}</span>
              </button>
            ))}
          </div>

          {/* Expert Example Display */}
          <div className="expert-example-card">
            <div className="example-header">
              <h3>{expertExamples[selectedExample]?.title}</h3>
              <p className="example-description">{expertExamples[selectedExample]?.description}</p>
            </div>
            
            <div 
              className={`example-content ${highlightMode ? 'highlight-mode' : ''}`}
              onMouseUp={handleTextSelection}
            >
              {expertExamples[selectedExample]?.content}
            </div>

            {/* Highlight Controls */}
            <div className="highlight-controls">
              <button 
                className={`highlight-mode-btn ${highlightMode ? 'active' : ''}`}
                onClick={() => setHighlightMode(!highlightMode)}
              >
                <FiPenTool />
                {highlightMode ? 'Exit Highlight Mode' : 'Enter Highlight Mode'}
              </button>
              
              {highlightMode && selectedText && (
                <div className="label-input-group">
              <input
                type="text"
                    placeholder="Label this section (e.g., 'intro technique', 'evidence pattern')"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                  />
                  <button onClick={addHighlight} className="add-label-btn">
                    <FiCheck /> Add Label
              </button>
                </div>
              )}
            </div>
          </div>

          {/* Highlighted Patterns */}
          {highlights.length > 0 && (
            <div className="highlights-panel">
              <h4>
                <FiBookmark />
                Your Identified Patterns ({highlights.length})
              </h4>
              <div className="highlights-list">
                {highlights.map((highlight) => (
                  <div key={highlight.id} className="highlight-item">
                    <div className="highlight-label">{highlight.label}</div>
                    <div className="highlight-text">"{highlight.text}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Pattern Analysis */}
          {analysis && (
            <div className="ai-analysis-panel">
              <div className="ai-panel-header">
                <FiCpu className="ai-icon" />
                <h4>AI Pattern Analysis</h4>
              </div>
              
              <div className="analysis-section">
                <h5>Confirmed Patterns</h5>
                {analysis.confirmedPatterns.map((pattern, idx) => (
                  <div key={idx} className="pattern-confirmation">
                    <div className="pattern-label-confirm">{pattern.label}</div>
                    <div className="ai-insight">{pattern.aiInsight}</div>
                  </div>
                ))}
              </div>

              <div className="analysis-section">
                <h5>Additional Patterns AI Detected</h5>
                {analysis.additionalPatterns.map((pattern, idx) => (
                  <div key={idx} className="additional-pattern">
                    <div className="pattern-name">{pattern.pattern}</div>
                    <div className="pattern-desc">{pattern.description}</div>
                    <div className="pattern-occurrence">Found in: {pattern.occurrences}</div>
                  </div>
                ))}
              </div>

              <div className="analysis-section">
                <h5>Common Across Examples</h5>
                <div className="commonalities-text">{analysis.commonalities}</div>
              </div>
            </div>
          )}

          {/* Compare Mode */}
          <div className="compare-section">
            <button className="compare-btn">
              <FiLayers />
              Compare All Examples Side-by-Side
            </button>
            <p className="compare-hint">See what patterns repeat across different expert examples</p>
          </div>

          {/* Navigation */}
          <div className="phase-navigation">
            <div className="progress-indicator">
              <span className="progress-text">Patterns Identified: {highlights.length}</span>
              {highlights.length >= 2 && <FiCheck className="progress-check" />}
            </div>
            <button 
              className="continue-phase-btn"
              onClick={handleNextPhase}
              disabled={highlights.length < 2}
            >
              Continue to Deconstruction
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: DECONSTRUCT
  if (currentPhase === 'deconstruct') {
    const currentChunkData = skillChunks[currentChunk];
    const progress = (completedChunks.length / skillChunks.length) * 100;
    
    return (
      <div className="pattern-phase pattern-deconstruct">
        <div className="phase-container">
          {/* Phase Header */}
          <div className="phase-header">
            <div className="phase-icon-badge">
              <FiLayers className="phase-icon" />
            </div>
            <div className="phase-title-section">
              <h2 className="phase-title">Phase 2: Deconstruct into Skill Chunks</h2>
              <p className="phase-subtitle">Break the pattern down into buildable pieces</p>
            </div>
          </div>

          {/* Skill Progress Map */}
          <div className="skill-progress-map">
            <h4>Your Skill Building Journey</h4>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="chunks-grid">
              {skillChunks.map((chunk, index) => (
                <div 
                  key={index} 
                  className={`chunk-node ${index === currentChunk ? 'current' : ''} ${completedChunks.some(c => c.title === chunk.title) ? 'completed' : ''}`}
                >
                  <div className="chunk-number">{index + 1}</div>
                  <div className="chunk-title">{chunk.title}</div>
                  {completedChunks.some(c => c.title === chunk.title) && (
                    <FiCheck className="chunk-check" />
                  )}
              </div>
            ))}
            </div>
          </div>

          {/* Current Chunk */}
          {currentChunkData && (
            <div className="current-chunk-card">
              <div className="chunk-header">
                <div className="chunk-badge">
                  <FiTarget />
                  Chunk {currentChunk + 1} of {skillChunks.length}
                </div>
                <h3>{currentChunkData.title}</h3>
                <p className="chunk-description">{currentChunkData.description}</p>
              </div>

              <div className="chunk-challenge">
                <h4>Mini Challenge</h4>
                <p className="challenge-text">{currentChunkData.challenge}</p>
                
                <div className="chunk-hint-box">
                  <FiZap />
                  <span>Hint: {currentChunkData.hint}</span>
                </div>
              </div>

              <div className="chunk-answer-area">
                <label>Your Answer</label>
                <textarea
                  value={chunkAnswer}
                  onChange={(e) => setChunkAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={5}
                />
              </div>

              <div className="chunk-actions">
                <button 
                  className="complete-chunk-btn"
                  onClick={completeChunk}
                  disabled={!chunkAnswer.trim()}
                >
                  <FiCheck />
                  Complete Chunk
                </button>
              </div>
            </div>
          )}

          {/* Completed Chunks Review */}
          {completedChunks.length > 0 && (
            <div className="completed-chunks-panel">
              <h4>
                <FiAward />
                Completed Chunks ({completedChunks.length})
              </h4>
              <div className="completed-chunks-list">
                {completedChunks.map((chunk, index) => (
                  <div key={index} className="completed-chunk-item">
                    <div className="completed-chunk-title">
                      <FiCheck />
                      {chunk.title}
                    </div>
                    <div className="completed-chunk-answer">{chunk.userAnswer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="phase-navigation">
            <div className="progress-indicator">
              <span className="progress-text">
                Progress: {completedChunks.length} / {skillChunks.length} chunks
              </span>
            </div>
            <button 
              className="skip-phase-btn"
              onClick={handleSkipToRecreate}
            >
              Skip to Creation
                <FiArrowRight />
              </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: RECREATE
  if (currentPhase === 'recreate') {
    return (
      <div className="pattern-phase pattern-recreate">
        <div className="phase-container">
          {/* Phase Header */}
          <div className="phase-header">
            <div className="phase-icon-badge">
              <FiEdit className="phase-icon" />
            </div>
            <div className="phase-title-section">
              <h2 className="phase-title">Phase 3: Recreate & Apply</h2>
              <p className="phase-subtitle">Build your own version using the patterns you've learned</p>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="recreation-mode-selector">
            <button
              className={`mode-btn ${recreationMode === 'guided' ? 'active' : ''}`}
              onClick={() => setRecreationMode('guided')}
            >
              <FiTarget />
              <div>
                <div className="mode-title">Guided Build</div>
                <div className="mode-desc">Follow scaffolded steps</div>
              </div>
            </button>
            <button
              className={`mode-btn ${recreationMode === 'freestyle' ? 'active' : ''}`}
              onClick={() => setRecreationMode('freestyle')}
            >
              <FiZap />
              <div>
                <div className="mode-title">Freestyle Creation</div>
                <div className="mode-desc">Create from scratch</div>
              </div>
            </button>
          </div>

          {/* Original Question Reference */}
          <div className="reference-card">
            <h4>Original Question</h4>
            <p>{currentCard.question}</p>
          </div>

          {/* Guided Mode */}
          {recreationMode === 'guided' && (
            <div className="guided-creation">
              <div className="scaffolding-info">
                <FiTarget />
                <p>Fill in the missing parts using the patterns you identified</p>
              </div>
              
              <div className="guided-template">
                <div className="template-section">
                  <span className="template-label">[Introduction]</span>
                  <input 
                    type="text" 
                    placeholder="Start with the main concept..."
                    className="template-input"
                  />
                </div>
                
                <div className="template-section">
                  <span className="template-label">[Core Explanation]</span>
                  <textarea 
                    placeholder="Explain the key idea using the pattern structure..."
                    rows={4}
                    className="template-input"
                  />
                </div>
                
                <div className="template-section">
                  <span className="template-label">[Application/Example]</span>
                  <textarea 
                    placeholder="Show how this applies in practice..."
                    rows={3}
                    className="template-input"
                  />
                </div>
                
                <div className="template-section">
                  <span className="template-label">[Conclusion]</span>
                  <input 
                    type="text" 
                    placeholder="Summarize the key takeaway..."
                    className="template-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Freestyle Mode */}
          {recreationMode === 'freestyle' && (
            <div className="freestyle-creation">
              <div className="freestyle-info">
                <FiZap />
                <p>Create your own version from scratch. Use the patterns but make it original!</p>
              </div>
              
              <div className="pattern-reminders">
                <h5>Patterns to Remember:</h5>
                <div className="pattern-chips">
                  {highlights.map((h, idx) => (
                    <div key={idx} className="pattern-chip">
                      {h.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="freestyle-editor">
                <textarea
                  value={userCreation}
                  onChange={(e) => setUserCreation(e.target.value)}
                  placeholder="Start creating your own example using the patterns you've learned...

Remember to:
- Follow the structural pattern
- Use clear logical flow
- Include specific details
- Apply it to a real scenario"
                  rows={15}
                  className="freestyle-textarea"
                />
                <div className="editor-stats">
                  <span>{userCreation.split(' ').filter(w => w.length > 0).length} words</span>
                  <span>{userCreation.length} characters</span>
                </div>
              </div>
            </div>
          )}

          {/* Patterns Checklist */}
          <div className="creation-checklist">
            <h4>Creation Checklist</h4>
            <div className="checklist-items">
              <div className="checklist-item">
                <FiCheck />
                <span>Follows the identified pattern structure</span>
              </div>
              <div className="checklist-item">
                <FiCheck />
                <span>Original and creative</span>
              </div>
              <div className="checklist-item">
                <FiCheck />
                <span>Demonstrates understanding</span>
              </div>
              <div className="checklist-item">
                <FiCheck />
                <span>Applicable to real situations</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="phase-navigation">
            <button 
              className="continue-phase-btn"
              onClick={handleNextPhase}
              disabled={recreationMode === 'freestyle' && userCreation.length < 50}
            >
              Get AI Feedback
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 4: FEEDBACK
  if (currentPhase === 'feedback') {
    return (
      <div className="pattern-phase pattern-feedback">
        <div className="phase-container">
          {/* Phase Header */}
          <div className="phase-header">
            <div className="phase-icon-badge">
              <FiCpu className="phase-icon" />
            </div>
            <div className="phase-title-section">
              <h2 className="phase-title">Phase 4: AI Feedback & Analysis</h2>
              <p className="phase-subtitle">See how your creation compares to expert patterns</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="feedback-score-card">
            <div className="score-circle">
              <div className="score-value">{aiFeedback?.overallScore}</div>
              <div className="score-label">Overall Score</div>
            </div>
            <div className="score-message">
              {aiFeedback?.overallScore >= 90 && "Excellent! You've mastered this pattern! 🌟"}
              {aiFeedback?.overallScore >= 80 && aiFeedback?.overallScore < 90 && "Great work! Strong pattern application! 🎯"}
              {aiFeedback?.overallScore < 80 && "Good progress! Keep refining! 💪"}
            </div>
          </div>

          {/* Pattern Alignment */}
          <div className="pattern-alignment-panel">
            <h4>Pattern Alignment Analysis</h4>
            <div className="alignment-metrics">
              {Object.entries(aiFeedback?.patternAlignment || {}).map(([key, value]) => (
                <div key={key} className="alignment-metric">
                  <div className="metric-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <div className="metric-bar-container">
                    <div className="metric-bar" style={{ width: `${value}%` }}>
                      <span className="metric-value">{value}%</span>
                    </div>
                  </div>
              </div>
            ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="feedback-details">
            <div className="feedback-column strengths">
              <h4>
                <FiAward />
                Strengths
              </h4>
              <ul>
                {aiFeedback?.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-column improvements">
              <h4>
                <FiTrendingUp />
                Areas to Improve
              </h4>
              <ul>
                {aiFeedback?.improvements.map((improvement, idx) => (
                  <li key={idx}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comparison View */}
          <div className="comparison-panel">
            <button 
              className="toggle-comparison-btn"
              onClick={() => setComparisonView(!comparisonView)}
            >
              <FiRefreshCw />
              {comparisonView ? 'Hide' : 'Show'} Side-by-Side Comparison
            </button>

            {comparisonView && (
              <div className="comparison-view">
                <div className="comparison-column">
                  <h5>Expert Pattern</h5>
                  <div className="comparison-content">
                    {expertExamples[0]?.content}
                  </div>
                </div>

                <div className="comparison-divider"></div>

                <div className="comparison-column">
                  <h5>Your Creation</h5>
                  <div className="comparison-content">
                    {userCreation || "Your guided creation..."}
                  </div>
                </div>
              </div>
            )}

            <div className="comparison-analysis">
              <div className="analysis-item">
                <strong>Similarities:</strong> {aiFeedback?.comparison.similarities}
              </div>
              <div className="analysis-item">
                <strong>Differences:</strong> {aiFeedback?.comparison.differences}
              </div>
              <div className="analysis-item">
                <strong>Evolution:</strong> {aiFeedback?.comparison.evolution}
              </div>
            </div>
          </div>

          {/* Next Level Challenge */}
          <div className="next-level-card">
            <FiTarget className="next-level-icon" />
            <div className="next-level-content">
              <h4>Next Level Challenge</h4>
              <p>{aiFeedback?.nextLevel}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="phase-navigation">
            <button 
              className="continue-phase-btn"
              onClick={handleNextPhase}
            >
              Reflect & Save Pattern
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 5: REFLECT
  if (currentPhase === 'reflect') {
    return (
      <div className="pattern-phase pattern-reflect">
        <div className="phase-container">
          {/* Phase Header */}
          <div className="phase-header">
            <div className="phase-icon-badge">
              <FiBookmark className="phase-icon" />
            </div>
            <div className="phase-title-section">
              <h2 className="phase-title">Phase 5: Reflect & Save</h2>
              <p className="phase-subtitle">Capture what you learned and add it to your pattern library</p>
            </div>
          </div>

          {/* Journey Summary */}
          <div className="journey-summary">
            <h3>Your Learning Journey</h3>
            <div className="journey-steps">
              <div className="journey-step completed">
                <FiEye />
                <span>Observed {expertExamples.length} expert examples</span>
              </div>
              <div className="journey-step completed">
                <FiBookmark />
                <span>Identified {highlights.length} patterns</span>
              </div>
              <div className="journey-step completed">
                <FiLayers />
                <span>Completed {completedChunks.length} skill chunks</span>
              </div>
              <div className="journey-step completed">
                <FiEdit />
                <span>Created your own version</span>
              </div>
              <div className="journey-step completed">
                <FiCpu />
                <span>Received AI feedback (Score: {aiFeedback?.overallScore})</span>
              </div>
            </div>
          </div>

          {/* Pattern Summary */}
          <div className="pattern-summary-section">
            <h4>Summarize the Pattern You Learned</h4>
            <p className="summary-prompt">
              In your own words, what pattern or structure did you discover? How will you use it?
            </p>
            <textarea
              value={patternSummary}
              onChange={(e) => setPatternSummary(e.target.value)}
              placeholder="Example: 'I learned the Introduction-Evidence-Conclusion pattern. This structure helps organize complex ideas by starting broad, providing specific support, then summarizing the key takeaway. I'll use this when...'"
              rows={6}
              className="pattern-summary-textarea"
            />
          </div>

          {/* Next Steps */}
          <div className="next-steps-section">
            <h4>What Will You Do Next Time?</h4>
            <textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="What will you try differently or focus on in your next practice?"
              rows={4}
              className="next-steps-textarea"
            />
          </div>

          {/* Save to Pattern Library */}
          <div className="save-pattern-section">
            <button 
              className="save-pattern-btn"
              onClick={savePattern}
              disabled={!patternSummary.trim()}
            >
              <FiBookmark />
              Save to Pattern Library
            </button>
            <p className="save-hint">
              Your pattern will be saved for future reference and can be reused in other contexts
            </p>
          </div>

          {/* Pattern Tags */}
          <div className="pattern-tags-section">
            <h4>Pattern Tags (Optional)</h4>
            <div className="tag-suggestions">
              <button className="tag-chip">Structure</button>
              <button className="tag-chip">Logic</button>
              <button className="tag-chip">Evidence-Based</button>
              <button className="tag-chip">Problem-Solving</button>
              <button className="tag-chip">Creative</button>
            </div>
          </div>

          {/* Completion Stats */}
          <div className="completion-stats">
            <div className="stat-card">
              <FiTarget />
              <div className="stat-value">{highlights.length}</div>
              <div className="stat-label">Patterns Found</div>
            </div>
            <div className="stat-card">
              <FiLayers />
              <div className="stat-value">{completedChunks.length}</div>
              <div className="stat-label">Skills Built</div>
            </div>
            <div className="stat-card">
              <FiAward />
              <div className="stat-value">{aiFeedback?.overallScore}%</div>
              <div className="stat-label">Achievement</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="phase-navigation">
            <button 
              className="complete-session-btn"
              onClick={handleNextPhase}
            >
              <FiCheck />
              Complete Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PatternRecognitionSession;
