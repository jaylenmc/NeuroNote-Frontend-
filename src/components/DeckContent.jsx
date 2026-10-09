import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiClock, FiArrowLeft, FiX, FiFilter, FiCheck, FiZap, FiLayers } from 'react-icons/fi';
import './DeckContent.css';
import { formatDateTimeForDisplay } from '../utils/dateUtils';
import api from '../api/axios';
import {
  getCurrentStudyQueue,
  addCardToStudyQueue,
  removeCardFromStudyQueue,
  getApiErrorMessage,
} from '../api/studyQueueApi';
import { BUCKET_LIST, getBucketInfo, isStudyQueueAddBlocked } from '../utils/buckets';
import { useNotification } from '../contexts/NotificationContext';

const bucketFilterOptions = [
  { value: null, label: 'All Cards', color: '#666' },
  ...BUCKET_LIST.map(({ key, label, color }) => ({ value: key, label, color })),
];

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
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [openCardId, setOpenCardId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedBucketFilter, setSelectedBucketFilter] = useState(null);
  const MAX_CHARS = 500;
  const [error, setError] = useState(null);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingSide, setEditingSide] = useState('front');
  const [editCardQuestion, setEditCardQuestion] = useState('');
  const [editCardAnswer, setEditCardAnswer] = useState('');
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
  const { showNotification } = useNotification();
  const [studyQueue, setStudyQueue] = useState(null);
  const [queueBusyCardId, setQueueBusyCardId] = useState(null);
  const queuedCardIds = useMemo(() => new Set((studyQueue?.cards || []).map(c => c.id)), [studyQueue]);

  useEffect(() => {
    fetchDeck();
    fetchCards();
    getCurrentStudyQueue().then(setStudyQueue).catch(() => setStudyQueue(null));
    // eslint-disable-next-line
  }, [deckId]);

  async function handleToggleStudyQueue(cardId) {
    if (!studyQueue) {
      showNotification('Generate a Study Queue from the Review page first.', 'error');
      return;
    }
    const inQueue = queuedCardIds.has(cardId);
    if (!inQueue) {
      const card = cards.find((c) => c.id === cardId);
      if (isStudyQueueAddBlocked(card)) {
        showNotification('This card is blacklisted and cannot be added to the Study Queue right now.', 'error');
        return;
      }
    }
    setQueueBusyCardId(cardId);
    try {
      const updated = inQueue ? await removeCardFromStudyQueue(cardId) : await addCardToStudyQueue(cardId);
      setStudyQueue(updated);
      const queueIds = new Set((updated.cards || []).map((c) => c.id));
      setCards((prev) =>
        prev.map((c) => ({ ...c, is_blacklisted: queueIds.has(c.id) }))
      );
      showNotification(inQueue ? 'Removed from Study Queue' : 'Added to Study Queue', 'success');
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Could not update Study Queue'), 'error');
    } finally {
      setQueueBusyCardId(null);
    }
  }


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
    try {
      await api.delete(`/flashcards/cards/delete/${deckId}/${cardId}/`);
      setCards(cards => cards.filter(c => c.id !== cardId));
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  }

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard.question.trim() || !newCard.answer.trim()) return;

    try {
      const cardData = {
        question: newCard.question,
        answer: newCard.answer,
        card_deck: deck.id,
      };

      await api.post('/flashcards/cards/', cardData);
      
      setNewCard({
        question: '',
        answer: '',
        tags: [],
      });
      setShowAdd(false);
      fetchCards();
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  function handleDeleteDeck() {
    setShowDeleteConfirm(true);
  }

  async function confirmDeleteDeck() {
    try {
      await api.delete(`/flashcards/deck/${deckId}/`);
      navigate('/study-room/decks');
    } catch (err) {
      console.error('Error deleting deck:', err);
    }
  }

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
    const matchesBucket = !selectedBucketFilter || card.bucket === selectedBucketFilter;
    return matchesSearch && matchesBucket;
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

  const CreateDeckModal = useMemo(() => {
    if (!showAdd) return null;
    return (
      <div className="deck-content-modal-overlay" onClick={() => setShowAdd(false)}>
        <div
          className="deck-content-modal deck-content-modal--lg"
          role="dialog"
          aria-labelledby="deck-add-card-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="deck-content-modal-header">
            <h2 id="deck-add-card-title" className="deck-content-modal-title">Add New Card</h2>
            <button
              type="button"
              className="deck-content-modal-close"
              onClick={() => setShowAdd(false)}
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </header>

          <div className="deck-content-modal-segmented">
            <button
              type="button"
              className={!showPreview ? 'active' : ''}
              onClick={() => { setShowPreview(false); setShowBack(false); }}
            >
              Edit
            </button>
            <button
              type="button"
              className={showPreview ? 'active' : ''}
              onClick={() => { setShowPreview(true); setShowBack(false); }}
            >
              Preview
            </button>
          </div>

          {!showPreview ? (
            <form onSubmit={handleAddCard}>
              <div className="deck-content-modal-body">
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
                      id="tags"
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tags (press Enter)"
                      style={{ border: 'none', background: 'transparent', flex: 1, color: 'inherit' }}
                    />
                  </div>
                </div>
              </div>
              <footer className="deck-content-modal-footer">
                <button
                  type="button"
                  className="deck-content-modal-btn deck-content-modal-btn--ghost"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="deck-content-modal-btn deck-content-modal-btn--primary">
                  <FiPlus size={16} />
                  Save Card
                </button>
              </footer>
            </form>
          ) : (
            <div className="deck-content-modal-body">
              <div
                className={`card-preview card-theme-dark${showBack ? ' show-back' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setShowBack((prev) => !prev)}
                title={showBack ? 'Click to show question' : 'Click to show answer'}
              >
                <div className="card-preview-front">
                  <div className="card-preview-label">Question</div>
                  <div className="card-preview-content">{newCard.question || 'No question entered'}</div>
                  <div className="card-preview-date">
                    Last reviewed: {formatDateTimeForDisplay(currentTime.toISOString())}
                  </div>
                </div>
                <div className="card-preview-back">
                  <div className="card-preview-label">Answer</div>
                  <div className="card-preview-content">{newCard.answer || 'No answer entered'}</div>
                  <div className="card-preview-date">
                    Bucket: {getBucketInfo('bkt_0').label}
                  </div>
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
      await api.put(`/flashcards/deck/${deckId}/`, {
        title: editDeckTitle,
        subject: editDeckSubject
      });

      setShowEditDeck(false);
      fetchCards(); // Refresh the cards list
    } catch (err) {
      console.error('Error updating deck:', err);
      setError(err.message);
    }
  };

  const handleEditCard = async (cardId) => {
    try {
      await api.put(`/flashcards/cards/update/${deck.id}/${cardId}/`, {
        question: editCardQuestion,
        answer: editCardAnswer,
        card_deck: deck.id
      });

      setEditingCardId(null);
      setEditingSide('front');
      fetchCards();
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
      
      // After generating, fetch the latest cards for this deck to get their id and bucket
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
    } catch {
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
          <div className="bucket-filter">
            <button 
              className={`filter-button ${selectedBucketFilter ? 'active' : ''}`}
              style={{
                color: selectedBucketFilter ? bucketFilterOptions.find(c => c.value === selectedBucketFilter)?.color : undefined,
                backgroundColor: selectedBucketFilter ? `${bucketFilterOptions.find(c => c.value === selectedBucketFilter)?.color}20` : undefined,
                borderColor: selectedBucketFilter ? bucketFilterOptions.find(c => c.value === selectedBucketFilter)?.color : undefined
              }}
            >
              <FiFilter size={16} />
              Filter
            </button>
            <div className="bucket-filter-dropdown">
              {bucketFilterOptions.map(({ value, label, color }) => (
                <button
                  key={value || 'all'}
                  className={`bucket-filter-option ${selectedBucketFilter === value ? 'active' : ''}`}
                  onClick={() => setSelectedBucketFilter(value)}
                >
                  <span className="bucket-filter-dot" style={{ background: color }} />
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
                              <button className="deck-content-card-action-btn generated-action-btn save" onClick={handleSave} title="Save">
                                <FiCheck size={22} />
                              </button>
                              <button className="deck-content-card-action-btn generated-action-btn delete" onClick={handleDelete} title="Delete">
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
                              Bucket: {getBucketInfo(card.bucket).label}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 16 }}>
                              <button className="deck-content-card-action-btn generated-action-btn save" onClick={handleSave} title="Save">
                                <FiCheck size={22} />
                              </button>
                              <button className="deck-content-card-action-btn generated-action-btn delete" onClick={handleDelete} title="Delete">
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
                  {selectedBucketFilter ? 
                    `No cards with the selected status found. Try selecting a different filter or clear the search.` :
                    search ? 
                      `No cards match "${search}". Try a different search term.` :
                      'No cards in this deck yet.'
                  }
                </p>
                {selectedBucketFilter && (
                  <button 
                    className="clear-filter-btn"
                    onClick={() => setSelectedBucketFilter(null)}
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
              const bucket = getBucketInfo(card.bucket);
              const inQueue = queuedCardIds.has(card.id);
              const addToQueueBlocked = !inQueue && isStudyQueueAddBlocked(card);

              return (
                <div
                  className={`card-preview card-theme-dark ${openCardId === card.id ? 'expanded' : ''}`}
                  key={card.id}
                  onClick={e => {
                    if (e.target.closest('.deck-content-card-action-btn') || isEditing) return;
                    setOpenCardId(openCardId === card.id ? null : card.id);
                  }}
                >
                  <div
                    className="card-status-indicator"
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className="card-status-dot"
                      style={{ backgroundColor: bucket.color }}
                      aria-hidden="true"
                    />
                    <span className="card-status-tooltip" role="tooltip">
                      <span className="card-status-tooltip-label">{bucket.label}</span>
                      <span className="card-status-tooltip-text">{bucket.description}</span>
                    </span>
                  </div>
                  <div className="card-preview-inner">
                    <div className="deck-content-card-actions">
                      <button 
                        type="button"
                        className="deck-content-card-action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditing) {
                            handleEditCard(card.id);
                          } else {
                            setEditingCardId(card.id);
                            setEditCardQuestion(card.question);
                            setEditCardAnswer(card.answer);
                          }
                        }}
                      >
                        {isEditing ? <FiCheck /> : <FiEdit2 />}
                      </button>
                      <button
                        type="button"
                        className={`deck-content-card-action-btn study-queue${inQueue ? ' in-queue' : ''}${addToQueueBlocked ? ' blocked' : ''}`}
                        title={
                          inQueue
                            ? 'Remove from Study Queue'
                            : addToQueueBlocked
                              ? 'Blacklisted — cannot add to Study Queue'
                              : 'Add to Study Queue'
                        }
                        disabled={queueBusyCardId === card.id || addToQueueBlocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStudyQueue(card.id);
                        }}
                      >
                        <FiLayers />
                      </button>
                      <button 
                        type="button"
                        className="deck-content-card-action-btn delete"
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
                            <span className="card-preview-tag">Bucket: {getBucketInfo(card.bucket).label}</span>
                            {inQueue && <span className="card-preview-tag">In Study Queue</span>}
                          </div>
                      </div>
                    ) : (
                      <div className="card-content-stack">
                        <div className="card-preview-label-row">
                          <span className="card-preview-label">{isEditing ? (editingSide === 'front' ? 'Question' : 'Answer') : 'Question'}</span>
                        </div>
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
        <div className="deck-content-modal-overlay" onClick={() => setShowEditDeck(false)}>
          <div
            className="deck-content-modal"
            role="dialog"
            aria-labelledby="deck-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="deck-content-modal-header">
              <h2 id="deck-edit-title" className="deck-content-modal-title">Edit Deck</h2>
              <button
                type="button"
                className="deck-content-modal-close"
                onClick={() => setShowEditDeck(false)}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </header>
            <form onSubmit={handleEditDeck}>
              <div className="deck-content-modal-body">
                <div className="form-group">
                  <label htmlFor="editDeckTitle">Title</label>
                  <input
                    type="text"
                    id="editDeckTitle"
                    value={editDeckTitle}
                    onChange={(e) => setEditDeckTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDeckSubject">Subject</label>
                  <input
                    type="text"
                    id="editDeckSubject"
                    value={editDeckSubject}
                    onChange={(e) => setEditDeckSubject(e.target.value)}
                    required
                  />
                </div>
              </div>
              <footer className="deck-content-modal-footer">
                <button
                  type="button"
                  className="deck-content-modal-btn deck-content-modal-btn--ghost"
                  onClick={() => setShowEditDeck(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="deck-content-modal-btn deck-content-modal-btn--primary">
                  Save Changes
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
      {showNotesModal && selectedCard && (
        <div className="deck-content-modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div
            className="deck-content-modal deck-content-modal--notes"
            role="dialog"
            aria-labelledby="deck-notes-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="deck-content-modal-header">
              <div>
                <h2 id="deck-notes-title" className="deck-content-modal-title">Card Notes</h2>
                <p className="deck-content-modal-subtitle">Private notes for this card only</p>
              </div>
              <button
                type="button"
                className="deck-content-modal-close"
                onClick={() => setShowNotesModal(false)}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </header>
            <div className="deck-content-modal-body">
              <textarea
                className="notes-textarea"
                value={cardNotes[selectedCard.id] || ''}
                onChange={(e) => handleNotesChange(selectedCard.id, e.target.value)}
                placeholder="Add your notes here..."
              />
            </div>
            <footer className="deck-content-modal-footer">
              <button
                type="button"
                className="deck-content-modal-btn deck-content-modal-btn--ghost"
                onClick={() => setShowNotesModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="deck-content-modal-btn deck-content-modal-btn--primary"
                onClick={() => handleSaveNotes(selectedCard.id)}
              >
                Save Notes
              </button>
            </footer>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="deck-content-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="deck-content-modal deck-content-modal--danger"
            role="dialog"
            aria-labelledby="deck-delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="deck-content-modal-header">
              <h2 id="deck-delete-title" className="deck-content-modal-title">Delete Deck</h2>
              <button
                type="button"
                className="deck-content-modal-close"
                onClick={() => setShowDeleteConfirm(false)}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </header>
            <div className="deck-content-modal-body">
              <p className="deck-content-modal-message">
                Are you sure you want to delete{' '}
                <span className="deck-content-modal-highlight">
                  &ldquo;{deck?.title || 'this deck'}&rdquo;
                </span>
                ?
              </p>
              <p className="deck-content-modal-message-muted">
                This action cannot be undone and will permanently remove all cards in this deck.
              </p>
            </div>
            <footer className="deck-content-modal-footer">
              <button
                type="button"
                className="deck-content-modal-btn deck-content-modal-btn--ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="deck-content-modal-btn deck-content-modal-btn--danger"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  confirmDeleteDeck();
                }}
              >
                <FiTrash2 size={16} />
                Delete Deck
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
} 