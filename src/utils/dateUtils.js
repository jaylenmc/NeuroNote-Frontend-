/**
 * Date display helpers for backend (UTC) datetimes.
 */

/** Converts a backend UTC datetime string to a YYYY-MM-DD date string. */
const convertBackendDateToLocal = (dateString) => {
  if (!dateString) return null;

  const utcDate = new Date(dateString);
  if (isNaN(utcDate.getTime())) {
    console.warn('Invalid date string:', dateString);
    return null;
  }

  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Formats a backend datetime as a long date (e.g. "Monday, October 5, 2026").
 * @param {string} dateString - Datetime string from backend (UTC)
 * @param {Object} options - Options for toLocaleDateString
 */
export const formatDateForDisplay = (dateString, options = {}) => {
  if (!dateString) return '';

  const localDateString = convertBackendDateToLocal(dateString);
  if (!localDateString) {
    console.warn('Invalid date string for display:', dateString);
    return '';
  }

  const date = new Date(localDateString + 'T00:00:00');

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });
};

/**
 * Formats a backend datetime with the time included.
 * @param {string} dateString - Datetime string from backend (UTC)
 * @param {Object} options - Options for toLocaleString
 */
export const formatDateTimeForDisplay = (dateString, options = {}) => {
  if (!dateString) return '';
  try {
    const utcDate = new Date(dateString);
    if (isNaN(utcDate.getTime())) {
      console.warn('Invalid date string for display:', dateString);
      return '';
    }
    return utcDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options
    });
  } catch (error) {
    console.warn('Error formatting date with time:', error);
    return formatDateForDisplay(dateString, options);
  }
};

/** Study Queue blacklist window after a review (matches backend BLACKLIST_DURATION). */
export const STUDY_QUEUE_BLACKLIST_MS = 60 * 60 * 1000;

/** When the card becomes eligible again: last review + 1 hour. */
export function getStudyQueueBlacklistEndsAt(lastReviewDate) {
  if (!lastReviewDate) return null;
  const reviewedAt = new Date(lastReviewDate);
  if (Number.isNaN(reviewedAt.getTime())) return null;
  return new Date(reviewedAt.getTime() + STUDY_QUEUE_BLACKLIST_MS);
}

/** Remaining time until blacklist ends; null if unknown or already elapsed. */
export function formatStudyQueueBlacklistCountdown(endsAt, now = new Date()) {
  if (!endsAt) return null;
  const remainingMs = endsAt.getTime() - now.getTime();
  if (remainingMs <= 0) return null;

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
