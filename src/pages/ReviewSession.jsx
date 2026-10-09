import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Confetti from 'react-confetti';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShuffle, FiArrowLeft, FiSkipForward, FiCheck, FiX, FiSend, FiEye, FiEyeOff, FiChevronDown, FiLayers } from 'react-icons/fi';
import { FaBrain, FaGraduationCap, FaPause, FaPlay } from 'react-icons/fa';
import CardsToQuiz from '../components/CardsToQuiz';
import FeedbackLoopSession from '../components/FeedbackLoopSession';
import ProblemSolvingSession from '../components/ProblemSolvingSession';
import PatternRecognitionSession from '../components/PatternRecognitionSession';
import { useNotification } from '../contexts/NotificationContext';
import api from '../api/axios';
import { getCurrentStudyQueue, getStudyQueue, submitReview, getApiErrorMessage } from '../api/studyQueueApi';
import { getBucketInfo, bucketKeyFromRating, RATING_OPTIONS, BLACKLISTED_LABEL } from '../utils/buckets';
import './ReviewSession.css';
import '../components/SessionTypeStyles.css';
import '../components/FlashcardsNightOwl.css';

const DEFAULT_STUDY_METHOD = { id: 'recall-retention', title: 'Recall + Retention' };
const TIMED_OUT_RATING = 1;

const tutorStyles = {
  strict: { label: 'Strict', description: 'No-nonsense tutor who challenges you' },
  friendly: { label: 'Friendly', description: 'Warm, casual tutor who explains gently' },
  professional: { label: 'Professional', description: 'Polished, classroom-style instructor' },
  speed_run: { label: 'Speed Run', description: 'Fast-paced, optimized explanations' },
  socratic: { label: 'Socratic', description: 'Question-driven tutor that guides you' },
  supportive: { label: 'Supportive', description: 'Motivational guide who reassures you' }
};

