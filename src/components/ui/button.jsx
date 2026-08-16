import React from 'react';

export function Button({
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`ui-button ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

