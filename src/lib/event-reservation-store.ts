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

// Calendar: Query with JOIN to events table to get event dates
export async function readEventReservationsByDateRange(
  startDate: string,
  endDate: string,
  status?: string
): Promise<(EventReservation & { eventDay?: string; eventMonth?: string; eventTime?: string })[]> {
  let sql = `
    SELECT er.*, e.day as eventDay, e.month as eventMonth, e.time as eventTime
    FROM event_reservations er
    LEFT JOIN events e ON er.eventId = e.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (status) {
    sql += ' AND er.status = ?';
    params.push(status);
  }

  // Note: Filtering by date range will be done in calendar-store.ts after parsing month/day strings
  // We return all event reservations here (could add year filter if needed for performance)
  sql += ' ORDER BY er.createdAt DESC';

  const rows = await query(sql, params);

  return rows.map((r: any) => ({
    ...toEventReservation(r),
    eventDay: r.eventDay || null,
    eventMonth: r.eventMonth || null,
    eventTime: r.eventTime || null,
  }));
}

export async function readEventReservationById(id: string): Promise<EventReservation | null> {
  const rows = await query('SELECT * FROM event_reservations WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return toEventReservation(rows[0]);
}

export async function createEventReservation(data: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventId: string;
  eventTitle: string;
  attendees: string;
  notes: string;
  paymentMethod: string;
}): Promise<EventReservation> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO event_reservations (id, customerName, customerPhone, customerEmail, eventId, eventTitle, attendees, notes, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.customerName, data.customerPhone, data.customerEmail, data.eventId, data.eventTitle, data.attendees, data.notes, data.paymentMethod, 'pending']
  );
  const created = await readEventReservationById(id);
  if (!created) throw new Error('Failed to create event reservation');
  return created;
}

export async function updateEventReservation(id: string, data: Partial<{
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventId: string;
  eventTitle: string;
  attendees: string;
  notes: string;
  status: string;
  paymentMethod: string;
}>): Promise<EventReservation | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length > 0) {
    values.push(id);
    await query(`UPDATE event_reservations SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return readEventReservationById(id);
}

export async function deleteEventReservation(id: string): Promise<void> {
  await query('DELETE FROM event_reservations WHERE id = ?', [id]);
}
