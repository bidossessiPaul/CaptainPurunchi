import { useState, useEffect, useCallback } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { formatDateForAPI } from '../utils/calendarHelpers';
import type { UnifiedCalendarEvent } from '../types';

interface UseCalendarDataOptions {
  currentDate: Date;
  type: 'all' | 'table' | 'room' | 'event';
  status: string;
}

export function useCalendarData({ currentDate, type, status }: UseCalendarDataOptions) {
  const [events, setEvents] = useState<UnifiedCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const start = formatDateForAPI(startOfMonth(currentDate));
      const end = formatDateForAPI(endOfMonth(currentDate));

      const params = new URLSearchParams({
        start,
        end,
        type,
      });

      if (status && status !== 'all') {
        params.set('status', status);
      }

      const response = await fetch(`/api/calendar/reservations?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar data: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse ISO date strings back to Date objects
      const eventsWithDates: UnifiedCalendarEvent[] = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setEvents(eventsWithDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, type, status]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}
