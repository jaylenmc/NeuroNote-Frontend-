import api from './axios';

/** GET /flashcards/deck/ returns a JSON array; 404 when the user has no decks. */
export function normalizeDeckList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.decks)) return data.decks;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export function getDeckApiErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.Message) return data.Message;
  if (data.Error) return data.Error;
  if (data.detail) {
    return typeof data.detail === 'string' ? data.detail : String(data.detail);
  }
  if (data.title) {
    return Array.isArray(data.title) ? data.title.join(' ') : String(data.title);
  }
  return fallback;
}

export async function fetchDecks() {
  try {
    const { data } = await api.get('/flashcards/deck/');
    return normalizeDeckList(data);
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
}

export async function fetchDeckById(deckId) {
  const { data } = await api.get(`/flashcards/deck/${deckId}/`);
  return data;
}

export async function createDeck(payload) {
  const { data } = await api.post('/flashcards/deck/', payload);
  return data;
}

export async function updateDeck(deckId, payload) {
  const { data } = await api.patch(`/flashcards/deck/${deckId}/`, payload);
  return data;
}

export async function deleteDeck(deckId) {
  const { data } = await api.delete(`/flashcards/deck/${deckId}/`);
  return data;
}

/** DELETE /flashcards/deck/ with body { deck_ids: number[] } */
export async function bulkDeleteDecks(deckIds) {
  const { data } = await api.delete('/flashcards/deck/', {
    data: { deck_ids: deckIds },
  });
  return data;
}
