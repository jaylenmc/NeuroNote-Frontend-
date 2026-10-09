import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiX, FiClock, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { BookOpen } from 'lucide-react';
import './ReviewWidget.css';
import { Checkbox } from './ui/checkbox';
import BrainLoader from './BrainLoader';
import api from '../api/axios';
import {
  getCurrentStudyQueue,
  startStudyQueue,
  dismissStudyQueue,
  addCardToStudyQueue,
  removeCardFromStudyQueue,
  getApiErrorMessage,
} from '../api/studyQueueApi';
import { getBucketInfo, BLACKLISTED_LABEL, isStudyQueueAddBlocked } from '../utils/buckets';
import {
  formatStudyQueueBlacklistCountdown,
  getStudyQueueBlacklistEndsAt,
} from '../utils/dateUtils';
import { useNotification } from '../contexts/NotificationContext';

const DEFAULT_GROUP_SIZE = 20;
const DEFAULT_TIMER_MINUTES = 10;

const BlacklistedPill = ({ card, nowMs }) => {
  const blacklistEndsAt = getStudyQueueBlacklistEndsAt(card.last_review_date);
  const countdown = formatStudyQueueBlacklistCountdown(blacklistEndsAt, new Date(nowMs));
  const endsTitle = blacklistEndsAt
    ? `Available again at ${blacklistEndsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'Reviewed recently. Available again within the hour.';

  return (
    <span className="bucket-pill blacklisted-pill" title={endsTitle}>
      <FiClock aria-hidden="true" />
      {BLACKLISTED_LABEL}
      {countdown && (
        <span className="blacklisted-pill-countdown" aria-label={`Available in ${countdown}`}>
          {countdown}
        </span>
      )}
    </span>
  );
};

const BucketDot = ({ bucket }) => {
  const info = getBucketInfo(bucket);
  const tooltip = `${info.label}: ${info.description}`;
  return (
    <span className="card-item-bucket-dot-wrap">
      <span
        className="card-item-bucket-dot"
        style={{ backgroundColor: info.color }}
        role="img"
        aria-label={tooltip}
        tabIndex={0}
      />
      <span className="card-item-bucket-dot-tooltip" role="tooltip">
        <strong>{info.label}</strong>
        <span>{info.description}</span>
      </span>
    </span>
  );
};

const ReviewWidget = ({ decks = [], selectedDeckId, selectedStudyMethod }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isStudyQueueMethod = !selectedStudyMethod || selectedStudyMethod.id === 'recall-retention';

  const [activeTab, setActiveTab] = useState('queue');
  const [allCards, setAllCards] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [groupSize, setGroupSize] = useState(DEFAULT_GROUP_SIZE);
  const [isTimed, setIsTimed] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES);
  const [countdownNow, setCountdownNow] = useState(() => Date.now());

  const deckTitles = useMemo(
    () => Object.fromEntries(decks.map((deck) => [Number(deck.id), deck.title])),
    [decks]
  );
  const selectedDeck = decks.find((deck) => Number(deck.id) === Number(selectedDeckId)) || null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cardsRes, currentQueue] = await Promise.all([
          api.get('/flashcards/cards/'),
          getCurrentStudyQueue(),
        ]);
        if (cancelled) return;
        setAllCards(Array.isArray(cardsRes.data) ? cardsRes.data : []);
        setQueue(currentQueue);
      } catch (err) {
        if (!cancelled) showNotification(getApiErrorMessage(err, 'Failed to load your cards'), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setCountdownNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setActiveTab(isStudyQueueMethod ? 'queue' : 'cards');
  }, [isStudyQueueMethod]);

  const queueCardIds = useMemo(() => new Set((queue?.cards || []).map((card) => card.id)), [queue]);
  const studyableQueueCards = (queue?.cards || []).filter((card) => card.slot_label !== BLACKLISTED_LABEL);

  const queueMatchesSelection = Boolean(
    queue &&
      (queue.scope === 'all_cards'
        ? !selectedDeckId
        : Number(queue.deck_id) === Number(selectedDeckId))
  );

  const selectedCards = useMemo(
    () => (selectedDeckId ? allCards.filter((card) => Number(card.card_deck) === Number(selectedDeckId)) : allCards),
    [allCards, selectedDeckId]
  );

  const addableCards = useMemo(() => {
    if (!queue) return [];
    return allCards.filter(
      (card) =>
        !queueCardIds.has(card.id) &&
        !isStudyQueueAddBlocked(card) &&
        (queue.scope === 'all_cards' || Number(card.card_deck) === Number(queue.deck_id))
    );
  }, [allCards, queue, queueCardIds]);

  const scopeLabel = (deckId) => (deckId ? deckTitles[Number(deckId)] || 'Selected deck' : 'All cards');

  const runQueueAction = async (action, successMessage) => {
    setBusy(true);
    try {
      const updated = await action();
      if (updated !== undefined) setQueue(updated);
      if (successMessage) showNotification(successMessage, 'success');
    } catch (err) {
      showNotification(getApiErrorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateQueue = () => {
    if (queue && !window.confirm('Replace your current Study Queue? Its progress will be discarded.')) return;
    const size = Math.max(1, Math.min(100, Number(groupSize) || DEFAULT_GROUP_SIZE));
    const timerSeconds = isTimed ? Math.max(1, Number(timerMinutes) || DEFAULT_TIMER_MINUTES) * 60 : null;
    runQueueAction(
      () =>
        startStudyQueue({
          deckId: selectedDeckId || null,
          groupSize: size,
          timerSeconds,
          replaceExisting: Boolean(queue),
        }),
      queue ? 'Study Queue replaced' : 'Study Queue generated'
    ).then(() => setActiveTab('queue'));
  };

  const handleDismissQueue = () => {
    if (!window.confirm('Dismiss your current Study Queue?')) return;
    runQueueAction(async () => {
      await dismissStudyQueue();
      return null;
    }, 'Study Queue dismissed');
  };

  const handleAddCard = (cardId) => {
    const card = allCards.find((c) => c.id === cardId);
    if (isStudyQueueAddBlocked(card)) {
      showNotification('This card is blacklisted and cannot be added to the Study Queue right now.', 'error');
      return;
    }
    runQueueAction(() => addCardToStudyQueue(cardId), 'Card added to Study Queue');
  };

  const handleRemoveCard = (cardId) => runQueueAction(() => removeCardFromStudyQueue(cardId));

  const handleStartReview = () => {
    if (isStudyQueueMethod) {
      if (!queue || studyableQueueCards.length === 0) {
        showNotification('No cards available in your Study Queue right now', 'error');
        return;
      }
      navigate('/review-session', {
        state: {
          selectedStudyMethod,
          studyGroupId: queue.id,
          timerSeconds: queue.is_timed ? queue.timer_seconds : null,
          selectedDeck: queue.deck_id ? decks.find((deck) => Number(deck.id) === Number(queue.deck_id)) : null,
        },
      });
      return;
    }

    if (selectedCards.length === 0) {
      showNotification('No cards to review', 'error');
      return;
    }
    navigate('/review-session', { state: { selectedStudyMethod, selectedDeck } });
  };

  const renderCardItem = (card, index, action, { actionAtTopRight = false } = {}) => (
    <div key={card.id} className="card-item" style={{ animationDelay: `${index * 0.05}s` }}>
      <BucketDot bucket={card.bucket} />
      {actionAtTopRight && action && (
        <div className="card-item-action-top-right">{action}</div>
      )}
      <div className="card-deck-top">{deckTitles[Number(card.card_deck)] || 'Deck'}</div>
      <div className="card-question-center">{card.question}</div>
      <div className="card-due-bottom">
        {card.slot_label === BLACKLISTED_LABEL && (
          <BlacklistedPill card={card} nowMs={countdownNow} />
        )}
        {card.source === 'manual' && <span className="bucket-pill manual-pill">Added</span>}
        {!actionAtTopRight && action}
      </div>
    </div>
  );

  const renderEmpty = (title, message) => (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <BookOpen size={32} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'cards') {
      if (selectedCards.length === 0) return renderEmpty('No cards yet', 'Add cards to a deck to start reviewing.');
      return selectedCards.map((card, index) => renderCardItem(card, index));
    }

    if (activeTab === 'add') {
      if (addableCards.length === 0) return renderEmpty('Nothing to add', 'Every card in this scope is already queued.');
      return addableCards.map((card, index) =>
        renderCardItem(
          card,
          index,
          <button
            type="button"
            className="queue-card-action"
            onClick={() => handleAddCard(card.id)}
            disabled={busy}
            title="Add to Study Queue"
          >
            <FiPlus />
          </button>
        )
      );
    }

    if (!queue) {
      return renderEmpty('No active Study Queue', 'Generate one below for a specific deck or all of your cards.');
    }
    if (queue.cards.length === 0) {
      return renderEmpty('Your Study Queue is empty', 'No eligible cards right now. Try again later or add cards manually.');
    }
    return queue.cards.map((card, index) =>
      renderCardItem(
        card,
        index,
        <button
          type="button"
          className="queue-card-action remove"
          onClick={() => handleRemoveCard(card.id)}
          disabled={busy}
          title="Remove from Study Queue"
        >
          <FiX />
        </button>,
        { actionAtTopRight: true }
      )
    );
  };

  const renderTabs = () => {
    const tabs = isStudyQueueMethod
      ? [
          { id: 'queue', label: 'Study Queue', count: queue?.cards.length || 0 },
          ...(queue ? [{ id: 'add', label: 'Add Cards', count: addableCards.length }] : []),
        ]
      : [{ id: 'cards', label: selectedDeck ? selectedDeck.title : 'All Cards', count: selectedCards.length }];

    return (
      <div className="sticky-tab-container enhanced-tab-container">
        <div className="tab-bar-with-filter enhanced-tab-bar">
          <div className="tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                data-category={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>
                  {tab.label}: <span className="tab-count animated-count">{tab.count}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderQueueOptions = () => (
    <div className="review-options">
      <div className="due-soon-toggle queue-options">
        <div className="due-soon-toggle-row">
          <label htmlFor="queue-group-size" className="due-soon-toggle-label text-sm font-medium text-white/85">
            Cards per queue
          </label>
          <input
            id="queue-group-size"
            type="number"
            min={1}
            max={100}
            className="queue-number-input"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
          />
        </div>
        <div className="due-soon-toggle-row">
          <Checkbox
            id="queue-timed"
            className="due-soon-checkbox"
            checked={isTimed}
            onCheckedChange={(v) => setIsTimed(v === true)}
          />
          <label htmlFor="queue-timed" className="due-soon-toggle-label cursor-pointer text-sm font-medium text-white/85">
            Timed session
          </label>
          {isTimed && (
            <>
              <input
                type="number"
                min={1}
                max={180}
                className="queue-number-input"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(e.target.value)}
                aria-label="Timer minutes"
              />
              <span className="text-sm text-white/60">min</span>
            </>
          )}
        </div>
        <p className="due-soon-toggle-hint text-sm text-white/45">
          Cards you haven&apos;t rated when the timer ends count as Complete Struggle.
        </p>
      </div>
    </div>
  );

  const renderActionPanel = () => {
    if (!isStudyQueueMethod) {
      return (
        <div className="action-panel">
          <div className="action-panel-header">
            <h2 className="action-panel-title">Ready to study?</h2>
            <p className="action-panel-subtitle">
              Review {selectedDeck ? `cards in ${selectedDeck.title}` : 'all of your cards'} with {selectedStudyMethod.title}.
            </p>
          </div>
          <div className="action-buttons">
            <button type="button" className="start-review-button" onClick={handleStartReview}>
              <span>Start Review Session ({selectedCards.length} Cards)</span>
            </button>
          </div>
          <div className="review-options" />
        </div>
      );
    }

    const generateLabel = queue
      ? `Replace with queue for ${scopeLabel(selectedDeckId)}`
      : `Generate Study Queue for ${scopeLabel(selectedDeckId)}`;

    return (
      <div className="action-panel">
        <div className="action-panel-header">
          <h2 className="action-panel-title">{queue ? 'Ready to study?' : 'Build your Study Queue'}</h2>
          <p className="action-panel-subtitle">
            {queue
              ? `Study Queue for ${scopeLabel(queue.deck_id)}: ${studyableQueueCards.length} of ${queue.cards.length} cards available${
                  queue.is_timed && queue.timer_seconds ? ` · ${Math.round(queue.timer_seconds / 60)} min timer` : ''
                }`
              : 'Cards are picked by bucket, favoring the ones you struggle with.'}
          </p>
        </div>

        <div className="action-buttons queue-action-buttons">
          {queue && (
            <button
              type="button"
              className="start-review-button"
              onClick={handleStartReview}
              disabled={busy || studyableQueueCards.length === 0}
            >
              <span>Start Review Session ({studyableQueueCards.length} Cards)</span>
            </button>
          )}
          {(!queue || !queueMatchesSelection) && (
            <button
              type="button"
              className={queue ? 'queue-secondary-button' : 'start-review-button'}
              onClick={handleGenerateQueue}
              disabled={busy}
            >
              {queue ? <FiRefreshCw /> : <FiPlus />}
              <span>{generateLabel}</span>
            </button>
          )}
          {queue && (
            <button type="button" className="queue-secondary-button danger" onClick={handleDismissQueue} disabled={busy}>
              <FiTrash2 />
              <span>Dismiss Queue</span>
            </button>
          )}
        </div>

        {(!queue || !queueMatchesSelection) ? renderQueueOptions() : <div className="review-options" />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="review-widget">
        <div className="loading-container">
          <BrainLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="review-page-container">
      <div className="review-page-content">
        <div className="review-widget">
          <div className="card-preview-section">
            {renderTabs()}
            <div className="card-content-area">
              <div className="scrollable-card-list">{renderTabContent()}</div>
            </div>
          </div>
          {renderActionPanel()}
        </div>
      </div>
    </div>
  );
};

export default ReviewWidget;
