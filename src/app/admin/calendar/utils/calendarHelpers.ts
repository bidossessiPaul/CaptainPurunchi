import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Get all days to display in a month calendar grid (42 cells = 6 weeks × 7 days)
 * Includes days from previous/next months to fill the grid
 */
export function getMonthGridDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Get calendar grid boundaries (start on Monday, end on Sunday)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });       // Sunday

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

/**
 * Format date for display
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: fr });
}

/**
 * Navigate to previous month
 */
export function previousMonth(date: Date): Date {
  return subMonths(date, 1);
}

/**
 * Navigate to next month
 */
export function nextMonth(date: Date): Date {
  return addMonths(date, 1);
}

/**
 * Check if date is in current month
 */
export function isInCurrentMonth(day: Date, currentMonth: Date): boolean {
  return isSameMonth(day, currentMonth);
}

/**
 * Check if two dates are the same day
 */
export function isSameDayAs(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Check if date is today
 */
export function isTodayDate(date: Date): boolean {
  return isToday(date);
}

/**
 * Format date to YYYY-MM-DD for API queries
 */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get weekday names (Mon-Sun)
 */
export function getWeekdayNames(): string[] {
  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
}

/**
 * Calculate density class based on event count
 */
export function getDensityClass(count: number): string {
  if (count === 0) return 'density-0';
  if (count <= 3) return 'density-low';
  if (count <= 6) return 'density-medium';
  return 'density-high';
}
