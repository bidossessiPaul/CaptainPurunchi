import { query } from "@/lib/db";
import type { EventReservation } from "@/app/types/event-reservation";

function toEventReservation(r: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventId: string;
  eventTitle: string;
  attendees: string;
  notes: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}): EventReservation {
  return {
    ...r,
    status: r.status as EventReservation["status"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readAllEventReservations(): Promise<EventReservation[]> {
  const rows = await query('SELECT * FROM event_reservations ORDER BY createdAt DESC');
  return rows.map(toEventReservation);
}

export async function readPendingEventReservationsCount(): Promise<number> {
  const rows = await query('SELECT COUNT(*) as count FROM event_reservations WHERE status = ?', ['pending']);
  return (rows[0] as { count: number }).count;
}
