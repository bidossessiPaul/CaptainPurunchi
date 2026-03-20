import { query } from "@/lib/db";
import type { TableReservation } from "@/app/types/table-reservation";

function toTableReservation(r: {
  id: string;
  name: string;
  phone: string;
  email: string;
  numberOfPersons: string;
  date: string;
  time: string;
  message: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}): TableReservation {
  return {
    ...r,
    status: r.status as TableReservation["status"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readAllTableReservations(): Promise<TableReservation[]> {
  const rows = await query('SELECT * FROM table_reservations ORDER BY createdAt DESC');
  return rows.map(toTableReservation);
}

export async function readTableReservationsByDate(date: string): Promise<TableReservation[]> {
  const rows = await query('SELECT * FROM table_reservations WHERE date = ? ORDER BY createdAt DESC', [date]);
  return rows.map(toTableReservation);
}

export async function readPendingTableReservationsCount(): Promise<number> {
  const rows = await query('SELECT COUNT(*) as count FROM table_reservations WHERE status = ?', ['pending']);
  return (rows[0] as { count: number }).count;
}

export async function readTableReservationById(id: string): Promise<TableReservation | null> {
  const rows = await query('SELECT * FROM table_reservations WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return toTableReservation(rows[0]);
}

export async function readTableReservationsByFilters(filters: { date?: string; status?: string }): Promise<TableReservation[]> {
  let sql = 'SELECT * FROM table_reservations WHERE 1=1';
  const params: unknown[] = [];

  if (filters.date) {
    sql += ' AND date = ?';
    params.push(filters.date);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  sql += ' ORDER BY createdAt DESC';
  const rows = await query(sql, params);
  return rows.map(toTableReservation);
}

export async function createTableReservation(data: {
  name: string;
  phone: string;
  email: string;
  numberOfPersons: string;
  date: string;
  time: string;
  message: string;
  paymentMethod: string;
}): Promise<TableReservation> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO table_reservations (id, name, phone, email, numberOfPersons, date, time, message, paymentMethod, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.phone, data.email, data.numberOfPersons, data.date, data.time, data.message, data.paymentMethod, 'pending', new Date()]
  );
  const created = await readTableReservationById(id);
  if (!created) throw new Error('Failed to create table reservation');
  return created;
}

export async function updateTableReservation(id: string, data: Partial<{
  name: string;
  phone: string;
  email: string;
  numberOfPersons: string;
  date: string;
  time: string;
  message: string;
  status: string;
  paymentMethod: string;
}>): Promise<TableReservation | null> {
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
    await query(`UPDATE table_reservations SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return readTableReservationById(id);
}

export async function deleteTableReservation(id: string): Promise<void> {
  await query('DELETE FROM table_reservations WHERE id = ?', [id]);
}

// Calendar: Query by date range
export async function readTableReservationsByDateRange(
  startDate: string,
  endDate: string,
  status?: string
): Promise<TableReservation[]> {
  let sql = 'SELECT * FROM table_reservations WHERE date BETWEEN ? AND ?';
  const params: unknown[] = [startDate, endDate];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY date ASC, time ASC';
  const rows = await query(sql, params);
  return rows.map(toTableReservation);
}
