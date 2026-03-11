import { parse, addHours } from 'date-fns';
import type { TableReservation } from "@/app/types/table-reservation";
import type { RoomReservation } from "@/app/types/room-reservation";
import type { EventReservation } from "@/app/types/event-reservation";
import type { UnifiedCalendarEvent } from "../types";

// Month name → number mapping (French)
const MONTH_MAP: Record<string, number> = {
  "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3,
  "Mai": 4, "Juin": 5, "Juillet": 6, "Août": 7,
  "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11
};

// Parse time string: "20h00" → "20:00"
function parseEventTime(time: string): string {
  return time.replace('h', ':');
}

/**
 * Transform TableReservation to UnifiedCalendarEvent
 * - Parses date (YYYY-MM-DD) + time (HH:MM) to Date object
 * - End = start + 2 hours (default table reservation duration)
 */
export function tableReservationToEvent(r: TableReservation): UnifiedCalendarEvent {
  // date: "2026-03-15", time: "19:30"
  const start = parse(`${r.date} ${r.time}`, 'yyyy-MM-dd HH:mm', new Date());
  const end = addHours(start, 2); // Default 2-hour duration

  return {
    id: r.id,
    type: "table",
    title: r.name,
    start,
    end,
    status: r.status,
    color: "#5BC0EB", // Primary blue (tables)
    customerName: r.name,
    customerPhone: r.phone,
    customerEmail: r.email,
    details: `${r.numberOfPersons} personne${parseInt(r.numberOfPersons) > 1 ? 's' : ''}`,
    rawData: r,
  };
}

/**
 * Transform RoomReservation to UnifiedCalendarEvent
 * - Parses checkIn/checkOut dates with default times (14:00 / 11:00)
 * - Represents multi-day stay
 */
export function roomReservationToEvent(r: RoomReservation): UnifiedCalendarEvent {
  // checkIn: "2026-03-15", checkOut: "2026-03-17"
  const start = parse(`${r.checkIn} 14:00`, 'yyyy-MM-dd HH:mm', new Date()); // Check-in at 14:00
  const end = parse(`${r.checkOut} 11:00`, 'yyyy-MM-dd HH:mm', new Date());   // Check-out at 11:00

  return {
    id: r.id,
    type: "room",
    title: r.customerName,
    start,
    end,
    status: r.status,
    color: "#FFC857", // Warning yellow (rooms)
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    details: `${r.roomName} • ${r.guests} voyageur${parseInt(r.guests) > 1 ? 's' : ''}`,
    rawData: r,
  };
}

/**
 * Transform EventReservation to UnifiedCalendarEvent
 * - Requires eventDay, eventMonth, eventTime from JOIN with events table
 * - Fallback to createdAt if event date fields are missing
 * - End = start + 3 hours (default event duration)
 */
export function eventReservationToEvent(
  r: EventReservation & { eventDay?: string; eventMonth?: string; eventTime?: string }
): UnifiedCalendarEvent {
  let start: Date;

  // Primary: Use event date fields if available
  if (r.eventDay && r.eventMonth) {
    const month = MONTH_MAP[r.eventMonth] ?? 0;
    const day = parseInt(r.eventDay, 10) || 1;
    const year = new Date().getFullYear();
    const timeStr = r.eventTime ? parseEventTime(r.eventTime) : '20:00';

    try {
      start = parse(`${year}-${month + 1}-${day} ${timeStr}`, 'yyyy-M-d HH:mm', new Date());
    } catch {
      // Fallback if parsing fails
      start = new Date(r.createdAt);
    }
  } else {
    // Fallback: Use createdAt if no event date fields
    start = new Date(r.createdAt);
  }

  const end = addHours(start, 3); // Default 3-hour event duration

  return {
    id: r.id,
    type: "event",
    title: r.eventTitle,
    start,
    end,
    status: r.status,
    color: "#FF6B6B", // Coral/info (events)
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    details: `${r.attendees || '?'} participant${parseInt(r.attendees || '1') > 1 ? 's' : ''}`,
    rawData: r,
  };
}
