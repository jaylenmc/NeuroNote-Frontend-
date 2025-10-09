import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown, FiX } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import { Brain, ChevronDown } from 'lucide-react';
import ReviewWidget from '../components/ReviewWidget';
import api from '../api/axios';
import './ReviewPage.css';
import { useAuth } from '../auth/AuthContext';

const motivationalQuotes = [
  "Let's sharpen your memory.",
  "Time to master your decks.",
  "🧠 Boosting recall one card at a time.",
  "Stay consistent, see results!",
  "Review now, remember forever."
];

const studyMethods = [
  {
    id: 'recall-retention',
    title: 'Recall + Retention (Default)',
    description: 'Focus on active recall and long-term retention techniques',
    icon: '🧠',
    color: '#4ecdc4'
  },
  {
    id: 'doing-feedback',
    title: 'Doing + Feedback Loop',
    description: 'Learn by doing and getting immediate feedback on your performance',
    icon: '🔄',
    color: '#7c83fd'
  },
  {
    id: 'understanding-problem-solving',
    title: 'Understanding + Problem Solving',
    description: 'Deep understanding through analytical problem-solving approaches',
    icon: '🔍',
    color: '#ffd93d'
  },
  {
    id: 'pattern-recognition',
    title: 'Pattern Recognition + Applied Learning',
    description: 'Identify patterns and apply knowledge to real-world scenarios',
    icon: '🔗',
    color: '#ff6b6b'
  }
];

const ReviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Deck dropdown state
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const userName = user?.email ? user.email.split('@')[0] : 'User';
  
  // Study Method state
  const [showStudyMethodDropdown, setShowStudyMethodDropdown] = useState(false);
  const [selectedStudyMethod, setSelectedStudyMethod] = useState(studyMethods.find(method => method.id === 'recall-retention'));

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const decksResponse = await api.get('/flashcards/deck/');
        let decks = [];
        const responseData = decksResponse.data.decks || decksResponse.data;
        if (responseData && Array.isArray(responseData)) {
          decks = responseData;
        } else if (decksResponse.data && Array.isArray(decksResponse.data.decks)) {
          decks = decksResponse.data.decks;
        } else if (decksResponse.data && decksResponse.data.results) {
          decks = decksResponse.data.results;
        }
        setDecks(decks);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(idx => (idx + 1) % motivationalQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStudyMethodDropdown && !event.target.closest('.study-method-container')) {
        setShowStudyMethodDropdown(false);
      }
      if (showDeckDropdown && !event.target.closest('.deck-dropdown-container')) {
        setShowDeckDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStudyMethodDropdown, showDeckDropdown]);

  // Study Method handlers
  const handleStudyMethodSelect = (method) => {
    setSelectedStudyMethod(method);
    setShowStudyMethodDropdown(false);
    // Here you could add logic to apply the study method
    console.log('Selected study method:', method);
  };

  const toggleStudyMethodDropdown = () => {
    setShowStudyMethodDropdown(!showStudyMethodDropdown);
  };

  return (
    <div className="review-page">
      <div className="review-header enhanced-review-header">
        <button className="back-button" onClick={() => navigate('/study-room')}>
          <FiArrowLeft /> Back to Study Room
        </button>
        <div className="review-header-right">
          <div className="study-method-container" style={{ position: 'relative' }}>
            <button 
              className={`study-method-button ${selectedStudyMethod ? 'selected' : ''}`}
              onClick={toggleStudyMethodDropdown}
              title="Select Study Method"
            >
              <Brain size={20} />
              <span>{selectedStudyMethod ? (selectedStudyMethod.title.includes('(Default)') ? selectedStudyMethod.title.replace(' (Default)', '') : selectedStudyMethod.title) : 'Study Method'}</span>
              <ChevronDown size={16} />
            </button>
            
            {showStudyMethodDropdown && (
              <div className="study-method-dropdown">
                <div className="study-method-dropdown-header">
                  <h4>Choose Your Study Method</h4>
                </div>
                {studyMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`study-method-option ${selectedStudyMethod?.id === method.id ? 'selected' : ''}`}
                    onClick={() => handleStudyMethodSelect(method)}
                  >
                    <div className="study-method-icon" style={{ color: method.color }}>
                      {method.icon}
                    </div>
                    <div className="study-method-content">
                      <div className="study-method-title">{method.title}</div>
                      <div className="study-method-description">{method.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="deck-dropdown-container">
            <button
              className="deck-dropdown-toggle"
              onClick={() => setShowDeckDropdown((prev) => !prev)}
              title={selectedDeckId ? (decks.find(d => d.id === selectedDeckId)?.title || 'Unknown Deck') : 'All Decks'}
            >
              <span role="img" aria-label="deck">📁</span>
              {selectedDeckId
                ? (() => {
                    const deckTitle = decks.find(d => d.id === selectedDeckId)?.title || 'Unknown Deck';
                    return deckTitle.length > 20 ? deckTitle.substring(0, 20) + '...' : deckTitle;
                  })()
                : 'All Decks'}
              <FiChevronDown style={{ marginLeft: 6 }} />
            </button>
            {showDeckDropdown && (
              <div className="deck-dropdown-menu">
                <div
                  className={`deck-dropdown-item${selectedDeckId === null ? ' selected' : ''}`}
                  onClick={() => { setSelectedDeckId(null); setShowDeckDropdown(false); }}
                >
                  📁 All Decks
                </div>
                {decks.map(deck => (
                  <div
                    key={deck.id}
                    className={`deck-dropdown-item${selectedDeckId === deck.id ? ' selected' : ''}`}
                    onClick={() => { setSelectedDeckId(deck.id); setShowDeckDropdown(false); }}
                  >
                    📦 {deck.title}
                  </div>
                ))}
              </div>
            )}
            {selectedDeckId && (
              <button
                className="clear-deck-filter"
                onClick={() => setSelectedDeckId(null)}
                title="Clear Filter"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="review-session-title-block enhanced-title-block">
        <div className="review-greeting">{userName} <span className="wave">👋</span></div>
        <h2 className="review-session-title gradient-title">
          <FaBrain className="brain-icon" /> Review Session
        </h2>
        <p className="review-session-subtitle dynamic-quote">{motivationalQuotes[quoteIdx]}</p>
      </div>
      <div className="review-content">
        <ReviewWidget 
          decks={decks}
          selectedDeckId={selectedDeckId}
          selectedStudyMethod={selectedStudyMethod}
        />
      </div>
    </div>
  );
};

export default ReviewPage; 