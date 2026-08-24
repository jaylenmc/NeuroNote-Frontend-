import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiStar, FiClock, FiTag, FiArrowLeft, FiX, FiFilter, FiCheck, FiZap, FiEdit3 } from 'react-icons/fi';
import './DeckContent.css';
import { formatDateForDisplay, formatDateTimeForDisplay, convertLocalDateToBackend } from '../utils/dateUtils';
import api from '../api/axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function DeckContent() {
  const [showBack, setShowBack] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchInputRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    tags: [],
    scheduled_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [openCardId, setOpenCardId] = useState(null);
  const [badgeTooltip, setBadgeTooltip] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedRibbonColor, setSelectedRibbonColor] = useState(null);
  const MAX_CHARS = 500;
  const [error, setError] = useState(null);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingSide, setEditingSide] = useState('front');
  const [editCardQuestion, setEditCardQuestion] = useState('');
  const [editCardAnswer, setEditCardAnswer] = useState('');
  const [editCardScheduledDate, setEditCardScheduledDate] = useState('');
  const [editDeckTitle, setEditDeckTitle] = useState('');
  const [editDeckSubject, setEditDeckSubject] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardNotes, setCardNotes] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedCards, setGeneratedCards] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [showClaudeGenerator, setShowClaudeGenerator] = useState(false);
  const generatedInputRef = useRef(null);

  useEffect(() => {
    if (!showClaudeGenerator) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowClaudeGenerator(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [showClaudeGenerator]);

  useEffect(() => {
    if (!showClaudeGenerator) return;
    const t = requestAnimationFrame(() => {
      generatedInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(t);
  }, [showClaudeGenerator]);
  
  const [savedGenerated, setSavedGenerated] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const ribbonColors = [
    { value: null, label: 'All Cards', color: '#666' },
    { value: 'ribbon-soft-blue', label: 'Unseen', color: '#38bdf8' },
    { value: 'ribbon-muted-purple', label: 'In Progress', color: '#7c3aed' },
    { value: 'ribbon-soft-red', label: 'Struggling', color: '#f43f5e' },
    { value: 'ribbon-dark-pink', label: 'Mastered', color: '#db2777' }
  ];

  const jwt = sessionStorage.getItem('jwt_token');

  useEffect(() => {
    fetchDeck();
    fetchCards();
    // eslint-disable-next-line
  }, [deckId]);



  async function fetchDeck() {
    try {
      const response = await api.get(`/flashcards/deck/${deckId}/`);
      const data = response.data;
      setDeck(data);
    } catch (err) {
      console.error('Error fetching deck:', err);
    }
  }

  async function fetchCards() {
    if (!deckId) return; // Guard against undefined deckId
    setLoading(true);
    try {
      const response = await api.get(`/flashcards/cards/${deckId}/`);
      setCards(response.data);
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCard(cardId) {
    setDeleting(cardId);
    try {
      await api.delete(`/flashcards/cards/delete/${deckId}/${cardId}/`);
      setCards(cards => cards.filter(c => c.id !== cardId));
    } catch (err) {
      console.error('Error deleting card:', err);
    } finally {
      setDeleting(null);
    }
  }

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard.question.trim() || !newCard.answer.trim()) return;

    try {
      // Convert local date to backend format
      const backendDate = convertLocalDateToBackend(newCard.scheduled_date);

      const cardData = {
        question: newCard.question,
        answer: newCard.answer,
        deck_id: deck.id,
        scheduled_date: backendDate
      };

      await api.post('/flashcards/cards/', cardData);
      
      setNewCard({
        question: '',
        answer: '',
        tags: [],
        scheduled_date: new Date().toISOString().split('T')[0]
      });
      setShowAdd(false);
      fetchCards();
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  async function handleDeleteDeck() {
    console.log('Delete button clicked, showing confirmation modal');
    console.log('Current showDeleteConfirm state:', showDeleteConfirm);
    setShowDeleteConfirm(true);
    console.log('Set showDeleteConfirm to true');
  }

  async function confirmDeleteDeck() {
    try {
      await api.delete(`/flashcards/deck/${deckId}/`);
      navigate('/study-room/decks');
    } catch (err) {
      console.error('Error deleting deck:', err);
    }
  }

  const getRibbonColor = (card) => {
    let ribbonColorClass = '', ribbonTooltip = '';
    if (card.learning_status === 'mstrd') {
      ribbonColorClass = 'ribbon-dark-pink';
      ribbonTooltip = "Mastered: You've reviewed this card enough times to master it!";
    } else if (card.learning_status === 'strgl') {
      ribbonColorClass = 'ribbon-soft-red';
      ribbonTooltip = 'Struggling: More incorrect than correct answers.';
    } else if (card.learning_status === 'unseen') {
      ribbonColorClass = 'ribbon-soft-blue';
      ribbonTooltip = 'Unseen: You have not reviewed this card yet.';
    } else if (card.learning_status === 'imprv') {
      ribbonColorClass = 'ribbon-muted-purple';
      ribbonTooltip = 'In Progress: Partially reviewed.';
    } else {
      ribbonColorClass = 'ribbon-muted-purple';
      ribbonTooltip = 'In Progress: Partially reviewed.';
    }
    return { ribbonColorClass, ribbonTooltip };
  };

  // Helper function to highlight matching text
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return <span key={index} className="search-highlight">{part}</span>;
      }
      return part;
    });
  };

  const filteredCards = cards.filter(card => {
    // Only search in the question field and require exact order match
    const matchesSearch = search === '' || card.question.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    const matchesRibbon = !selectedRibbonColor || getRibbonColor(card).ribbonColorClass === selectedRibbonColor;
    return matchesSearch && matchesRibbon;
  });

  // Memoized modal handlers
  const handleAddTag = useCallback((e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      setNewCard(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setNewCard(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleAddCard(e);
    }
  }, [handleAddCard]);

  const CreateDeckModal = useMemo(() => {
    if (!showAdd) return null;
    return (
      <div className={`modal-overlay${showAdd ? ' show' : ''}`} onClick={() => setShowAdd(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Add New Card</h3>
            <button className="close-button" onClick={() => setShowAdd(false)}>
              <FiX size={20} />
            </button>
          </div>

          <div className="preview-toggle">
            <button 
              className={!showPreview ? 'active' : ''} 
              onClick={() => { setShowPreview(false); setShowBack(false); }}
            >
              Edit
            </button>
            <button 
              className={showPreview ? 'active' : ''} 
              onClick={() => { setShowPreview(true); setShowBack(false); }}
            >
              Preview
            </button>
          </div>

          {!showPreview ? (
            <form onSubmit={handleAddCard}>
              <div className="form-group">
                <label htmlFor="question">Question</label>
                <textarea
                  id="question"
                  value={newCard.question}
                  onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
                  required
                  placeholder="Enter your question"
                />
              </div>
              <div className="form-group">
                <label htmlFor="answer">Answer</label>
                <textarea
                  id="answer"
                  value={newCard.answer}
                  onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
                  required
                  placeholder="Enter your answer"
                />
              </div>
              <div className="form-group">
                <label htmlFor="scheduledDate">Scheduled Review Date</label>
                <input
                  type="date"
                  id="scheduledDate"
                  value={newCard.scheduled_date}
                  onChange={(e) => setNewCard(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tags-input">
                  {newCard.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags (press Enter)"
                    style={{ border: 'none', background: 'transparent', flex: 1 }}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <FiPlus size={18} />
                  Save Card
                </button>
              </div>
            </form>
          ) : (
            <div 
              className={`card-preview${showBack ? ' show-back' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setShowBack((prev) => !prev)}
              title={showBack ? 'Click to show question' : 'Click to show answer'}
            >
              <div className="card-preview-front">
                <div className="card-preview-label">
                  QUESTION
                </div>
                <div className="card-preview-content">{newCard.question || 'No question entered'}</div>
                <div className="card-preview-date">
                  Last reviewed: {formatDateTimeForDisplay(currentTime.toISOString())}
                </div>
              </div>
              <div className="card-preview-back">
                <div className="card-preview-label">
                  ANSWER
                </div>
                <div className="card-preview-content">{newCard.answer || 'No answer entered'}</div>
                <div className="card-preview-date">
                  Next review: {newCard.scheduled_date ? formatDateTimeForDisplay(newCard.scheduled_date) : 'Not scheduled'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [showAdd, newCard, newTag, showPreview, showBack, currentTime]);

  const handleEditDeck = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/flashcards/deck/${deckId}/`, {
        title: editDeckTitle,
        subject: editDeckSubject
      });

      setShowEditDeck(false);
      setEditingDeck(null);
      fetchCards(); // Refresh the cards list
    } catch (err) {
      console.error('Error updating deck:', err);
      setError(err.message);
    }
  };

  const handleEditCard = async (cardId) => {
    try {
      // Create request body with only the fields that have values
      const requestBody = {
        question: editCardQuestion,
        answer: editCardAnswer
      };

      // Only add scheduled_date if it has a value and is not empty
      if (editCardScheduledDate && editCardScheduledDate.trim() !== '') {
        requestBody.scheduled_date = editCardScheduledDate;
      } else {
        requestBody.scheduled_date = null; // Explicitly set to null if empty
      }

      await api.put(`/flashcards/cards/update/${deck.id}/${cardId}/`, requestBody);

      setEditingCardId(null);
      setEditingSide('front');
      setEditCardScheduledDate(''); // Reset the scheduled date
      fetchCards(); // Refresh the cards list
    } catch (err) {
      console.error('Error updating card:', err);
      setError(err.message);
    }
  };

  const handleNotesChange = (cardId, value) => {
    setCardNotes(prev => ({
      ...prev,
      [cardId]: value
    }));
  };

  const handleSaveNotes = async (cardId) => {
    try {
      await api.put(`/flashcards/cards/update/${deckId}/${cardId}/`, {
        notes: cardNotes[cardId]
      });

      setShowNotesModal(false);
      setSelectedCard(null);
    } catch (err) {
      console.error('Error saving notes:', err);
      setError(err.message);
    }
  };

  const renderCard = (card) => {
    const isEditing = editingCardId === card.id;
    const { ribbonColorClass, ribbonTooltip } = getRibbonColor(card);
    const showTooltip = badgeTooltip?.cardId === card.id;

    return (
      <div key={card.id} className={`card-preview ${isEditing ? 'editing' : ''}`}>
        {isEditing && (
          <div className="edit-mode-indicator">
            <FiEdit2 size={16} />
            Editing...
          </div>
        )}
        <div className="card-content-stack">
          <span className="card-preview-label">
            {isEditing ? (editingSide === 'front' ? 'Question' : 'Answer') : 'Question'}
          </span>
          {isEditing ? (
            <textarea
              className="edit-textarea"
              value={editingSide === 'front' ? editCardQuestion : editCardAnswer}
              onChange={(e) => {
                if (editingSide === 'front') {
                  setEditCardQuestion(e.target.value);
                } else {
                  setEditCardAnswer(e.target.value);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder={editingSide === 'front' ? 'Enter question...' : 'Enter answer...'}
            />
          ) : (
            <div className="card-preview-content">
              {highlightSearchTerm(card.question, search)}
            </div>
          )}
        </div>
        {isEditing && (
          <div className="edit-controls">
            <button 
              className={`edit-side-btn ${editingSide === 'front' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setEditingSide('front');
              }}
            >
              <FiEdit2 size={16} />
              Front
            </button>
            <button 
              className={`edit-side-btn ${editingSide === 'back' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setEditingSide('back');
              }}
            >
              <FiEdit2 size={16} />
              Back
            </button>
            <button 
              className="cancel-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEditingCardId(null);
                setEditingSide('front');
              }}
            >
              <FiX size={16} />
              Cancel
            </button>
          </div>
        )}
        <div className="card-preview-date">
          <FiClock size={14} />
          {card.last_review_date ? `Last reviewed: ${formatDateTimeForDisplay(card.last_review_date)}` : 'Not reviewed yet'}
        </div>
      </div>
    );
  };

  // Helper to parse Claude's response into Q&A pairs
  function parseGeneratedCards(text) {
    // Try to split by Q: ... A: ...
    const cards = [];
    const regex = /Q\s*[:\-\.]?\s*(.+?)\s*A\s*[:\-\.]?\s*(.+?)(?=(?:Q\s*[:\-\.]|$))/gs;
    let match;
    while ((match = regex.exec(text)) !== null) {
      cards.push({ question: match[1].trim(), answer: match[2].trim() });
    }
    // Fallback: if nothing matched, treat each line as a card
    if (cards.length === 0) {
      text.split('\n').forEach(line => {
        const [q, a] = line.split(/\s*-\s*/);
        if (q && a) cards.push({ question: q.trim(), answer: a.trim() });
      });
    }
    return cards;
  }

  async function handleGenerateFlashcards() {
    if (!generatedPrompt.trim()) return;
    setGenerating(true);
    setGeneratedCards([]);
    setError(null);
    try {
      const response = await api.post('/tutor/cardsgen/', {
        prompt: generatedPrompt,
        deck_id: deckId
      });
      
      // After generating, fetch the latest cards for this deck to get scheduled_date and id
      const cardsRes = await api.get(`/flashcards/cards/${deckId}/`);
      const allCards = cardsRes.data;
      // Try to match generated cards by front/back to get their DB info
      const generated = response.data.Cards;
      const matched = generated.map(gen => {
        const found = allCards.find(c => c.question === gen.front && c.answer === gen.back);
        return found ? found : gen;
      });
      setGeneratedCards(matched);
      setGenerating(false);
    } catch (err) {
      setError('Error generating flashcards');
      setGenerating(false);
    }
  }

  return (
    <>
     <div className="main-content-header">
           <button className="deck-back-button" onClick={() => navigate('/study-room/decks')}><FiArrowLeft /> Back</button>
          
          <button className="add-card-btn" onClick={() => setShowAdd(true)} disabled={!deck}><FiPlus /> Add New Card</button>
        </div>
      <div className="deck-content-page">
        <div className="deck-content-study-header">
          <div className="deck-content-study-header-content">
            {/* Left Side (Content Info) */}
            <div className="deck-info-section">
              <div className="deck-content-study-header-info">
                <div className="deck-info-left">
                  <div className="deck-title-section">
                    <div className="deck-title-with-icon">
                      <div className="deck-title-left">
                        <span className="material-symbols-outlined deck-emoji">stacks</span>
                        <h1 className="deck-content-deck-title" data-full-title={deck?.title || 'Deck'}>
                          {deck?.title || 'Deck'}
                        </h1>
                      </div>
                    </div>
                    <div className="deck-title-actions">
                      <button 
                        className="deck-content-study-header-btn" 
                        title="Edit Deck" 
                        disabled={!deck}
                        onClick={() => {
                          if (!deck) return;
                          setEditingDeck(deck);
                          setEditDeckTitle(deck.title || '');
                          setEditDeckSubject(deck.subject || '');
                          setShowEditDeck(true);
                        }}
                      >
                        <FiEdit2 />
                        Edit Deck
                      </button>
                      <button 
                        className="deck-content-study-header-btn deck-content-study-delete-btn" 
                        title="Delete Deck" 
                        disabled={!deck}
                        onClick={handleDeleteDeck}
                      >
                        <FiTrash2 />
                        Delete Deck
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="deck-search-filter">
          <div className="deck-search-bar">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search cards..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => {
                // Position cursor at the end of the text when focused
                setTimeout(() => {
                  if (searchInputRef.current) {
                    const length = searchInputRef.current.value.length;
                    searchInputRef.current.setSelectionRange(length, length);
                  }
                }, 0);
              }}
            />
            <FiSearch className="search-icon" />
          </div>
          <div className="ribbon-filter">
            <button 
              className={`filter-button ${selectedRibbonColor ? 'active' : ''}`}
              style={{
                color: selectedRibbonColor ? ribbonColors.find(c => c.value === selectedRibbonColor)?.color : undefined,
                backgroundColor: selectedRibbonColor ? `${ribbonColors.find(c => c.value === selectedRibbonColor)?.color}20` : undefined,
                borderColor: selectedRibbonColor ? ribbonColors.find(c => c.value === selectedRibbonColor)?.color : undefined
              }}
            >
              <FiFilter size={16} />
              Filter
            </button>
            <div className="ribbon-filter-dropdown">
              {ribbonColors.map(({ value, label, color }) => (
                <button
                  key={value || 'all'}
                  className={`ribbon-filter-option ${selectedRibbonColor === value ? 'active' : ''}`}
                  onClick={() => setSelectedRibbonColor(value)}
                  data-value={value}
                >
                  <span className="ribbon-color-dot"/>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button 
            type="button"
            className={`claude-toggle-btn${showClaudeGenerator ? ' active' : ''}`}
            onClick={() => setShowClaudeGenerator(true)}
            title="Open AI flashcard generator"
          >
            <FiZap size={16} />
            Generate
          </button>
        </div>
        {showClaudeGenerator && (
          <div
            className="claude-generator-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="claude-generator-modal-title"
            onClick={() => setShowClaudeGenerator(false)}
          >
            <div
              className="claude-generator-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="claude-generator-modal-header">
                <h3 id="claude-generator-modal-title" className="claude-generator-title">
                  Generate Flashcards
                </h3>
                <button
                  type="button"
                  className="claude-generator-modal-close"
                  onClick={() => setShowClaudeGenerator(false)}
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="claude-flashcard-generator claude-flashcard-generator--modal">
                <textarea
                  ref={generatedInputRef}
                  value={generatedPrompt}
                  onChange={e => setGeneratedPrompt(e.target.value)}
                  placeholder="Enter a topic, chapter, or concept to generate flashcards..."
                  rows={4}
                  className="claude-generator-textarea"
                />
                <button
                  type="button"
                  className="claude-generator-btn"
                  onClick={handleGenerateFlashcards}
                  disabled={generating || !generatedPrompt.trim()}
                  style={{ display: generatedCards.length > 0 && !savedGenerated ? 'none' : undefined }}
                >
                  {generating ? 'Generating...' : 'Generate Flashcards'}
                </button>
                {error && <div className="claude-generator-error">{error}</div>}
                {generatedCards.length > 0 && !savedGenerated && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="submit-button"
                      style={{ background: '#7c83fd', color: '#fff', border: 'none' }}
                      onClick={() => {
                        setCards([...generatedCards.map(card => ({
                          ...card,
                          question: card.front || card.question,
                          answer: card.back || card.answer
                        })), ...cards]);
                        setGeneratedCards([]);
                        setSavedGenerated(true);
                        setGeneratedPrompt('');
                        setShowClaudeGenerator(false);
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setGeneratedCards([]);
                        setSavedGenerated(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {cards.length === 0 && generatedCards.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-message">
              <div className="onboarding-ghost" role="img" aria-label="Ghost">👻</div>
              <h3>This deck is empty</h3>
              <p>💡 Pro Tip: Use the <b>AI Generator</b> to create your first 10 cards.</p>
            </div>
            <div className="empty-state-actions">
              <button className="add-item-btn" onClick={() => setShowClaudeGenerator(true)}>
                <FiZap style={{marginRight: 6}} /> Generate
              </button>
              <button className="add-item-btn" onClick={() => setShowAdd(true)}>
                <FiPlus style={{marginRight: 6}} /> Add Card
              </button>
            </div>
          </div>
        )}
        <div className="card-list-grid cards-grid">
          {/* Render generated cards first */}
          {(generatedCards.length > 0 && !savedGenerated) && (
            <>
              {generatedCards.map((card, idx) => {
                const genId = `generated-${idx}`;
                const isOpen = openCardId === genId;
                const question = card.front || card.question || '';
                const answer = card.back || card.answer || '';
                const lastReview = card.last_review_date ? formatDateTimeForDisplay(card.last_review_date) : 'Not reviewed yet';
                const scheduledDate = card.scheduled_date ? formatDateTimeForDisplay(card.scheduled_date) : 'Not scheduled';
                // Save handler for this card
                const handleSave = (e) => {
                  e.stopPropagation();
                  setCards(cards => [
                    {
                      ...card,
                      question: card.front || card.question,
                      answer: card.back || card.answer
                    },
                    ...cards
                  ]);
                  setGeneratedCards(generatedCards => generatedCards.filter((_, i) => i !== idx));
                };
                // Delete handler for this card
                const handleDelete = (e) => {
                  e.stopPropagation();
                  setGeneratedCards(generatedCards => generatedCards.filter((_, i) => i !== idx));
                };
                return (
                  <div
                    className="card-preview card-theme-dark generated-card"
                    key={genId}
                    style={{ position: 'relative' }}
                    onClick={() => setOpenCardId(isOpen ? null : genId)}
                  >
                    {/* Purple Generated badge */}
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#7c83fd', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 13, fontWeight: 700, zIndex: 2, boxShadow: '0 2px 8px rgba(124,131,253,0.13)' }}>
                      Generated
                    </div>
                    <div className="card-preview-inner">
                      <div className="card-content-stack">
                        {!isOpen ? (
                          <>
                            <span className="card-preview-label">Question</span>
                            <div className="card-preview-content">{question || <em>No question</em>}</div>
                            <div className="card-preview-date" style={{ marginTop: 10 }}>
                              <FiClock size={14} style={{ marginRight: 4 }} />
                              {lastReview}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 16 }}>
                              <button className="card-action-btn generated-action-btn save" onClick={handleSave} title="Save">
                                <FiCheck size={22} />
                              </button>
                              <button className="card-action-btn generated-action-btn delete" onClick={handleDelete} title="Delete">
                                <FiTrash2 size={22} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="card-preview-label">Answer</span>
                            <div className="card-preview-content">{answer || <em>No answer</em>}</div>
                            <div className="card-preview-date" style={{ marginTop: 10 }}>
                              <FiClock size={14} style={{ marginRight: 4 }} />
                              Scheduled: {scheduledDate}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 16 }}>
                              <button className="card-action-btn generated-action-btn save" onClick={handleSave} title="Save">
                                <FiCheck size={22} />
                              </button>
                              <button className="card-action-btn generated-action-btn delete" onClick={handleDelete} title="Delete">
                                <FiTrash2 size={22} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {loading ? <div className="loading">Loading...</div> :
            filteredCards.length === 0 && cards.length > 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No cards found</h3>
                <p>
                  {selectedRibbonColor ? 
                    `No cards with the selected status found. Try selecting a different filter or clear the search.` :
                    search ? 
                      `No cards match "${search}". Try a different search term.` :
                      'No cards in this deck yet.'
                  }
                </p>
                {selectedRibbonColor && (
                  <button 
                    className="clear-filter-btn"
                    onClick={() => setSelectedRibbonColor(null)}
                  >
                    Clear Filter
                  </button>
                )}
                {search && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearch('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) :
            filteredCards.map(card => {
              const isEditing = editingCardId === card.id;
              const reps = card.repetitions || 0;
              const correct = card.correct || 0;
              const incorrect = card.incorrect || 0;
              let ribbonColorClass = '', ribbonTooltip = '';
              if (card.learning_status === 'mstrd') {
                ribbonColorClass = 'ribbon-dark-pink';
                ribbonTooltip = "Mastered: You've reviewed this card enough times to master it!";
              } else if (card.learning_status === 'strgl') {
                ribbonColorClass = 'ribbon-soft-red';
                ribbonTooltip = 'Struggling: More incorrect than correct answers.';
              } else if (card.learning_status === 'unseen') {
                ribbonColorClass = 'ribbon-soft-blue';
                ribbonTooltip = 'Unseen: You have not reviewed this card yet.';
              } else if (card.learning_status === 'imprv') {
                ribbonColorClass = 'ribbon-muted-purple';
                ribbonTooltip = 'In Progress: Partially reviewed.';
              } else {
                ribbonColorClass = 'ribbon-muted-purple';
                ribbonTooltip = 'In Progress: Partially reviewed.';
              }
              const showTooltip = badgeTooltip && badgeTooltip.cardId === card.id;
              let ribbonBackground = '#18181b';
              let arrowColor = '#18181b';
              if (ribbonColorClass === 'ribbon-soft-blue') {
                ribbonBackground = 'linear-gradient(100deg, #60a5fa 60%, #38bdf8 100%)';
                arrowColor = '#38bdf8';
              }
              if (ribbonColorClass === 'ribbon-dark-pink') {
                ribbonBackground = 'linear-gradient(100deg, #a21caf 60%, #db2777 100%)';
                arrowColor = '#db2777';
              }
              if (ribbonColorClass === 'ribbon-soft-red') {
                ribbonBackground = 'linear-gradient(100deg, #f87171 60%, #f43f5e 100%)';
                arrowColor = '#f43f5e';
              }
              if (ribbonColorClass === 'ribbon-muted-purple') {
                ribbonBackground = 'linear-gradient(100deg, #a78bfa 60%, #7c3aed 100%)';
                arrowColor = '#7c3aed';
              }

              return (
                <div
                  className={`card-preview card-theme-${theme} ${openCardId === card.id ? 'expanded' : ''}`}
                  key={card.id}
                  onClick={e => {
                    if (e.target.closest('.card-action-btn') || isEditing) return;
                    setOpenCardId(openCardId === card.id ? null : card.id);
                  }}
                >
                  <div
                    className="ribbon-tooltip-wrapper"
                    onMouseEnter={e => {
                      if (!badgeTooltip || badgeTooltip.cardId !== card.id) {
                        setBadgeTooltip({cardId: card.id, message: ribbonTooltip});
                      }
                    }}
                    onMouseLeave={e => {
                      if (badgeTooltip && badgeTooltip.cardId === card.id) {
                        setBadgeTooltip(null);
                      }
                    }}
                  >
                    <div className={`card-ribbon-bookmark ${ribbonColorClass}`}>&nbsp;</div>
                    <span className={`badge-tooltip badge-tooltip-outside ${card.learning_status === 'imprv' ? 'tooltip-in-progress' : ''}${showTooltip ? ' show' : ''}`}
                          style={{ background: ribbonBackground }}>{ribbonTooltip}
                    </span>
                  </div>
                  <div className="card-preview-inner">
                    <div className="card-actions" >
                      <button 
                        type="button"
                        className="card-action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditing) {
                            handleEditCard(card.id);
                          } else {
                            setEditingCardId(card.id);
                            setEditCardQuestion(card.question);
                            setEditCardAnswer(card.answer);
                            setEditCardScheduledDate(card.scheduled_date || '');
                          }
                        }}
                      >
                        {isEditing ? <FiCheck /> : <FiEdit2 />}
                      </button>
                      <button 
                        type="button"
                        className="card-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    {isEditing && (
                      <div className="badge-tooltip-outside show">
                        Edit Mode
                      </div>
                    )}
                    {openCardId === card.id ? (
                      <div className="card-preview-back">
                        <div className="card-preview-label">Answer</div>
                        {isEditing ? (
                          <textarea
                            className="card-preview-content"
                            value={editingSide === 'back' ? editCardAnswer : editCardQuestion}
                            onChange={(e) => {
                              if (editingSide === 'back') {
                                setEditCardAnswer(e.target.value);
                              } else {
                                setEditCardQuestion(e.target.value);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="card-preview-content">
                            {card.answer}
                            {isEditing && <span className="caret">|</span>}
                          </div>
                        )}
                          <div className="card-preview-tags">
                            <span className="card-preview-tag">Difficulty: {card.difficulty?.toFixed(1) || '0.0'}</span>
                            <span className="card-preview-tag">Stability: {card.stability?.toFixed(1) || '0.0'}</span>
                          </div>
                        <div className="card-preview-date">
                            Next review: {card.scheduled_date ? formatDateTimeForDisplay(card.scheduled_date) : 'Not scheduled'}
                          </div>
                      </div>
                    ) : (
                      <div className="card-content-stack">
                        <span className="card-preview-label">{isEditing ? (editingSide === 'front' ? 'Question' : 'Answer') : 'Question'}</span>
                        {isEditing ? (
                          <textarea
                            className="card-preview-content"
                            value={editingSide === 'front' ? editCardQuestion : editCardAnswer}
                            onChange={(e) => {
                              if (editingSide === 'front') {
                                setEditCardQuestion(e.target.value);
                              } else {
                                setEditCardAnswer(e.target.value);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'inherit',
                              fontFamily: 'inherit',
                              fontSize: 'inherit',
                              lineHeight: 'inherit',
                              padding: '0',
                              resize: 'none',
                              minHeight: '100px',
                              width: '100%',
                              outline: 'none',
                              caretColor: 'var(--primary-color)'
                            }}
                          />
                        ) : (
                          <div className="card-preview-content">
                            {highlightSearchTerm(card.question, search)}
                            {isEditing && <span className="caret">|</span>}
                          </div>
                        )}
                        {!isEditing && (
                          <button 
                            className="card-preview-tag notes-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCard(card);
                              setShowNotesModal(true);
                            }}
                          >
                            Notes
                          </button>
                        )}
                        <span className="card-preview-date">
                          {card.last_review_date ? `Last reviewed: ${formatDateTimeForDisplay(card.last_review_date)}` : 'Not reviewed yet'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      {CreateDeckModal}
      {showEditDeck && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Deck</h2>
            <form onSubmit={handleEditDeck}>
              <div className="form-group">
                <label htmlFor="editDeckTitle">Title:</label>
                <input
                  type="text"
                  id="editDeckTitle"
                  value={editDeckTitle}
                  onChange={(e) => setEditDeckTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDeckSubject">Subject:</label>
                <input
                  type="text"
                  id="editDeckSubject"
                  value={editDeckSubject}
                  onChange={(e) => setEditDeckSubject(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-button">Save Changes</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowEditDeck(false);
                    setEditingDeck(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showNotesModal && selectedCard && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Card Notes</h3>
              <button className="close-button" onClick={() => setShowNotesModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="form-group">
              <textarea
                className="notes-textarea"
                value={cardNotes[selectedCard.id] || ''}
                onChange={(e) => handleNotesChange(selectedCard.id, e.target.value)}
                placeholder="Add your notes here..."
              />
            </div>
            <div className="modal-actions">
              <button 
                className="submit-button"
                onClick={() => handleSaveNotes(selectedCard.id)}
              >
                Save Notes
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowNotesModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
            <div 
              style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '2rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                margin: 0, 
                color: '#fff' 
              }}>
                Delete Deck
              </h3>
              <button 
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setShowDeleteConfirm(false)}
                onMouseEnter={(e) => {
                  e.target.style.color = '#fff';
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#9ca3af';
                  e.target.style.background = 'transparent';
                }}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ 
                color: '#fff', 
                fontSize: '1rem', 
                lineHeight: '1.5', 
                margin: '0 0 0.5rem 0' 
              }}>
                Are you sure you want to delete{' '}
                <span style={{ 
                  color: '#fbbf24', 
                  fontWeight: '700',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}>
                  "{deck?.title || 'this deck'}"
                </span>
                ?
              </p>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '0.875rem', 
                lineHeight: '1.6', 
                margin: 0,
                fontStyle: 'italic',
                fontWeight: '500'
              }}>
                This action cannot be undone and will permanently remove all cards in this deck.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '1rem' 
            }}>
              <button 
                style={{
                  background: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setShowDeleteConfirm(false)}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#9ca3af';
                }}
              >
                Cancel
              </button>
              <button 
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  confirmDeleteDeck();
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ef4444';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <FiTrash2 size={18} />
                Delete Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 