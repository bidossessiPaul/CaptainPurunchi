import { readTableReservationsByDateRange } from "./table-reservation-store";
import { readRoomReservationsByDateRange } from "./room-reservation-store";
import { readEventReservationsByDateRange } from "./event-reservation-store";
import {
  tableReservationToEvent,
  roomReservationToEvent,
  eventReservationToEvent,
} from "@/app/admin/calendar/utils/eventTransformers";
import type { UnifiedCalendarEvent } from "@/app/admin/calendar/types";
import { isWithinInterval, parseISO } from 'date-fns';

/**
 * Get all unified calendar events for a date range
 * @param startDate YYYY-MM-DD
 * @param endDate YYYY-MM-DD
 * @param type Filter by reservation type (all, table, room, event)
 * @param status Filter by status (optional)
 * @returns Array of UnifiedCalendarEvent sorted by start date
 */
export async function getUnifiedCalendarEvents(
  startDate: string,
  endDate: string,
  type: 'all' | 'table' | 'room' | 'event' = 'all',
  status?: string
): Promise<UnifiedCalendarEvent[]> {
  const events: UnifiedCalendarEvent[] = [];

  // Parse date range for filtering
  const rangeStart = parseISO(startDate + 'T00:00:00');
  const rangeEnd = parseISO(endDate + 'T23:59:59');

  // Fetch table reservations
  if (type === 'all' || type === 'table') {
    const tables = await readTableReservationsByDateRange(startDate, endDate, status);
    events.push(...tables.map(tableReservationToEvent));
  }

  // Fetch room reservations
  if (type === 'all' || type === 'room') {
    const rooms = await readRoomReservationsByDateRange(startDate, endDate, status);
    events.push(...rooms.map(roomReservationToEvent));
  }

  // Fetch event reservations (with date filtering in JS)
  if (type === 'all' || type === 'event') {
    const eventReservations = await readEventReservationsByDateRange(startDate, endDate, status);
    const eventEvents = eventReservations
      .map(eventReservationToEvent)
      .filter(event => {
        // Filter by date range (since SQL query can't filter on parsed month/day)
        return isWithinInterval(event.start, { start: rangeStart, end: rangeEnd });
      });
    events.push(...eventEvents);
  }

  // Sort by start date ascending
  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  return events;
}

/**
 * Get occupancy summary for date range (future feature)
 * Returns count of reservations per day
 */
export async function getOccupancySummary(
  startDate: string,
  endDate: string
): Promise<Map<string, { tableCount: number; roomCount: number; eventCount: number }>> {
  const events = await getUnifiedCalendarEvents(startDate, endDate, 'all');
  const summary = new Map<string, { tableCount: number; roomCount: number; eventCount: number }>();

  events.forEach(event => {
    const dateKey = event.start.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!summary.has(dateKey)) {
      summary.set(dateKey, { tableCount: 0, roomCount: 0, eventCount: 0 });
    }

    const daySummary = summary.get(dateKey)!;
    if (event.type === 'table') daySummary.tableCount++;
    if (event.type === 'room') daySummary.roomCount++;
    if (event.type === 'event') daySummary.eventCount++;
  });

  return summary;
}
