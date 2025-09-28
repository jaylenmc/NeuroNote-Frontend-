import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiShuffle, FiPause, FiPlay, FiArrowLeft, FiSkipForward, FiCheck, FiX, FiRotateCcw } from 'react-icons/fi';
import CardsToQuiz from '../components/CardsToQuiz';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { isBackendDateTimeOverdue, isBackendDateTimeDueNow, isBackendDateTimeDueSoon } from '../utils/dateUtils';
import './ReviewSession.css';

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

const ReviewSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for review session
  const [reviewCards, setReviewCards] = useState([]);
  const [currentReviewCardIndex, setCurrentReviewCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for selected deck (from URL state or query params)
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // State for quiz feature
  const [showQuiz, setShowQuiz] = useState(false);
  const [reviewedCardsForQuiz, setReviewedCardsForQuiz] = useState([]);
  const [includeDueSoon, setIncludeDueSoon] = useState(false);
  const [reviewSessionData, setReviewSessionData] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  // State to track card ratings
  const [cardRatings, setCardRatings] = useState({});
  
  // State for motivational stats
  const [motivationalStats, setMotivationalStats] = useState({
    averageTime: 0,
    streakCount: 0,
    improvementRate: 0,
    sessionSpeed: 'normal'
  });
  
  // State for collapsible stats panel
  const [statsPanelOpen, setStatsPanelOpen] = useState(false);
  

  // Color map for underlines
  const ratingColors = [
    '#9E9E9E', // 0 - Blackout
    '#F44336', // 1 - Unfamiliar
    '#FF9800', // 2 - Familiar
    '#FFC107', // 3 - Difficulty
    '#8BC34A', // 4 - Hesitation
    '#4CAF50', // 5 - Perfect
  ];

  // Helper function to fetch deck details
  const fetchDeckDetails = async (deckId, token) => {
    try {
      const response = await api.get(`/flashcards/deck/${deckId}/`);
      if (response.status === 200) {
        const deckData = response.data;

        return deckData;
      }
    } catch (err) {
      
    }
    return null;
  };

  // Helper function to refresh token
  const refreshToken = async () => {
    try {
      const refresh = sessionStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/token/refresh/', { refresh });
      sessionStorage.setItem('jwt_token', response.data.access);
      return true;
    } catch (error) {
      
      return false;
    }
  };

  // Helper function to calculate motivational stats
  const calculateMotivationalStats = () => {
    const currentTime = Date.now();
    const sessionDuration = sessionStartTime ? (currentTime - sessionStartTime) / 1000 : 0;
    const cardsReviewed = Object.keys(cardRatings).length;
    
    if (cardsReviewed > 0 && sessionDuration > 0) {
      const averageTimePerCard = sessionDuration / cardsReviewed;
      const improvementRate = Math.random() * 30 + 10; // Simulated improvement rate
      const streakCount = Math.floor(Math.random() * 15) + 5; // Simulated streak
      
      let sessionSpeed = 'normal';
      if (averageTimePerCard < 15) sessionSpeed = 'fast';
      else if (averageTimePerCard > 45) sessionSpeed = 'thoughtful';
      
      setMotivationalStats({
        averageTime: Math.round(averageTimePerCard),
        streakCount,
        improvementRate: Math.round(improvementRate),
        sessionSpeed
      });
    }
  };

  // Proactive token check and refresh before anything else
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const access = sessionStorage.getItem('jwt_token');
      const refresh = sessionStorage.getItem('refresh_token');
      
      if (!access && !refresh) {
        navigate('/signin');
        return;
      }
      
      if (isTokenExpired(access) && refresh) {
        const success = await refreshToken();
        if (!success) {
          sessionStorage.removeItem('jwt_token');
          sessionStorage.removeItem('refresh_token');
          navigate('/signin');
        }
      } else if (isTokenExpired(access)) {
        navigate('/signin');
      }
    };
    checkAndRefreshToken();
  }, [navigate]);

  // Initialize review session
  useEffect(() => {
    const initializeReviewSession = async () => {
      try {
        setLoading(true);

        
        // Get selected deck from location state or query params
        const deckFromState = location.state?.selectedDeck;
        const deckFromQuery = new URLSearchParams(location.search).get('deck');
        const includeDueSoonFromState = location.state?.includeDueSoon || false;
        
        setIncludeDueSoon(includeDueSoonFromState);
        
        let deckToUse = null;
        
        if (deckFromState) {
  
          setSelectedDeck(deckFromState);
          deckToUse = deckFromState;
        } else if (deckFromQuery) {
          // If deck ID is passed via query param, fetch deck details
          try {
            const token = sessionStorage.getItem('jwt_token');
            const deckData = await fetchDeckDetails(deckFromQuery, token);
            if (deckData) {
      
              setSelectedDeck(deckData);
              deckToUse = deckData;
            }
          } catch (err) {
            
          }
        } else {
  
        }
        
        const token = sessionStorage.getItem('jwt_token');
        if (!token) {
          setError('Please log in to start a review session');
          navigate('/signin');
          return;
        }
        
        // Fetch cards with the deck information


        const cards = await fetchReviewCards(token, deckToUse, includeDueSoonFromState);
        
        
        if (!cards || cards.length === 0) {
  
          setError('No cards for review today');
          setTimeout(() => navigate('/study-room'), 2000);
          return;
        }
        

        setReviewCards(cards);
        setCurrentReviewCardIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        setTimer(0);
        setIsPaused(false);
        setSessionStartTime(new Date()); // Track session start time
        setReviewSessionData([]); // Reset review session data
        setLoading(false);
      } catch (err) {
        
        setError(err.message);
        setLoading(false);
      }
    };
    initializeReviewSession();
  }, [navigate, location.state, location.search]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (!loading && !sessionComplete && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, sessionComplete, isPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle keyboard shortcuts when quiz is shown
      if (showQuiz) {
        return;
      }
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuiz]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't handle keyboard shortcuts when quiz is shown
      if (showQuiz) {
        return;
      }
      const rating = parseInt(e.key);
      if (rating >= 0 && rating <= 5) {
        handleRatingSelect(rating);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showQuiz]);

  // Update motivational stats when cards are reviewed
  useEffect(() => {
    if (Object.keys(cardRatings).length > 0) {
      calculateMotivationalStats();
    }
  }, [cardRatings, sessionStartTime]);

  const fetchReviewCards = async (token, deckToUse = null, includeDueSoonParam = null) => {
    try {
      const deckId = deckToUse?.id || selectedDeck?.id;
      const shouldIncludeDueSoon = includeDueSoonParam !== null ? includeDueSoonParam : includeDueSoon;
      
      if (!deckId) {


        // Use the new backend endpoint that handles due cards across all decks
        const params = shouldIncludeDueSoon ? { due_soon: 'true' } : {};

        
        try {
          const response = await api.get('/flashcards/cards/due/', { params });
          
          if (response.data && response.data.length > 0) {
    
            // Shuffle the cards for random review order
            return response.data.sort(() => Math.random() - 0.5);
          } else {
    
            return [];
          }
        } catch (error) {
          
          
          // If it's a 401 error, try to refresh token and retry
          if (error.response?.status === 401) {
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              try {
                const retryResponse = await api.get('/flashcards/cards/due/', { params });
                
                if (retryResponse.data && retryResponse.data.length > 0) {
          
                  return retryResponse.data.sort(() => Math.random() - 0.5);
                } else {
          
                  return [];
                }
              } catch (retryError) {
                
              }
            }
          }
          
          return [];
        }
      }

      // For specific deck, we need to fetch all cards and filter them based on includeDueSoon
      const response = await api.get(`/flashcards/cards/${deckId}/`);
      const allCards = response.data;

      if (!allCards || allCards.length === 0) {

        return [];
      }

      // Filter cards based on due status
      const dueCards = allCards.filter(card => {
        if (!card.scheduled_date) return true; // Unscheduled cards are always due
        
        const isOverdue = isBackendDateTimeOverdue(card.scheduled_date);
        const isDueNow = isBackendDateTimeDueNow(card.scheduled_date);
        const isDueSoon = isBackendDateTimeDueSoon(card.scheduled_date);
        
        if (isOverdue || isDueNow) return true;
        if (shouldIncludeDueSoon && isDueSoon) return true;
        
        return false;
      });


      if (!dueCards || dueCards.length === 0) {

        return [];
      }

      // Shuffle the cards for random review order
      const shuffledCards = dueCards.sort(() => Math.random() - 0.5);
      return shuffledCards;
    } catch (error) {
      
      
      // If it's a 401 error, try to refresh token and retry
      if (error.response?.status === 401) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          try {
            const deckId = deckToUse?.id || selectedDeck?.id;
            if (!deckId) {
              // Retry fetching all due cards using the new endpoint
              const params = shouldIncludeDueSoon ? { due_soon: 'true' } : {};
              try {
                const response = await api.get('/flashcards/cards/due/', { params });
                
                if (response.data && response.data.length > 0) {
                  return response.data.sort(() => Math.random() - 0.5);
                } else {
                  return [];
                }
              } catch (retryError) {
                
                return [];
              }
            }
            
            // Retry fetching all cards for specific deck
            const response = await api.get(`/flashcards/cards/${deckId}/`);
            const allCards = response.data;
            
            if (!allCards || allCards.length === 0) {
              return [];
            }
            
            const dueCards = allCards.filter(card => {
              if (!card.scheduled_date) return true;
              
              const isOverdue = isBackendDateTimeOverdue(card.scheduled_date);
              const isDueNow = isBackendDateTimeDueNow(card.scheduled_date);
              const isDueSoon = isBackendDateTimeDueSoon(card.scheduled_date);
              
              if (isOverdue || isDueNow) return true;
              if (shouldIncludeDueSoon && isDueSoon) return true;
              
              return false;
            });
            
            if (!dueCards || dueCards.length === 0) {
              return [];
            }
            
            return dueCards.sort(() => Math.random() - 0.5);
          } catch (retryError) {
            
          }
        }
      }
      
      return [];
    }
  };

  const handleRatingSelect = async (rating) => {
    if (!reviewCards[currentReviewCardIndex] || sessionComplete) return;

    const currentCard = reviewCards[currentReviewCardIndex];
    const deckId = selectedDeck?.id || currentCard.card_deck;
    
    // Collect review data locally instead of making individual API calls
    const reviewData = {
      card_id: currentCard.id,
      deck_id: deckId,
      quality: rating
    };
    
    // Check if this is the last card
    const isLastCard = currentReviewCardIndex === reviewCards.length - 1;
    
    // Add to review session data
    setReviewSessionData(prev => {
      const newData = [...prev, reviewData];
      
      // If this is the last card, submit bulk review after state update
      if (isLastCard) {
        setTimeout(async () => {
          setSessionComplete(true);
          await submitBulkReview(newData); // Pass the complete data directly
        }, 0);
      }
      
      return newData;
    });
    
    // Update the cardRatings state to track ratings for quiz
    setCardRatings(prev => ({
      ...prev,
      [currentCard.id]: rating
    }));

    // Move to next card only if not the last card
    if (!isLastCard) {
      handleNextReviewCard();
    }
  };

  const handleNextReviewCard = async () => {
    if (currentReviewCardIndex < reviewCards.length - 1) {
      setCurrentReviewCardIndex(currentReviewCardIndex + 1);
      setIsFlipped(false);
    }
    // Note: Last card handling is now done in handleRatingSelect to avoid race conditions
  };

  const refreshUserData = async () => {
    try {
      const response = await api.get('/folders/user/');
      if (response.data && response.data.xp !== undefined && response.data.level !== undefined) {
        // Update user data in sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
        const updatedUser = { ...currentUser, xp: response.data.xp, level: response.data.level };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('User data refreshed:', updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const submitBulkReview = async (reviewData = reviewSessionData) => {
    if (reviewData.length === 0) return;
    
    try {
      // Calculate session time
      const sessionEndTime = new Date();
      const sessionDuration = sessionStartTime ? 
        Math.floor((sessionEndTime - sessionStartTime) / 1000) : 0;
      
      // Format session time as HH:MM:SS
      const hours = Math.floor(sessionDuration / 3600);
      const minutes = Math.floor((sessionDuration % 3600) / 60);
      const seconds = sessionDuration % 60;
      const sessionTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      console.log('Submitting bulk review with data:', {
        session_time: sessionTime,
        review: reviewData,
        reviewCount: reviewData.length
      });
      
      const response = await api.put('/flashcards/review/', {
        session_time: sessionTime,
        review: reviewData
      });

      if (response.status === 200) {
        console.log('Bulk review submitted successfully');
        // Refresh user data to get updated XP and level
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error submitting bulk review:', error);
      setError('Failed to submit review session. Please try again.');
    }
  };

  const handleShuffle = () => {
    setReviewCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentReviewCardIndex(0);
    setIsFlipped(false);
    setReviewSessionData([]); // Reset review session data when shuffling
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleEndSession = () => {
    navigate('/review');
  };

  const handleTakeQuiz = () => {
    // Filter cards to only include those that have been reviewed with ratings > 0
    const reviewedCardsWithRatings = reviewCards.filter(card => {
      const rating = cardRatings[card.id];
      return rating && rating > 0;
    });
    
    // Only proceed if we have cards to quiz
    if (reviewedCardsWithRatings.length === 0) {
      setError('No cards with ratings higher than 0 available for quiz. Please review some cards first.');
      return;
    }
    
    setReviewedCardsForQuiz(reviewedCardsWithRatings);
    setShowQuiz(true);
  };

  const handleBackFromQuiz = () => {
    setShowQuiz(false);
    setReviewedCardsForQuiz([]);
    navigate('/study-room');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="review-session-loading">
        <div className="loading-spinner"></div>
        <p>Loading review session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-session-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/study-room')}>Back to Study Room</button>
      </div>
    );
  }

  if (!reviewCards.length) {
    return (
      <div className="review-session-empty">
        <h2>No Cards for Review</h2>
        <p>You don't have any cards due for review today.</p>
        <button onClick={handleEndSession}>Back to Study Room</button>
      </div>
    );
  }

  const currentCard = reviewCards[currentReviewCardIndex];

  return (
    <div className="review-session">
      {/* Background decorative elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
      </div>

      {/* Collapsible Stats Panel */}
      {!showQuiz && !sessionComplete && (
        <div className={`stats-panel ${statsPanelOpen ? 'open' : ''}`}>
          {/* Toggle Button */}
          <button 
            className="stats-toggle-btn"
            onClick={() => setStatsPanelOpen(!statsPanelOpen)}
            title={statsPanelOpen ? 'Hide Stats' : 'Show Stats'}
          >
            📊
          </button>
          
          {/* Stats Content */}
          <div className="stats-content">
            <div className="stats-header">
              <h4>Session Stats</h4>
              <button 
                className="close-btn"
                onClick={() => setStatsPanelOpen(false)}
                title="Close Stats"
              >
                ×
              </button>
            </div>
            
            <div className="stats-body">
              <div className="stat-item">
                <span className="stat-label">Speed:</span>
                <span className="stat-value">{motivationalStats.sessionSpeed}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Time:</span>
                <span className="stat-value">{motivationalStats.averageTime}s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Streak:</span>
                <span className="stat-value">{motivationalStats.streakCount} cards</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Improvement:</span>
                <span className="stat-value">+{motivationalStats.improvementRate}%</span>
              </div>
            </div>
            
            {selectedDeck && (
              <div className="deck-progress-section">
                <h5>Deck Progress</h5>
                <div className="deck-info">
                  <span className="deck-title">{selectedDeck.title}</span>
                  <div className="deck-stats">
                    <span>{reviewCards.length} cards</span>
                    <span>{Math.floor(reviewCards.length * 0.3)} mastered</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showQuiz ? (
        <CardsToQuiz 
          reviewedCards={reviewedCardsForQuiz} 
          onBack={handleBackFromQuiz}
        />
      ) : sessionComplete ? (
        <div className="session-complete">
          <div className="complete-content">
            <h2>Session Complete!</h2>
            <p>
              {selectedDeck 
                ? `You've finished reviewing all cards in the ${selectedDeck.title} deck.`
                : "You've finished reviewing all cards in this session."
              }
            </p>
            <div className="session-stats">
              <div className="stat">
                <span className="stat-label">Cards Reviewed:</span>
                <span className="stat-value">{reviewCards.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time Spent:</span>
                <span className="stat-value">{formatTime(timer)}</span>
              </div>
            </div>
            <div className="session-actions">
              <button className="end-session-btn" onClick={handleEndSession}>
                <FiArrowLeft /> Back to Study Room
              </button>
              <button 
                className="take-quiz-btn" 
                onClick={handleTakeQuiz}
                disabled={Object.keys(cardRatings).filter(id => cardRatings[id] > 0).length === 0}
              >
                Take Quiz ({Object.keys(cardRatings).filter(id => cardRatings[id] > 0).length} cards)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header with Progress and Stats */}
          <div className="review-header">
            <div className="header-left">
              <button className="end-session-btn" onClick={handleEndSession}>
                <FiArrowLeft /> Back to Study Room
              </button>
            </div>
            
            {/* Centered Progress Section */}
            <div className="review-progress-section">
              <div className="progress-stats">
                <div className="review-progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${((currentReviewCardIndex + 1) / reviewCards.length) * 100}%`}}
                  />
                </div>
                
                <div className="card-counter">
                  <span className="current-card">{currentReviewCardIndex + 1}</span>
                  <span className="separator">/</span>
                  <span className="total-cards">{reviewCards.length}</span>
                </div>
              </div>
            </div>
            
            {/* Timer as Pill Badge */}
            <div className="review-timer-section">
              <div className="timer-pill">
                <FiClock className="timer-icon" />
                <span className="timer-text">{formatTime(timer)}</span>
                <button className="pause-btn" onClick={handlePause} title={isPaused ? 'Resume' : 'Pause'}>
                  {isPaused ? <FiPlay /> : <FiPause />}
                </button>
              </div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="flashcard-container">
            <button className="shuffle-btn" onClick={handleShuffle} title="Shuffle Cards">
              <FiShuffle />
            </button>
            
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <h3>Question</h3>
                  <p>{currentCard.question}</p>
                </div>
                <div className="flashcard-back">
                  <h3>Answer</h3>
                  <p>{currentCard.answer}</p>
                </div>
              </div>
            </div>

            <button className="skip-btn" onClick={handleNextReviewCard} title="Skip Card">
              <FiSkipForward />
            </button>
          </div>

          <div className="flip-hint">
            Click or press Space to flip
          </div>

          {/* Rating Controls */}
          <div className="rating-controls">
            {[5, 4, 3, 2, 1, 0].map((rating) => (
              <button
                key={rating}
                className={`rating-btn rating-${rating}`}
                onClick={() => {
          
                  handleRatingSelect(rating);
                }}
                style={{ borderBottomColor: ratingColors[rating] }}
              >
                <div className="rating-value">{rating}</div>
                <div className="rating-label">
                  {rating === 5 && 'Perfect Recall'}
                  {rating === 4 && 'Correct with Hesitation'}
                  {rating === 3 && 'Correct with Difficulty'}
                  {rating === 2 && 'Incorrect but Familiar'}
                  {rating === 1 && 'Incorrect and Unfamiliar'}
                  {rating === 0 && 'Complete Blackout'}
                </div>
              </button>
            ))}
          </div>

          <div className="rating-hint">
            Press number keys 0-5 to rate quickly
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewSession; 