const layerDescriptions = {
  1: { label: 'Layer 1', description: 'Recognition: You must identify what the question refers to when prompted, without needing detail, structure, or justification.' },
  2: { label: 'Layer 2', description: 'Structure: You must explain the essential parts or rules that make the concept what it is.' },
  3: { label: 'Layer 3', description: 'Implication: You must reason about what follows from the concept being true — consequences, effects, or constraints.' }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ReviewSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const [reviewCards, setReviewCards] = useState([]);
  const [currentReviewCardIndex, setCurrentReviewCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showCompleteConfetti, setShowCompleteConfetti] = useState(false);
  const [confettiDims, setConfettiDims] = useState(() =>
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1200, height: 800 }
  );
  const sessionCompleteAudioPlayedRef = useRef(false);
  const [timer, setTimer] = useState(0);
  const [timerLimit, setTimerLimit] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedStudyMethod, setSelectedStudyMethod] = useState(DEFAULT_STUDY_METHOD);
  const [studyGroupId, setStudyGroupId] = useState(null);

  const [showQuiz, setShowQuiz] = useState(false);
  const [reviewedCardsForQuiz, setReviewedCardsForQuiz] = useState([]);

  // cardId -> bucket rating (1-4)
  const [cardRatings, setCardRatings] = useState({});
  const ratingsRef = useRef({});
  const finishedRef = useRef(false);
  const [bucketChanges, setBucketChanges] = useState([]);
  const [timedOutCount, setTimedOutCount] = useState(0);

  const [motivationalStats, setMotivationalStats] = useState({
    averageTime: 0,
    streakCount: 0,
    improvementRate: 0,
    sessionSpeed: 'normal'
  });

  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [, setCurrentAttempts] = useState(0);

  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiConversation, setAiConversation] = useState([]);

  const [showTutorStyle, setShowTutorStyle] = useState(false);
  const [tutorStyle, setTutorStyle] = useState('socratic');
  const [currentLayer, setCurrentLayer] = useState(1);
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);

  const isStudyQueueSession = selectedStudyMethod.id === 'recall-retention';
  const currentCard = reviewCards[currentReviewCardIndex];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTutorStyle && !event.target.closest('.control-toggle-group')) {
        setShowTutorStyle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTutorStyle]);

  useEffect(() => {
    if (selectedStudyMethod.id === 'doing-feedback') {
      setCurrentLayer(1);
    }
  }, [currentReviewCardIndex, selectedStudyMethod.id]);

  useEffect(() => {
    document.documentElement.classList.add('nightowl-root-bg');
    document.body.classList.add('nightowl-root-bg');
    return () => {
      document.documentElement.classList.remove('nightowl-root-bg');
      document.body.classList.remove('nightowl-root-bg');
    };
  }, []);

  useEffect(() => {
    if (!showLayerDropdown) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowLayerDropdown(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [showLayerDropdown]);

  // Load cards: the Study Queue for Recall + Retention, otherwise the selected deck (or all cards).
  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      const state = location.state || {};
      const method = state.selectedStudyMethod || DEFAULT_STUDY_METHOD;
      setSelectedStudyMethod(method);
      setSelectedDeck(state.selectedDeck || null);

      try {
        let cards;
        if (method.id === 'recall-retention') {
          const queue = state.studyGroupId
            ? await getStudyQueue(state.studyGroupId)
            : await getCurrentStudyQueue();
          if (cancelled) return;
          if (!queue) {
            setError('You have no active Study Queue. Generate one from the Review page.');
            return;
          }
          cards = queue.cards.filter((card) => card.slot_label !== BLACKLISTED_LABEL);
          if (cards.length === 0) {
            setError('Every card in your Study Queue was reviewed recently. Check back within the hour.');
            return;
          }
          setStudyGroupId(queue.id);
          setTimerLimit(queue.is_timed && queue.timer_seconds ? queue.timer_seconds : null);
        } else {
          const deckId = state.selectedDeck?.id;
          const response = await api.get(deckId ? `/flashcards/cards/${deckId}/` : '/flashcards/cards/');
          if (cancelled) return;
          cards = Array.isArray(response.data) ? response.data : [];
        }

        setReviewCards([...cards].sort(() => Math.random() - 0.5));
        setCurrentReviewCardIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        setTimer(0);
        setIsPaused(false);
        ratingsRef.current = {};
        finishedRef.current = false;
        setCardRatings({});
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load your review session'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  useEffect(() => {
    if (loading || error || sessionComplete || isPaused) return undefined;
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [loading, error, sessionComplete, isPaused]);

  useEffect(() => {
    if (!sessionComplete) {
      sessionCompleteAudioPlayedRef.current = false;
      setShowCompleteConfetti(false);
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    setConfettiDims({ width: window.innerWidth, height: window.innerHeight });
    setShowCompleteConfetti(true);

    if (!sessionCompleteAudioPlayedRef.current) {
      sessionCompleteAudioPlayedRef.current = true;
      try {
        const audio = new Audio('/sounds/pass.wav');
        audio.volume = 0.65;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } catch {
        /* ignore missing audio */
      }
    }

    const hideTimer = setTimeout(() => setShowCompleteConfetti(false), 4500);
    return () => clearTimeout(hideTimer);
  }, [sessionComplete]);

  useEffect(() => {
    if (!showCompleteConfetti) return;
    const onResize = () =>
      setConfettiDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [showCompleteConfetti]);

  useEffect(() => {
    const cardsReviewed = Object.keys(cardRatings).length;
    if (cardsReviewed === 0 || timer === 0) return;
    const averageTimePerCard = timer / cardsReviewed;
    let sessionSpeed = 'normal';
    if (averageTimePerCard < 15) sessionSpeed = 'fast';
    else if (averageTimePerCard > 45) sessionSpeed = 'thoughtful';
    setMotivationalStats((prev) => ({ ...prev, averageTime: Math.round(averageTimePerCard), sessionSpeed }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardRatings]);

  useEffect(() => {
    if (showAIAssistant) {
      document.body.classList.add('ai-panel-open');
    } else {
      document.body.classList.remove('ai-panel-open');
    }
    return () => document.body.classList.remove('ai-panel-open');
  }, [showAIAssistant]);

  const refreshUserData = async () => {
    try {
      const response = await api.get('/folders/user/');
      if (response.data && response.data.xp !== undefined && response.data.level !== undefined) {
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
        sessionStorage.setItem('user', JSON.stringify({ ...currentUser, xp: response.data.xp, level: response.data.level }));
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const finishSession = async ({ timedOut = false } = {}) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const ratings = ratingsRef.current;
    const review = reviewCards
      .filter((card) => ratings[card.id])
      .map((card) => ({
        card_id: card.id,
        deck_id: card.card_deck ?? selectedDeck?.id,
        bucket: ratings[card.id],
      }));
    const timedOutCards = timedOut ? reviewCards.filter((card) => !ratings[card.id]) : [];

    setBucketChanges(
      reviewCards
        .map((card) => {
          const rating = ratings[card.id] ?? (timedOutCards.includes(card) ? TIMED_OUT_RATING : null);
          if (!rating) return null;
          return { id: card.id, question: card.question, from: card.bucket || 'bkt_0', to: bucketKeyFromRating(rating) };
        })
        .filter(Boolean)
    );
    setTimedOutCount(timedOutCards.length);
    setSessionComplete(true);

    if (review.length === 0 && timedOutCards.length === 0) return;

    try {
      await submitReview({
        sessionSeconds: timer,
        review,
        studyGroupId: isStudyQueueSession ? studyGroupId : null,
        timedOutCardIds: timedOutCards.map((card) => card.id),
      });
      showNotification('Study session saved', 'success');
      await refreshUserData();
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Failed to submit review session'), 'error');
    }
  };

  // The timer closure needs the latest finishSession.
  const finishSessionRef = useRef(finishSession);
  finishSessionRef.current = finishSession;

  useEffect(() => {
    if (timerLimit && timer >= timerLimit && !sessionComplete) {
      showNotification("Time's up! Unrated cards were marked Complete Struggle.");
      finishSessionRef.current({ timedOut: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, timerLimit, sessionComplete]);

  const triggerFloatingEmoji = (rating) => {
    if (rating < 3) return;
    const newEmoji = { id: Date.now(), rating };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((emoji) => emoji.id !== newEmoji.id));
    }, 1200);
  };

  const advanceToNextCard = () => {
    if (currentReviewCardIndex < reviewCards.length - 1) {
      setCurrentReviewCardIndex(currentReviewCardIndex + 1);
      setIsFlipped(false);
      setCurrentAttempts(0);
    } else {
      finishSession();
    }
  };

  const handleRatingSelect = (rating) => {
    if (!currentCard || sessionComplete) return;
    const bucket = Math.min(4, Math.max(1, rating));
    ratingsRef.current = { ...ratingsRef.current, [currentCard.id]: bucket };
    setCardRatings(ratingsRef.current);
    triggerFloatingEmoji(bucket);
    advanceToNextCard();
  };

  const ratingHandlerRef = useRef(handleRatingSelect);
  ratingHandlerRef.current = handleRatingSelect;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showQuiz || sessionComplete) return;
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
        return;
      }

      if (!isStudyQueueSession) return;
      const rating = Number(e.key);
      if (RATING_OPTIONS.some((option) => option.value === rating)) {
        ratingHandlerRef.current(rating);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuiz, sessionComplete, isStudyQueueSession]);

  const handleShuffle = () => {
    setReviewCards((prev) => [
      ...prev.slice(0, currentReviewCardIndex),
      ...prev.slice(currentReviewCardIndex).sort(() => Math.random() - 0.5),
    ]);
    setIsFlipped(false);
  };

  const handleEndSession = () => {
    navigate('/review');
  };

  const ratedCardCount = Object.keys(cardRatings).length;

  const handleTakeQuiz = () => {
    const ratedCards = reviewCards.filter((card) => cardRatings[card.id]);
    if (ratedCards.length === 0) {
      showNotification('Rate some cards before taking a quiz.', 'error');
      return;
    }
    setReviewedCardsForQuiz(ratedCards);
    setShowQuiz(true);
  };

  const handleBackFromQuiz = () => {
    setShowQuiz(false);
    setReviewedCardsForQuiz([]);
    navigate('/study-room');
  };

  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;

    const newConversation = [
      ...aiConversation,
      { type: 'user', text: aiQuestion, timestamp: new Date().toLocaleTimeString() }
    ];

    const aiResponses = [
      "Great question! Let me break this down for you. The key concept here is about understanding the relationship between the components. Think of it like building blocks where each part supports the next.",
      "That's an interesting angle to explore! This concept connects to several other areas. The main thing to remember is the fundamental principle behind it.",
      "Good thinking! To answer that, consider the context: this is particularly important because it forms the foundation for more advanced topics.",
      "Excellent question! Let's think about this step by step: First, understand the basic definition. Then, consider how it applies in practice. Finally, connect it to what you already know."
    ];

    setAiConversation([
      ...newConversation,
      {
        type: 'ai',
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setAiQuestion('');
  };

  const renderSessionType = () => {
    const sessionProps = {
      currentCard,
      onRatingSelect: handleRatingSelect,
      isFlipped,
      setIsFlipped,
      sessionStats: motivationalStats,
      onAttemptChange: setCurrentAttempts,
      nextCard: reviewCards[currentReviewCardIndex + 1] || null,
      showNotification,
      onShuffle: handleShuffle,
      tutorStyle,
      setTutorStyle,
      currentLayer,
      setCurrentLayer
    };

    switch (selectedStudyMethod.id) {
      case 'doing-feedback':
        return <FeedbackLoopSession {...sessionProps} />;
      case 'understanding-problem-solving':
        return <ProblemSolvingSession {...sessionProps} />;
      case 'pattern-recognition':
        return <PatternRecognitionSession {...sessionProps} />;
      default:
        return null;
    }
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
        <h2>Nothing to review</h2>
        <p>{error}</p>
        <button onClick={handleEndSession}>Back to Review</button>
      </div>
    );
  }

  if (!reviewCards.length) {
    return (
      <div className="review-session-empty">
        <h2>No Cards for Review</h2>
        <p>There are no cards to review here yet.</p>
        <button onClick={handleEndSession}>Back to Review</button>
      </div>
    );
  }

  const remainingSeconds = timerLimit ? Math.max(0, timerLimit - timer) : null;
  const currentBucket = getBucketInfo(currentCard?.bucket);

  return (
    <div className="review-session">
      {sessionComplete &&
        showCompleteConfetti &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <div className="session-complete-confetti" aria-hidden>
            <Confetti
              width={confettiDims.width}
              height={confettiDims.height}
              numberOfPieces={240}
              gravity={0.32}
              initialVelocityY={14}
              recycle={false}
              run={showCompleteConfetti}
            />
          </div>,
          document.body
        )}

      {showQuiz && selectedStudyMethod.id !== 'doing-feedback' ? (
        <CardsToQuiz
          reviewedCards={reviewedCardsForQuiz}
          onBack={handleBackFromQuiz}
        />
      ) : sessionComplete ? (
        <div className="session-complete-page">
          <div className="session-complete">
            <div className="complete-content">
              <h2>Session Complete!</h2>
              <p>
                {isStudyQueueSession
                  ? "You've finished this Study Queue session."
                  : selectedDeck
                    ? `You've finished reviewing the ${selectedDeck.title} deck.`
                    : "You've finished reviewing all cards in this session."}
              </p>
              <div className="session-stats">
                <div className="stat">
                  <span className="stat-label">Cards Reviewed:</span>
                  <span className="stat-value">{ratedCardCount}</span>
                </div>
                {timedOutCount > 0 && (
                  <div className="stat">
                    <span className="stat-label">Timed Out:</span>
                    <span className="stat-value">{timedOutCount}</span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-label">Time Spent:</span>
                  <span className="stat-value">{formatTime(timer)}</span>
                </div>
              </div>
            </div>
          </div>

          {bucketChanges.length > 0 && (
            <div className="session-complete-status-section">
              <h3 className="session-complete-status-heading">Bucket changes this session</h3>
              <p className="session-complete-status-sub">
                {isStudyQueueSession
                  ? 'Cards rated Poor, Good, or Easy are blacklisted from your Study Queue for the next hour.'
                  : 'Where each card you rated landed.'}
              </p>
              <div className="session-complete-cards-grid">
                {bucketChanges.map((row) => {
                  const toBucket = getBucketInfo(row.to);
                  return (
                  <div key={row.id} className="session-complete-mini-card">
                    <span
                      className="session-complete-status-dot"
                      style={{ backgroundColor: toBucket.color }}
                      title={toBucket.label}
                      aria-hidden="true"
                    />
                    <div className="session-complete-mini-card-inner">
                      <div className="session-complete-mini-card-label">Question</div>
                      <div className="session-complete-mini-card-text">{row.question}</div>
                      <div className="session-complete-status-shift">
                        <span
                          className="session-complete-status-pill session-complete-status-pill--from"
                          data-status={row.from}
                        >
                          {getBucketInfo(row.from).label}
                        </span>
                        <span className="session-complete-status-arrow" aria-hidden>
                          →
                        </span>
                        <span
                          className="session-complete-status-pill session-complete-status-pill--to"
                          data-status={row.to}
                        >
                          {getBucketInfo(row.to).label}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="session-actions session-complete-page-actions">
            <button className="end-session-btn" onClick={handleEndSession}>
              Back to Review
            </button>
            {selectedStudyMethod.id !== 'doing-feedback' && (
              <button
                className="take-quiz-btn"
                onClick={handleTakeQuiz}
                disabled={ratedCardCount === 0}
              >
                Take Quiz ({ratedCardCount} cards)
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="review-header-flashcards">
            <div className="header-left">
              <button className="end-session-btn" onClick={handleEndSession}>
                <FiArrowLeft /> Back to Review
              </button>
            </div>

            <div className="header-center-layer">
              {selectedStudyMethod.id === 'doing-feedback' && (
                <div className="layer-toggle-group">
                  <button
                    type="button"
                    className="layer-indicator-pill"
                    aria-expanded={showLayerDropdown}
                    aria-haspopup="dialog"
                    aria-controls="layer-feedback-popup"
                    onClick={() => setShowLayerDropdown((v) => !v)}
                  >
                    <FiLayers className="layer-icon" />
                    <span className="layer-label">{layerDescriptions[currentLayer]?.label}</span>
                    <FiChevronDown className="layer-popup-chevron" aria-hidden />
                  </button>
                  {showLayerDropdown && (
                    <>
                      <div
                        className="layer-popup-backdrop"
                        aria-hidden
                        onClick={() => setShowLayerDropdown(false)}
                      />
                      <div
                        id="layer-feedback-popup"
                        className="layer-popup"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="layer-popup-title"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="layer-popup-inner">
                          <div className="layer-popup-header">
                            <div>
                              <h2 id="layer-popup-title" className="layer-popup-title">
                                Feedback layers
                              </h2>
                              <p className="layer-popup-subtitle">
                                How the session advances your understanding at each stage.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="layer-popup-close"
                              aria-label="Close layer info"
                              onClick={() => setShowLayerDropdown(false)}
                            >
                              <FiX size={20} />
                            </button>
                          </div>
                          <div className="layer-popup-body">
                            {Object.entries(layerDescriptions).map(([key, { label, description }]) => {
                              const layerNum = parseInt(key, 10);
                              return (
                                <div
                                  key={key}
                                  className={`layer-option ${currentLayer === layerNum ? 'selected' : ''}`}
                                >
                                  <div className="layer-option-content">
                                    <div className="layer-option-label">
                                      {label}
                                      {currentLayer === layerNum && (
                                        <FiCheck className="layer-check-icon" />
                                      )}
                                    </div>
                                    <div className="layer-option-description">{description}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="progress-counter-pill">
                <span className="progress-counter-text">
                  {currentReviewCardIndex + 1}/{reviewCards.length}
                </span>
              </div>
            </div>

            <div className="header-right-controls">
              <div
                className={`timer-display-pill${remainingSeconds !== null && remainingSeconds <= 60 ? ' timer-warning' : ''}`}
                title={timerLimit ? 'Time remaining' : 'Time elapsed'}
              >
                <span className="timer-text">
                  {formatTime(remainingSeconds !== null ? remainingSeconds : timer)}
                </span>
                <button className="pause-btn" onClick={() => setIsPaused((prev) => !prev)} title={isPaused ? 'Resume' : 'Pause'}>
                  {isPaused ? <FaPlay /> : <FaPause />}
                </button>
              </div>

              {selectedStudyMethod.id === 'doing-feedback' && (
                <div className="control-toggle-group">
                  <button
                    className={`control-toggle-btn ${showTutorStyle ? 'active' : ''}`}
                    onClick={() => setShowTutorStyle(!showTutorStyle)}
                    title={showTutorStyle ? 'Hide Tutor Style' : 'Show Tutor Style'}
                  >
                    <FaGraduationCap />
                    <span>{tutorStyles[tutorStyle]?.label || 'Tutor'}</span>
                  </button>
                  {showTutorStyle && (
                    <div className="tutor-style-dropdown">
                      <div className="tutor-style-menu">
                        {[
                          ['socratic', tutorStyles.socratic],
                          ...Object.entries(tutorStyles).filter(([key]) => key !== 'socratic'),
                        ].map(([key, { label, description }]) => (
                          <div
                            key={key}
                            className={`tutor-style-option ${tutorStyle === key ? 'selected' : ''}`}
                            onClick={() => {
                              setTutorStyle(key);
                              setShowTutorStyle(false);
                            }}
                          >
                            <div className="tutor-style-option-content">
                              <div className="tutor-style-option-label">{label}</div>
                              <div className="tutor-style-option-description">{description}</div>
                            </div>
                            {tutorStyle === key && (
                              <FiCheck className="tutor-style-check-icon" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {renderSessionType() || (
            <>
              <div className={`flashcard-with-ai-container ${showAIAssistant ? 'ai-visible' : ''}`}>
                <div className="flashcard-section">
                  <div className="flashcard-container">
                    <button className="shuffle-btn" onClick={handleShuffle} title="Shuffle Remaining Cards">
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
                          <div className="learning-status-badge" title={currentBucket.description}>
                            <span
                              className="status-text"
                              style={{
                                color: currentBucket.color,
                                backgroundColor: `${currentBucket.color}1f`,
                                padding: '6px 12px',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              {currentBucket.label}
                            </span>
                          </div>
                          <h3>Question</h3>
                          <p>{currentCard.question}</p>
                        </div>
                        <div className="flashcard-back">
                          <h3>Answer</h3>
                          <p>{currentCard.answer}</p>
                        </div>
                      </div>
                    </div>

                    <button className="skip-btn" onClick={advanceToNextCard} title="Skip Card">
                      <FiSkipForward />
                    </button>
                  </div>
                </div>

                {showAIAssistant && (
                  <div className="ai-assistant-panel">
                    <div className="ai-panel-header">
                      <div className="ai-header-title">
                        <FaBrain className="ai-header-icon" />
                        <h3>NeuroNote</h3>
                      </div>
                      <button
                        className="close-ai-panel"
                        onClick={() => setShowAIAssistant(false)}
                      >
                        <FiX />
                      </button>
                    </div>

                    <div className="ai-panel-content">
                      <div className="ai-conversation-scrollable">
                        {aiConversation.length > 0 && (
                          <div className="ai-conversation-history">
                            <div className="conversation-messages">
                              {aiConversation.map((message, idx) => (
                                <div key={idx} className={`message ${message.type}`}>
                                  <div className="message-content">{message.text}</div>
                                  <div className="message-time">{message.timestamp}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ai-question-section">
                        <h5>Ask AI a Question</h5>
                        <div className="ai-question-input-group">
                          <input
                            type="text"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                            placeholder="Ask anything about this card..."
                            className="ai-question-input"
                          />
                          <button
                            onClick={handleAskAI}
                            className="ai-send-btn"
                            disabled={!aiQuestion.trim()}
                          >
                            <FiSend />
                          </button>
                        </div>
                        <div className="ai-question-suggestions">
                          <button onClick={() => setAiQuestion("Can you explain this in simpler terms?")}>
                            Simplify this
                          </button>
                          <button onClick={() => setAiQuestion("What's a real-world example?")}>
                            Real example
                          </button>
                          <button onClick={() => setAiQuestion("How does this relate to other concepts?")}>
                            Show connections
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rating-controls">
                {RATING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`rating-btn rating-${option.value}`}
                    onClick={() => handleRatingSelect(option.value)}
                    style={{ '--rating-accent': option.color }}
                    title={option.description}
                  >
                    <div className="rating-value">{option.value}</div>
                    <div className="rating-label">{option.label}</div>
                  </button>
                ))}
              </div>

              {floatingEmojis.map((emoji) => (
                <div key={emoji.id} className="review-session-floating-emoji">
                  <span className="review-session-emoji-icon">🎉</span>
                  <span className="review-session-emoji-text">+5</span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewSession;
