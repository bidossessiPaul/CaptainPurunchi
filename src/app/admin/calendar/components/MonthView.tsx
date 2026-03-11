import { useMemo } from 'react';
import { isSameDay } from 'date-fns';
import type { UnifiedCalendarEvent } from '../types';
import {
  getMonthGridDays,
  getWeekdayNames,
  isInCurrentMonth,
  isTodayDate,
  getDensityClass,
} from '../utils/calendarHelpers';
import styles from '../calendar.module.css';

interface MonthViewProps {
  currentDate: Date;
  events: UnifiedCalendarEvent[];
  loading: boolean;
  error: string | null;
  onDateClick?: (date: Date) => void;
}

export default function MonthView({ currentDate, events, loading, error, onDateClick }: MonthViewProps) {
  // Generate calendar grid days (42 days = 6 weeks)
  const gridDays = useMemo(() => getMonthGridDays(currentDate), [currentDate]);

  // Group events by date for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, UnifiedCalendarEvent[]>();

    events.forEach(event => {
      // For room reservations (multi-day), add to each day in the range
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Iterate through all days this event spans
      let currentDay = new Date(eventStart);
      currentDay.setHours(0, 0, 0, 0); // Start of day

      const endDay = new Date(eventEnd);
      endDay.setHours(0, 0, 0, 0); // Start of day

      while (currentDay <= endDay) {
        const dateKey = currentDay.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }

        // Avoid duplicates (same event, same date)
        const dayEvents = map.get(dateKey)!;
        if (!dayEvents.some(e => e.id === event.id)) {
          dayEvents.push(event);
        }

        // Move to next day
        currentDay.setDate(currentDay.getDate() + 1);
      }
    });

    return map;
  }, [events]);

  // Get events for a specific day
  const getEventsForDay = (day: Date): UnifiedCalendarEvent[] => {
    const dateKey = day.toISOString().split('T')[0];
    return eventsByDate.get(dateKey) || [];
  };

  // Count events by type for a day
  const getEventCounts = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    return {
      table: dayEvents.filter(e => e.type === 'table').length,
      room: dayEvents.filter(e => e.type === 'room').length,
      event: dayEvents.filter(e => e.type === 'event').length,
      total: dayEvents.length,
    };
  };

  // Handle date click
  const handleDateClick = (day: Date) => {
    if (onDateClick) {
      onDateClick(day);
    } else {
      // Default: Navigate to reservations page with date filter
      const dateStr = day.toISOString().split('T')[0];
      window.location.href = `/admin/reservations?date=${dateStr}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>
          <i className="fa-solid fa-spinner"></i>
        </div>
        <p className="text-muted">Chargement du calendrier...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.error}>
        <i className="fa-solid fa-circle-exclamation fs-1 mb-3"></i>
        <p className="mb-0">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.calendarMonthGrid}>
        {/* Weekday headers */}
        {getWeekdayNames().map(day => (
          <div key={day} className={styles.weekdayHeader}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {gridDays.map((day, index) => {
          const counts = getEventCounts(day);
          const isOtherMonth = !isInCurrentMonth(day, currentDate);
          const isToday = isTodayDate(day);
          const densityClass = getDensityClass(counts.total);

          return (
            <div
              key={index}
              className={`
                ${styles.calendarCell}
                ${isOtherMonth ? styles.otherMonth : ''}
                ${isToday ? styles.today : ''}
                ${styles[densityClass]}
              `}
              onClick={() => handleDateClick(day)}
            >
              {/* Date number */}
              <span className={styles.dateNumber}>{day.getDate()}</span>

              {/* Today badge */}
              {isToday && (
                <span className={`badge bg-warning text-dark ${styles.todayBadge}`}>
                  Aujourd'hui
                </span>
              )}

              {/* Event count badges */}
              {counts.total > 0 && (
                <div className={styles.eventBadges}>
                  {counts.table > 0 && (
                    <span className="badge bg-primary" title={`${counts.table} réservation${counts.table > 1 ? 's' : ''} table`}>
                      <i className="fa-solid fa-utensils me-1"></i>{counts.table}
                    </span>
                  )}
                  {counts.room > 0 && (
                    <span className="badge bg-warning text-dark" title={`${counts.room} réservation${counts.room > 1 ? 's' : ''} chambre`}>
                      <i className="fa-solid fa-bed me-1"></i>{counts.room}
                    </span>
                  )}
                  {counts.event > 0 && (
                    <span className="badge" style={{ backgroundColor: '#FF6B6B', color: 'white' }} title={`${counts.event} réservation${counts.event > 1 ? 's' : ''} événement`}>
                      <i className="fa-solid fa-people-group me-1"></i>{counts.event}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-3 text-muted small">
        <i className="fa-solid fa-info-circle me-1"></i>
        {events.length} réservation{events.length > 1 ? 's' : ''} ce mois
      </div>
    </div>
  );
}
