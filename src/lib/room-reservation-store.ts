import { query } from "@/lib/db";
import type { RoomReservation } from "@/app/types/room-reservation";

function toRoomReservation(r: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  notes: string;
  status: string;
  paymentMethod: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}): RoomReservation {
  return {
    ...r,
    status: r.status as RoomReservation["status"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readAllRoomReservations(): Promise<RoomReservation[]> {
  const rows = await query('SELECT * FROM room_reservations ORDER BY createdAt DESC');
  return rows.map(toRoomReservation);
}

export async function readPendingRoomReservationsCount(): Promise<number> {
  const rows = await query('SELECT COUNT(*) as count FROM room_reservations WHERE status = ?', ['pending']);
  return (rows[0] as { count: number }).count;
}

/**
 * Check if a room is available for given dates.
 * Returns true if no overlapping non-cancelled reservations exist.
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string
): Promise<boolean> {
  let sql = `
    SELECT id FROM room_reservations
    WHERE roomId = ?
      AND status != 'cancelled'
      AND checkIn < ?
      AND checkOut > ?
  `;
  const params: unknown[] = [roomId, checkOut, checkIn];

  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }

  sql += ' LIMIT 1';

  const overlapping = await query(sql, params);
  return overlapping.length === 0;
}

export async function readRoomReservationById(id: string): Promise<RoomReservation | null> {
  const rows = await query('SELECT * FROM room_reservations WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return toRoomReservation(rows[0]);
}

export async function readRoomReservationsByStatus(status?: string): Promise<RoomReservation[]> {
  if (status) {
    const rows = await query('SELECT * FROM room_reservations WHERE status = ? ORDER BY createdAt DESC', [status]);
    return rows.map(toRoomReservation);
  }
  return readAllRoomReservations();
}

export async function createRoomReservation(data: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  notes: string;
  paymentMethod: string;
}): Promise<RoomReservation> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO room_reservations (id, customerName, customerPhone, customerEmail, roomId, roomName, checkIn, checkOut, guests, notes, paymentMethod, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.customerName, data.customerPhone, data.customerEmail, data.roomId, data.roomName, data.checkIn, data.checkOut, data.guests, data.notes, data.paymentMethod, 'pending', new Date()]
  );
  const created = await readRoomReservationById(id);
  if (!created) throw new Error('Failed to create room reservation');
  return created;
}

export async function updateRoomReservation(id: string, data: Partial<{
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  notes: string;
  status: string;
  paymentMethod: string;
}>): Promise<RoomReservation | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length > 0) {
    fields.push('updatedAt = ?');
    values.push(new Date());
    values.push(id);
    await query(`UPDATE room_reservations SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return readRoomReservationById(id);
}

export async function deleteRoomReservation(id: string): Promise<void> {
  await query('DELETE FROM room_reservations WHERE id = ?', [id]);
}

// Calendar: Query by date range (overlapping logic)
export async function readRoomReservationsByDateRange(
  startDate: string,
  endDate: string,
  status?: string
): Promise<RoomReservation[]> {
  let sql = `
    SELECT * FROM room_reservations
    WHERE checkIn < ?
      AND checkOut > ?
  `;
  const params: unknown[] = [endDate, startDate];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY checkIn ASC';
  const rows = await query(sql, params);
  return rows.map(toRoomReservation);
}
