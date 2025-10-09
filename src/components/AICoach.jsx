import React, { useState, useEffect } from 'react';
import { FiTarget, FiZap, FiX, FiActivity, FiArrowUp } from 'react-icons/fi';

const AICoach = ({ 
  sessionStats, 
  selectedStudyMethod, 
  currentCardIndex, 
  totalCards,
  onRecommendationClick 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [sessionStats, selectedStudyMethod, currentCardIndex, totalCards]);

  const generateRecommendations = () => {
    const newRecommendations = [];
    
    // Performance-based recommendations
    if (sessionStats.averageTime < 15) {
      newRecommendations.push({
        id: 'slow-down',
        type: 'performance',
        icon: '🐌',
        title: 'Slow Down',
        message: 'You\'re going quite fast. Consider taking more time to process each card.',
        priority: 'medium',
        action: 'Take your time to fully understand each concept'
      });
    } else if (sessionStats.averageTime > 60) {
      newRecommendations.push({
        id: 'speed-up',
        type: 'performance',
        icon: '⚡',
        title: 'Pick Up Pace',
        message: 'You\'re taking your time, which is great! Consider slightly faster recall.',
        priority: 'low',
        action: 'Try to recall answers more quickly'
      });
    }

    // Study method recommendations
    if (selectedStudyMethod?.id === 'recall-retention') {
      newRecommendations.push({
        id: 'try-feedback',
        type: 'method',
        icon: '🔄',
        title: 'Try Feedback Loop',
        message: 'Consider switching to the Doing + Feedback Loop method for more interactive learning.',
        priority: 'high',
        action: 'Switch to interactive practice'
      });
    } else if (selectedStudyMethod?.id === 'doing-feedback') {
      newRecommendations.push({
        id: 'try-problem-solving',
        type: 'method',
        icon: '🧩',
        title: 'Try Problem Solving',
        message: 'Ready for deeper thinking? Try the Understanding + Problem Solving method.',
        priority: 'medium',
        action: 'Switch to analytical approach'
      });
    }

    // Progress-based recommendations
    const progressPercent = (currentCardIndex / totalCards) * 100;
    if (progressPercent > 75) {
      newRecommendations.push({
        id: 'almost-done',
        type: 'motivation',
        icon: '🎯',
        title: 'Almost There!',
        message: 'Great progress! You\'re almost done with this session.',
        priority: 'low',
        action: 'Keep up the excellent work'
      });
    }

    // Streak-based recommendations
    if (sessionStats.streakCount > 10) {
      newRecommendations.push({
        id: 'streak-bonus',
        type: 'achievement',
        icon: '🔥',
        title: 'Streak Master!',
        message: `Amazing ${sessionStats.streakCount} card streak! You're in the zone.`,
        priority: 'low',
        action: 'Maintain your momentum'
      });
    }

    // Learning style recommendations
    if (sessionStats.improvementRate > 20) {
      newRecommendations.push({
        id: 'excellent-progress',
        type: 'achievement',
        icon: '📈',
        title: 'Excellent Progress!',
        message: `You're improving by ${sessionStats.improvementRate}% - keep it up!`,
        priority: 'medium',
        action: 'Continue your current approach'
      });
    }

    setRecommendations(newRecommendations.slice(0, 3)); // Limit to 3 recommendations
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#7c83fd';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'performance': return <FiArrowUp />;
      case 'method': return <FiTarget />;
      case 'motivation': return <FiZap />;
      case 'achievement': return <FiActivity />;
      default: return <FiZap />;
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`ai-coach ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="coach-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Hide Neuro Coach' : 'Show Neuro Coach'}
      >
        <FiActivity className="coach-icon" />
        <span className="coach-badge">{recommendations.length}</span>
      </button>

      {isExpanded && (
        <div className="coach-panel">
          <div className="coach-header">
            <h3>Neuro Coach Recommendations</h3>
            <button 
              className="close-coach"
              onClick={() => setIsExpanded(false)}
            >
              <FiX />
            </button>
          </div>

          <div className="recommendations-list">
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                className={`recommendation-item priority-${rec.priority}`}
                onClick={() => onRecommendationClick && onRecommendationClick(rec)}
              >
                <div className="recommendation-icon">
                  {getTypeIcon(rec.type)}
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-header">
                    <h4>{rec.title}</h4>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(rec.priority) }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="recommendation-message">{rec.message}</p>
                  <div className="recommendation-action">{rec.action}</div>
                </div>
                <div className="recommendation-emoji">{rec.icon}</div>
              </div>
            ))}
          </div>

          <div className="coach-footer">
            <p>Neuro Coach analyzes your performance and suggests optimizations</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;
