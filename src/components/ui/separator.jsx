import React from 'react';

export function Separator({
  orientation = 'horizontal',
  className = '',
  decorative = true,
}) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={`ui-separator ${isVertical ? 'ui-separator-vertical' : 'ui-separator-horizontal'} ${className}`.trim()}
    />
  );
}

