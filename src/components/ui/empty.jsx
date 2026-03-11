import React from 'react';

export function Empty({ title = 'Nothing here yet', description = 'Content will appear here when available.' }) {
  return (
    <div className="ui-empty">
      <p className="ui-empty-title">{title}</p>
      <p className="ui-empty-description">{description}</p>
    </div>
  );
}

