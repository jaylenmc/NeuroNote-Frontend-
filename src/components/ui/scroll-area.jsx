import React from 'react';

export function ScrollArea({ className = '', children }) {
  return (
    <div className={`ui-scroll-area ${className}`.trim()}>
      <div className="ui-scroll-area-viewport">{children}</div>
    </div>
  );
}

