import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({ highlightedDates = [] }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const today = new Date();

  const { monthLabel, grid } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const leading = monthStart.getDay();
    const totalDays = monthEnd.getDate();

    const cells = [];
    for (let i = 0; i < leading; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return {
      monthLabel: viewDate.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
      grid: cells,
    };
  }, [viewDate]);

  const highlightSet = useMemo(
    () =>
      highlightedDates.map((entry) =>
        entry instanceof Date ? entry : new Date(entry),
      ),
    [highlightedDates],
  );

  return (
    <div className="ui-calendar">
      <div className="ui-calendar-head">
        <button
          className="ui-calendar-nav"
          onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          type="button"
        >
          <ChevronLeft size={14} />
        </button>
        <strong>{monthLabel}</strong>
        <button
          className="ui-calendar-nav"
          onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          type="button"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="ui-calendar-grid ui-calendar-grid-head">
        {WEEK_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="ui-calendar-grid">
        {grid.map((dateObj, index) => {
          if (!dateObj) return <span className="ui-calendar-empty" key={`empty-${index}`} />;
          const isToday = sameDay(dateObj, today);
          const isHighlighted = highlightSet.some((d) => sameDay(d, dateObj));
          return (
            <button
              className={`ui-calendar-day ${isToday ? 'is-today' : ''} ${isHighlighted ? 'is-highlighted' : ''}`.trim()}
              key={dateObj.toISOString()}
              type="button"
            >
              <span>{dateObj.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

