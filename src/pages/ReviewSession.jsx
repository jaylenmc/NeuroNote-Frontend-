import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Confetti from 'react-confetti';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiShuffle, FiArrowLeft, FiSkipForward, FiCheck, FiX, FiRotateCcw, FiZap, FiSend, FiCpu, FiEye, FiEyeOff, FiSettings, FiChevronDown, FiCheck as FiCheckIcon, FiLayers } from 'react-icons/fi';
import { FaBrain, FaGraduationCap, FaPause, FaPlay } from 'react-icons/fa';
import CardsToQuiz from '../components/CardsToQuiz';
import FeedbackLoopSession from '../components/FeedbackLoopSession';
import ProblemSolvingSession from '../components/ProblemSolvingSession';
import PatternRecognitionSession from '../components/PatternRecognitionSession';
import { useNotification } from '../contexts/NotificationContext';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { isBackendDateTimeOverdue, isBackendDateTimeDueNow, isBackendDateTimeDueSoon } from '../utils/dateUtils';
import './ReviewSession.css';
import '../components/SessionTypeStyles.css';
import '../components/FlashcardsNightOwl.css';

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

const LEARNING_STATUS_LABELS = {
  mstrd: 'Mastered',
  strgl: 'Struggling',
  unseen: 'Unseen',
  imprv: 'In progress',
};

/** Placeholder — swap for API payload of cards whose status changed this session */
const MOCK_SESSION_STATUS_CHANGES = [
  {
    id: 'mock-1',
    questionPreview: 'What is the role of the hippocampus in memory consolidation?',
    fromStatus: 'strgl',
    toStatus: 'imprv',
  },
  {
    id: 'mock-2',
    questionPreview: 'Define homeostasis and give one example from physiology.',
    fromStatus: 'imprv',
    toStatus: 'mstrd',
  },
  {
    id: 'mock-3',
    questionPreview: 'Compare and contrast mitosis and meiosis.',
    fromStatus: 'unseen',
    toStatus: 'imprv',
  },
];

const ReviewSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  
  // State for review session
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
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for selected deck (from URL state or query params)
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // State for selected study method
  const [selectedStudyMethod, setSelectedStudyMethod] = useState(null);
  
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
  
  // State for floating emoji animations
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  
  // State for attempt counter (for feedback loop sessions)
  const [currentAttempts, setCurrentAttempts] = useState(0);
  
  // State for AI assistant
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiConversation, setAiConversation] = useState([]);

  // State for tutor style toggle
  const [showTutorStyle, setShowTutorStyle] = useState(false);
  const [tutorStyle, setTutorStyle] = useState('socratic'); // strict, friendly, professional, speed_run, socratic, supportive
  const [currentLayer, setCurrentLayer] = useState(1); // 1, 2, or 3 for doing-feedback method
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);

  // Tutor style descriptions
  const tutorStyles = {
    strict: { label: 'Strict', description: 'No-nonsense tutor who challenges you' },
    friendly: { label: 'Friendly', description: 'Warm, casual tutor who explains gently' },
    professional: { label: 'Professional', description: 'Polished, classroom-style instructor' },
    speed_run: { label: 'Speed Run', description: 'Fast-paced, optimized explanations' },
    socratic: { label: 'Socratic', description: 'Question-driven tutor that guides you' },
    supportive: { label: 'Supportive', description: 'Motivational guide who reassures you' }
  };

  // Layer descriptions for doing-feedback method
  const layerDescriptions = {
    1: { label: 'Layer 1', description: 'Recognition: You must identify what the question refers to when prompted, without needing detail, structure, or justification.' },
    2: { label: 'Layer 2', description: 'Structure: You must explain the essential parts or rules that make the concept what it is.' },
    3: { label: 'Layer 3', description: 'Implication: You must reason about what follows from the concept being true — consequences, effects, or constraints.' }
  };

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

  // Close tutor style dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTutorStyle && !event.target.closest('.control-toggle-group')) {
        setShowTutorStyle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTutorStyle]);

  // Reset layer when card changes (only for doing-feedback method)
  useEffect(() => {
    if (selectedStudyMethod?.id === 'doing-feedback' && currentReviewCardIndex >= 0 && reviewCards.length > 0) {
      const currentCard = reviewCards[currentReviewCardIndex];
      if (currentCard) {
        setCurrentLayer(1);
      }
    }
  }, [currentReviewCardIndex, selectedStudyMethod?.id]);

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

  // Apply Night Owl theme
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

  // Initialize review session
  useEffect(() => {
    const initializeReviewSession = async () => {
      try {
        setLoading(true);

        
        // Get selected deck from location state or query params
        const deckFromState = location.state?.selectedDeck;
        const deckFromQuery = new URLSearchParams(location.search).get('deck');
        const includeDueSoonFromState = location.state?.includeDueSoon || false;
        const studyMethodFromState = location.state?.selectedStudyMethod;
        
        setIncludeDueSoon(includeDueSoonFromState);
        setSelectedStudyMethod(studyMethodFromState);
        
        console.log('Initializing review session with:');
        console.log('- selectedStudyMethod:', studyMethodFromState);
        console.log('- selectedDeck:', deckFromState);
        console.log('- includeDueSoon:', includeDueSoonFromState);
        
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

  // Confetti + success sound when session complete screen is shown (audio once; confetti ok under Strict Mode)
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
      } catch (_) {
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle keyboard shortcuts when quiz is shown
      if (showQuiz) {
        return;
      }
      
      // Don't handle spacebar when typing in textarea or input
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
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
      
      // Don't handle number keys when typing in textarea or input
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
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

  // Prevent body scroll when AI panel is open
  useEffect(() => {
    if (showAIAssistant) {
      document.body.classList.add('ai-panel-open');
    } else {
      document.body.classList.remove('ai-panel-open');
    }

    return () => {
      document.body.classList.remove('ai-panel-open');
    };
  }, [showAIAssistant]);

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

  // Function to play success sound
  const playReviewSessionSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Create a celebratory fanfare sound with multiple tones
      // First note - C5
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain1.gain.linearRampToValueAtTime(0, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      // Second note - E5 (after slight delay)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
      gain2.gain.setValueAtTime(0, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      // Third note - G5 (completes the chord)
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.1); // G5
      gain3.gain.setValueAtTime(0, now + 0.1);
      gain3.gain.linearRampToValueAtTime(0.15, now + 0.15);
      gain3.gain.linearRampToValueAtTime(0, now + 0.4);
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      
      // High triumphant note - C6
      const osc4 = audioContext.createOscillator();
      const gain4 = audioContext.createGain();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(1046.50, now + 0.2); // C6
      gain4.gain.setValueAtTime(0, now + 0.2);
      gain4.gain.linearRampToValueAtTime(0.2, now + 0.25);
      gain4.gain.linearRampToValueAtTime(0, now + 0.5);
      osc4.connect(gain4);
      gain4.connect(audioContext.destination);
      
      // Start all oscillators
      osc1.start(now);
      osc2.start(now + 0.05);
      osc3.start(now + 0.1);
      osc4.start(now + 0.2);
      
      // Stop all oscillators
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.35);
      osc3.stop(now + 0.4);
      osc4.stop(now + 0.5);
    } catch (error) {
      // Silently fail if audio context is not available
    }
  };

  // Function to trigger floating emoji animation
  const triggerFloatingEmoji = (rating) => {
    // Only show for ratings above 2 (3, 4, 5)
    if (rating > 2) {
      const newEmoji = {
        id: Date.now(),
        rating
      };
      setFloatingEmojis(prev => [...prev, newEmoji]);
      
      // Play success sound
      playReviewSessionSuccessSound();
      
      // Remove the emoji after animation completes
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(emoji => emoji.id !== newEmoji.id));
      }, 1200);
    }
  };

  const handleRatingSelect = async (rating) => {
    if (!reviewCards[currentReviewCardIndex] || sessionComplete) return;

    const currentCard = reviewCards[currentReviewCardIndex];
    const deckId = selectedDeck?.id || currentCard.card_deck;
    
    // Trigger floating emoji animation for ratings above 2
    triggerFloatingEmoji(rating);
    
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
      setCurrentAttempts(0); // Reset attempts for new card
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

  // Generate AI Summary for current card
  const generateAISummary = () => {
    // Mock AI summary based on card content
    return {
      keyPoints: [
        'Core concept: ' + currentCard.question.substring(0, 50) + '...',
        'This relates to fundamental principles in the subject',
        'Remember to connect this with related topics'
      ],
      breakdown: {
        what: 'This card covers a key concept that builds foundational understanding',
        why: 'Understanding this helps you grasp more advanced topics later',
        how: 'Break it down into smaller parts and connect to real-world examples'
      },
      relatedConcepts: [
        'Related Topic 1',
        'Related Topic 2',
        'Advanced Application'
      ],
      mnemonicSuggestion: 'Try creating a memory palace or story to remember this'
    };
  };

  // Handle AI question submission
  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;

    // Add user question
    const newConversation = [
      ...aiConversation,
      {
        type: 'user',
        text: aiQuestion,
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    // Generate mock AI response
    const aiResponses = [
      "Great question! Let me break this down for you. The key concept here is about understanding the relationship between the components. Think of it like building blocks where each part supports the next.",
      "That's an interesting angle to explore! This concept connects to several other areas. The main thing to remember is the fundamental principle behind it.",
      "Good thinking! To answer that, consider the context: this is particularly important because it forms the foundation for more advanced topics.",
      "Excellent question! Let's think about this step by step: First, understand the basic definition. Then, consider how it applies in practice. Finally, connect it to what you already know."
    ];

    const aiResponse = {
      type: 'ai',
      text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date().toLocaleTimeString()
    };

    setAiConversation([...newConversation, aiResponse]);
    setAiQuestion('');
  };

  // Render the appropriate session type based on selected study method
  const renderSessionType = () => {
    console.log('renderSessionType called with selectedStudyMethod:', selectedStudyMethod);
    
    if (!selectedStudyMethod) {
      console.log('No selectedStudyMethod, returning null');
      return null;
    }

    const nextCard = currentReviewCardIndex < reviewCards.length - 1 
      ? reviewCards[currentReviewCardIndex + 1] 
      : null;

    const sessionProps = {
      currentCard,
      onRatingSelect: handleRatingSelect,
      isFlipped,
      setIsFlipped,
      sessionStats: motivationalStats,
      onAttemptChange: setCurrentAttempts,
      nextCard,
      showNotification,
      onShuffle: handleShuffle,
      tutorStyle,
      setTutorStyle,
      currentLayer,
      setCurrentLayer
    };

    console.log('Session props:', sessionProps);
    console.log('Selected study method ID:', selectedStudyMethod.id);

    switch (selectedStudyMethod.id) {
      case 'doing-feedback':
        console.log('Rendering FeedbackLoopSession');
        return <FeedbackLoopSession {...sessionProps} />;
      case 'understanding-problem-solving':
        console.log('Rendering ProblemSolvingSession');
        return <ProblemSolvingSession {...sessionProps} />;
      case 'pattern-recognition':
        console.log('Rendering PatternRecognitionSession');
        return <PatternRecognitionSession {...sessionProps} />;
      case 'recall-retention':
      default:
        console.log('Using default flashcard interface');
        // Return null to use the default flashcard interface
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

      {showQuiz && selectedStudyMethod?.id !== 'doing-feedback' ? (
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
            </div>
          </div>

          <div className="session-complete-status-section">
            <h3 className="session-complete-status-heading">Status changes this session</h3>
            <p className="session-complete-status-sub">
              Learning ribbon updates from cards you just reviewed (sample data for layout).
            </p>
            <div className="session-complete-cards-grid">
              {MOCK_SESSION_STATUS_CHANGES.map((row, index) => (
                <div key={row.id} className="session-complete-mini-card">
                  <div className="session-complete-ribbon-wrap" aria-hidden>
                    <div className="session-complete-ribbon-stack">
                      <div
                        className="session-complete-ribbon-layer session-complete-ribbon-from"
                        data-status={row.fromStatus}
                        style={{ ['--ribbon-delay']: `${index * 0.18}s` }}
                      />
                      <div
                        className="session-complete-ribbon-layer session-complete-ribbon-to"
                        data-status={row.toStatus}
                      />
                    </div>
                  </div>
                  <div className="session-complete-mini-card-inner">
                    <div className="session-complete-mini-card-label">Question</div>
                    <div className="session-complete-mini-card-text">{row.questionPreview}</div>
                    <div className="session-complete-status-shift">
                      <span
                        className="session-complete-status-pill session-complete-status-pill--from"
                        data-status={row.fromStatus}
                      >
                        {LEARNING_STATUS_LABELS[row.fromStatus] ?? row.fromStatus}
                      </span>
                      <span className="session-complete-status-arrow" aria-hidden>
                        →
                      </span>
                      <span
                        className="session-complete-status-pill session-complete-status-pill--to"
                        data-status={row.toStatus}
                      >
                        {LEARNING_STATUS_LABELS[row.toStatus] ?? row.toStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="session-actions session-complete-page-actions">
            <button className="end-session-btn" onClick={handleEndSession}>
              <FiArrowLeft /> Back to Study Room
            </button>
            {selectedStudyMethod?.id !== 'doing-feedback' && (
              <button 
                className="take-quiz-btn" 
                onClick={handleTakeQuiz}
                disabled={Object.keys(cardRatings).filter(id => cardRatings[id] > 0).length === 0}
              >
                Take Quiz ({Object.keys(cardRatings).filter(id => cardRatings[id] > 0).length} cards)
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header with Timer Only */}
          <div className="review-header-flashcards">
            <div className="header-left">
              <button className="end-session-btn" onClick={handleEndSession}>
                <FiArrowLeft /> Back to Study Room
              </button>
            </div>
            
            {/* Center - Layer Indicator and Progress Counter */}
            <div className="header-center-layer">
              {/* Layer Indicator (only for doing-feedback method) */}
              {selectedStudyMethod?.id === 'doing-feedback' && (
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
              {/* Progress Counter Pill */}
              <div className="progress-counter-pill">
                <span className="progress-counter-text">
                  {currentReviewCardIndex + 1}/{reviewCards.length}
                </span>
              </div>
            </div>
            
            {/* Header Right - Timer and Tutor Style Toggles */}
            <div className="header-right-controls">
              {/* Timer Display */}
              <div className="timer-display-pill">
                <span className="timer-text">{formatTime(timer)}</span>
                <button className="pause-btn" onClick={handlePause} title={isPaused ? 'Resume' : 'Pause'}>
                  {isPaused ? <FaPlay /> : <FaPause />}
                </button>
              </div>

              {/* Tutor Style Toggle - Only show for doing-feedback method */}
              {selectedStudyMethod?.id === 'doing-feedback' && (
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
                        {(() => {
                          const defaultStyle = 'socratic';
                          const entries = Object.entries(tutorStyles);
                          const defaultEntry = entries.find(([key]) => key === defaultStyle);
                          const otherEntries = entries.filter(([key]) => key !== defaultStyle);
                          const reorderedEntries = defaultEntry ? [defaultEntry, ...otherEntries] : entries;
                          
                          return reorderedEntries.map(([key, { label, description }]) => (
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
                                <FiCheckIcon className="tutor-style-check-icon" />
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Render session type based on selected study method */}
          {renderSessionType() || (
            <>
              {/* Default Flashcard Interface with AI Assistant */}
              <div className={`flashcard-with-ai-container ${showAIAssistant ? 'ai-visible' : ''}`}>
                <div className="flashcard-section">
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
                          {/* Learning Status Badge - Only on Question Side */}
                          <div className="learning-status-badge">
                            {(() => {
                              const getStatusInfo = (status) => {
                                switch (status) {
                                  case 'mstrd':
                                    return {
                                      text: 'Mastered',
                                      color: '#e879f8',
                                      bgColor: 'rgba(162, 28, 175, 0.14)',
                                      boxShadow:
                                        '0 0 10px rgba(219, 39, 119, 0.3), 0 0 20px rgba(162, 28, 175, 0.18)',
                                    };
                                  case 'strgl':
                                    return { text: 'Struggling', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
                                  case 'unseen':
                                    return { text: 'Unseen', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
                                  case 'imprv':
                                  default:
                                    return { text: 'In Progress', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' };
                                }
                              };
                              const statusInfo = getStatusInfo(currentCard?.learning_status);
                              return (
                                <span 
                                  className="status-text"
                                  style={{
                                    color: statusInfo.color,
                                    ...(statusInfo.background
                                      ? { background: statusInfo.background }
                                      : { backgroundColor: statusInfo.bgColor }),
                                    ...(statusInfo.boxShadow ? { boxShadow: statusInfo.boxShadow } : {}),
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}
                                >
                                  {statusInfo.text}
                                </span>
                              );
                            })()}
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

                    <button className="skip-btn" onClick={handleNextReviewCard} title="Skip Card">
                      <FiSkipForward />
                    </button>
                  </div>

                  {/* AI Assistant Toggle */}
                  <div className="ai-toggle-section">
                    <button 
                      className={`ai-toggle-btn ${showAIAssistant ? 'active' : ''}`}
                      onClick={() => setShowAIAssistant(!showAIAssistant)}
                    >
                      {showAIAssistant ? <FiEyeOff /> : <FiEye />}
                      {showAIAssistant ? 'Hide Neuro Assistant' : 'Show Neuro Assistant'}
                    </button>
                  </div>
                </div>

                {/* AI Assistant Panel */}
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
                      {/* Scrollable conversation area */}
                      <div className="ai-conversation-scrollable">
                        {/* Conversation History */}
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

                      {/* Fixed question section */}
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

              {/* Rating Controls */}
              <div className="rating-controls">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-btn rating-${rating}`}
                    onClick={() => {
              
                      handleRatingSelect(rating);
                    }}
                    style={{ '--rating-accent': ratingColors[rating] }}
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

              {/* Floating Emoji Animations */}
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