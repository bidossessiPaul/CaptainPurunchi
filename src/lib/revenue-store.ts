import { query } from "@/lib/db";
import type { Revenue } from "@/app/types/revenue";

function toRevenue(r: {
  id: string;
  amount: number;
  source: string;
  sourceId: string;
  description: string;
  paymentMethod: string;
  date: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Revenue {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readRevenues(filters?: {
  dateFrom?: string;
  dateTo?: string;
  source?: string;
}): Promise<Revenue[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.source) {
    conditions.push('source = ?');
    params.push(filters.source);
  }
  if (filters?.dateFrom) {
    conditions.push('date >= ?');
    params.push(filters.dateFrom);
  }
  if (filters?.dateTo) {
    conditions.push('date <= ?');
    params.push(filters.dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query(`SELECT * FROM revenues ${whereClause} ORDER BY date DESC`, params);
  return rows.map(toRevenue);
}

export async function readRevenueById(id: string): Promise<Revenue | null> {
  const rows = await query('SELECT * FROM revenues WHERE id = ?', [id]);
  return rows[0] ? toRevenue(rows[0]) : null;
}

export async function createRevenue(data: {
  amount: number;
  source: string;
  sourceId?: string;
  description: string;
  paymentMethod?: string;
  date: string;
  createdBy?: string;
}): Promise<Revenue> {
  const result = await query('INSERT INTO revenues SET ?', [{ ...data, updatedAt: new Date() }]);
  const rows = await query('SELECT * FROM revenues WHERE id = ?', [(result as { insertId: string }).insertId]);
  return toRevenue(rows[0]);
}

export async function updateRevenue(
  id: string,
  data: Partial<{
    amount: number;
    source: string;
    sourceId: string;
    description: string;
    paymentMethod: string;
    date: string;
  }>
): Promise<Revenue> {
  await query('UPDATE revenues SET ? WHERE id = ?', [{ ...data, updatedAt: new Date() }, id]);
  const rows = await query('SELECT * FROM revenues WHERE id = ?', [id]);
  return toRevenue(rows[0]);
}

export async function deleteRevenue(id: string): Promise<void> {
  await query('DELETE FROM revenues WHERE id = ?', [id]);
}

export async function sumRevenueByPeriod(dateFrom: string, dateTo: string) {
  const rows = await query(
    'SELECT SUM(amount) as total FROM revenues WHERE date >= ? AND date <= ?',
    [dateFrom, dateTo]
  );
  return (rows[0] as { total: number | null }).total ?? 0;
}

export async function revenueBySource(dateFrom: string, dateTo: string) {
  const rows = await query(
    'SELECT source, SUM(amount) as total FROM revenues WHERE date >= ? AND date <= ? GROUP BY source',
    [dateFrom, dateTo]
  );
  return rows.map((r: { source: string; total: number }) => ({ source: r.source, total: r.total ?? 0 }));
}

/**
 * Create revenue from Order (when status becomes "paid")
 * Idempotent: checks if revenue already exists for this order
 */
export async function createRevenueFromOrder(
  orderId: string,
  amount: number,
  paymentMethod: string,
  date: string,
  createdBy: string
): Promise<Revenue | null> {
  // Check if revenue already exists for this order (idempotence)
  const existing = await query(
    'SELECT id FROM revenues WHERE sourceId = ? AND source = ?',
    [orderId, 'restaurant']
  );

  if ((existing as any[]).length > 0) {
    console.log(`Revenue for Order ${orderId} already exists, skipping creation`);
    return null;
  }

  // Create revenue
  return await createRevenue({
    amount,
    source: 'restaurant',
    sourceId: orderId,
    description: `Commande #${orderId.substring(0, 8)}`,
    paymentMethod,
    date,
    createdBy,
  });
}

/**
 * Create revenue from RoomReservation (when status becomes "paid")
 * Idempotent: checks if revenue already exists for this reservation
 */
export async function createRevenueFromRoomReservation(
  reservationId: string,
  totalPrice: number,
  paymentMethod: string,
  date: string,
  createdBy: string
): Promise<Revenue | null> {
  // Check if revenue already exists
  const existing = await query(
    'SELECT id FROM revenues WHERE sourceId = ? AND source = ?',
    [reservationId, 'hébergement']
  );

  if ((existing as any[]).length > 0) {
    console.log(`Revenue for Room Reservation ${reservationId} already exists, skipping creation`);
    return null;
  }

  // Only create if totalPrice > 0
  if (totalPrice <= 0) {
    console.log(`Room Reservation ${reservationId} has totalPrice = 0, skipping revenue creation`);
    return null;
  }

  // Create revenue
  return await createRevenue({
    amount: totalPrice,
    source: 'hébergement',
    sourceId: reservationId,
    description: `Réservation chambre #${reservationId.substring(0, 8)}`,
    paymentMethod,
    date,
    createdBy,
  });
}

/**
 * Create revenue from EventReservation (when status becomes "paid")
 * Idempotent: checks if revenue already exists for this reservation
 */
export async function createRevenueFromEventReservation(
  reservationId: string,
  totalPrice: number,
  paymentMethod: string,
  date: string,
  createdBy: string
): Promise<Revenue | null> {
  // Check if revenue already exists
  const existing = await query(
    'SELECT id FROM revenues WHERE sourceId = ? AND source = ?',
    [reservationId, 'événement']
  );

  if ((existing as any[]).length > 0) {
    console.log(`Revenue for Event Reservation ${reservationId} already exists, skipping creation`);
    return null;
  }

  // Only create if totalPrice > 0
  if (totalPrice <= 0) {
    console.log(`Event Reservation ${reservationId} has totalPrice = 0, skipping revenue creation`);
    return null;
  }

  // Create revenue
  return await createRevenue({
    amount: totalPrice,
    source: 'événement',
    sourceId: reservationId,
    description: `Réservation événement #${reservationId.substring(0, 8)}`,
    paymentMethod,
    date,
    createdBy,
  });
}
