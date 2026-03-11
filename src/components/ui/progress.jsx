import React from 'react';

export function Progress({
  value = 0,
  className = '',
  indicatorClassName = '',
  ...props
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={`ui-progress ${className}`.trim()}
      role="progressbar"
      {...props}
    >
      <div
        className={`ui-progress-indicator ${indicatorClassName}`.trim()}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

