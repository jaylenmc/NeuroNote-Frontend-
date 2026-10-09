export const BUCKETS = {
  bkt_0: {
    key: 'bkt_0',
    value: 0,
    label: 'New',
    description: 'You have not reviewed it yet.',
    color: '#38bdf8',
  },
  bkt_1: {
    key: 'bkt_1',
    value: 1,
    label: 'Complete Struggle',
    description: 'You could not come up with an answer.',
    color: '#f43f5e',
  },
  bkt_2: {
    key: 'bkt_2',
    value: 2,
    label: 'Poor',
    description: 'You got there, but it took a long time.',
    color: '#f59e42',
  },
  bkt_3: {
    key: 'bkt_3',
    value: 3,
    label: 'Good',
    description: 'Correct, but not instant.',
    color: '#7c3aed',
  },
  bkt_4: {
    key: 'bkt_4',
    value: 4,
    label: 'Easy',
    description: 'You answered almost immediately.',
    color: '#db2777',
  },
};

export const BUCKET_LIST = Object.values(BUCKETS);

/** Ratings a user can give after reviewing a card (bucket 0 is reserved for new cards). */
export const RATING_OPTIONS = BUCKET_LIST.filter((bucket) => bucket.value > 0);

export const BLACKLISTED_LABEL = 'Blacklisted';

/** True when the card must not be manually added to a Study Queue. */
export function isStudyQueueAddBlocked(card) {
  if (!card) return true;
  if (card.is_blacklisted) return true;
  if (card.slot_label === BLACKLISTED_LABEL) return true;
  return false;
}

export function getBucketInfo(bucket) {
  return BUCKETS[bucket] || BUCKETS.bkt_0;
}

export function bucketKeyFromRating(rating) {
  return `bkt_${rating}`;
}
