import { useState, useCallback } from 'react';
import { startOfMonth } from 'date-fns';
import { previousMonth, nextMonth } from '../utils/calendarHelpers';

export function useCalendarNavigation(initialDate: Date = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => previousMonth(prev));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => nextMonth(prev));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToMonth = useCallback((date: Date) => {
    setCurrentDate(startOfMonth(date));
  }, []);

  return {
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    goToMonth,
  };
}
