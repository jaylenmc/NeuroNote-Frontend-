import api from './axios';

const BASE = '/flashcards/study-queue';

/** Returns the active Study Queue, or null when the user has none. */
export async function getCurrentStudyQueue() {
  try {
    const { data } = await api.get(`${BASE}/current/`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export async function getStudyQueue(groupId) {
  const { data } = await api.get(`${BASE}/${groupId}/`);
  return data;
}

/**
 * Generates a Study Queue for one deck (deckId) or for all cards (deckId null).
 * timerSeconds > 0 makes the queue timed.
 */
export async function startStudyQueue({ deckId = null, groupSize, timerSeconds = null, replaceExisting = false }) {
  const body = {
    ...(deckId ? { deck_id: deckId } : { scope: 'all_cards' }),
    is_timed: Boolean(timerSeconds),
    timer_seconds: timerSeconds || null,
    replace_existing: replaceExisting,
  };
  if (groupSize) body.group_size = groupSize;
  const { data } = await api.post(`${BASE}/start/`, body);
  return data;
}

export async function dismissStudyQueue() {
  await api.delete(`${BASE}/current/`);
}

export async function addCardToStudyQueue(cardId) {
  const { data } = await api.post(`${BASE}/cards/`, { card_id: cardId });
  return data;
}

export async function removeCardFromStudyQueue(cardId) {
  const { data } = await api.delete(`${BASE}/cards/${cardId}/`);
  return data;
}

/** Normalized `/cards/due/` response: `{ cards, studyGroupId, bucketCounts }`. */
export async function getDueCards() {
  const { data } = await api.get('/flashcards/cards/due/');
  return {
    cards: Array.isArray(data?.cards) ? data.cards : [],
    studyGroupId: data?.study_group_id ?? null,
    bucketCounts: data?.bucket_counts ?? {},
  };
}

function formatSessionTime(totalSeconds) {
  const safe = Math.max(0, Math.min(Math.floor(totalSeconds), 24 * 3600 - 1));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * Submits a review session.
 * review: [{ card_id, deck_id, bucket (1-4) }]
 */
export async function submitReview({ sessionSeconds, review, studyGroupId = null, timedOutCardIds = [] }) {
  const body = {
    session_time: formatSessionTime(sessionSeconds),
    review,
  };
  if (studyGroupId) body.study_group_id = studyGroupId;
  if (timedOutCardIds.length) body.timed_out_card_ids = timedOutCardIds;
  const { data } = await api.put('/flashcards/review/', body);
  return data;
}

const MAX_ERROR_MESSAGE_LENGTH = 280;

function isUnusableErrorString(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length > MAX_ERROR_MESSAGE_LENGTH) return true;
  const lower = trimmed.slice(0, 64).toLowerCase();
  return lower.startsWith('<!doctype') || lower.startsWith('<html');
}

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (typeof data === 'string') {
    return isUnusableErrorString(data) ? fallback : data;
  }
  return data?.Message || data?.Error || data?.detail || fallback;
}
