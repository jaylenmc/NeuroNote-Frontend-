import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEye, FiRotateCcw, FiCheck, FiX } from 'react-icons/fi';
import './QuizCreatePage.css';

const QuizResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  // Get results data from navigation state
  const { score, totalQuestions, questions, userAnswers, quizTitle, timeTakenSeconds } = location.state || {};

  // Calculate correct answers from score
  const correctAnswers = Math.round((score / 100) * totalQuestions);

  const handleBack = () => {
    navigate('/quiz');
  };

  const handleReview = () => {
    navigate(`/quiz/${quizId}/review`);
  };

  const handleRetake = () => {
    navigate(`/quiz/${quizId}/test`);
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'high-score'; // Green for 80%+
    if (score >= 60) return 'medium-score'; // Yellowish orange for 60-79%
    return 'low-score'; // Red for 0-59%
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 70) return 'Good job!';
    if (score >= 50) return 'Not bad!';
    return 'Keep practicing!';
  };

  const formatTimeTaken = (totalSeconds) => {
    if (totalSeconds == null || totalSeconds < 0) return null;
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;
    const hours = Math.floor(totalSeconds / 3600);
    if (totalSeconds < 3600) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    if (hours === 1) return minutes > 0 ? `1hr ${minutes}m` : '1hr';
    return minutes > 0 ? `${hours}hrs ${minutes}m` : `${hours}hrs`;
  };

  const getWrongQuestions = () => {
    if (!questions || !userAnswers) return [];
    
    return questions.filter((question) => {
      const userAnswer = userAnswers[question.id];
      if (question.question_type === 'MC') {
        // For MC, check if user selected the correct answer
        const correctAnswerId = question.answerIds[question.correctIdx];
        return userAnswer !== correctAnswerId;
      }
      // For WR, consider wrong if no answer provided
      return !userAnswer || !userAnswer.trim();
    });
  };

  const wrongQuestions = getWrongQuestions();

  if (!location.state) {
    return (
      <div className="quiz-create-bg">
        <div className="error-message">No results data found. Please take the quiz first.</div>
      </div>
    );
  }

  return (
    <div className="quiz-create-bg quiz-create-scrollbar">
      {/* Navbar */}
      <nav className="quiz-create-navbar">
        <div className="quiz-create-navbar-left">
          <button className="quiz-create-navbar-back-btn" onClick={handleBack}>
            <FiArrowLeft style={{ marginRight: 6 }} /> Back
          </button>
        </div>
        <div className="quiz-create-navbar-center-fixed">
          <span className="quiz-create-navbar-questions-count">Results</span>
        </div>
        <div className="quiz-create-navbar-right">
          <div className="quiz-create-navbar-title-static" title={quizTitle || 'Quiz Results'}>
            {quizTitle || 'Quiz Results'}
          </div>
        </div>
      </nav>

      <div className="quiz-create-main-layout">
        <main className="quiz-create-main-content">
          {/* Score Overview */}
          <div className="quiz-create-question-card fade-slide">
            <div className="quiz-results-score-container">
              <div className={`quiz-results-score-percentage ${getScoreClass(score)}`}>
                {score}%
              </div>
              <div className="quiz-results-score-message">
                {getScoreMessage(score)}
              </div>
              <div className="quiz-results-score-details">
                You got {correctAnswers} out of {totalQuestions} questions correct
              </div>
              {timeTakenSeconds != null && formatTimeTaken(timeTakenSeconds) && (
                <div className="quiz-results-time-taken">
                  <span className="material-symbols-outlined quiz-results-time-icon">pace</span>
                  <span>Completed in: {formatTimeTaken(timeTakenSeconds)}</span>
                </div>
              )}
            </div>

            {/* Performance Breakdown */}
            <div className="quiz-results-performance-section">
              <h3 className="quiz-results-section-title">Performance Breakdown</h3>
              <div className="quiz-results-stats-container">
                <div className="quiz-results-stat-card">
                  <div className="quiz-results-stat-value correct">
                    {correctAnswers}
                  </div>
                  <div className="quiz-results-stat-label">Correct</div>
                </div>
                <div className="quiz-results-stat-card">
                  <div className="quiz-results-stat-value incorrect">
                    {totalQuestions - correctAnswers}
                  </div>
                  <div className="quiz-results-stat-label">Incorrect</div>
                </div>
                <div className="quiz-results-stat-card">
                  <div className="quiz-results-stat-value total">
                    {totalQuestions}
                  </div>
                  <div className="quiz-results-stat-label">Total</div>
                </div>
              </div>
            </div>

            {/* Wrong Questions Summary */}
            {wrongQuestions.length > 0 && (
              <div className="quiz-results-review-section">
                <h3 className="quiz-results-section-title">
                  Questions to Review ({wrongQuestions.length})
                </h3>
                <div className="quiz-results-review-card">
                  <div className="quiz-results-review-message">
                    You missed {wrongQuestions.length} question{wrongQuestions.length !== 1 ? 's' : ''}
                  </div>
                  <div className="quiz-results-review-subtext">
                    Review these questions to improve your understanding
                  </div>
                  <div className="quiz-results-missed-questions">
                    {wrongQuestions.map((question, index) => (
                      <div key={question.id} className="quiz-results-missed-question-item">
                        <span className="quiz-results-question-number">Q{questions.indexOf(question) + 1}:</span>
                        <span className="quiz-results-question-text">{question.prompt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="quiz-results-action-buttons">
              <button 
                className="quiz-create-save-btn"
                onClick={handleReview}
              >
                <FiEye /> Review Answers
              </button>
              <button 
                className="quiz-create-save-btn quiz-retake-btn"
                onClick={handleRetake}
              >
                <FiRotateCcw /> Retake Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizResultsPage; 