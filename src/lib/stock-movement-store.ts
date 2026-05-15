import { query } from "@/lib/db";
import type { StockMovement } from "@/app/types/stock-movement";

function toStockMovement(r: {
  id: string;
  stockItemId: string;
  stockItemName: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  reason: string;
  date: string;
  createdBy: string;
  createdAt: Date;
}): StockMovement {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readStockMovements(filters?: {
  stockItemId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<StockMovement[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.stockItemId) {
    conditions.push('stockItemId = ?');
    params.push(filters.stockItemId);
  }
  if (filters?.type) {
    conditions.push('type = ?');
    params.push(filters.type);
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
  const rows = await query(`SELECT * FROM stock_movements ${whereClause} ORDER BY createdAt DESC`, params);
  return rows.map(toStockMovement);
}

export async function createStockMovement(data: {
  stockItemId: string;
  stockItemName: string;
  type: string;
  quantity: number;
  unitPrice?: number;
  reason?: string;
  date: string;
  createdBy?: string;
}): Promise<StockMovement> {
  const totalCost = Math.round((data.unitPrice || 0) * Math.abs(data.quantity));

  const result = await query('INSERT INTO stock_movements SET ?', [{
    stockItemId: data.stockItemId,
    stockItemName: data.stockItemName,
    type: data.type,
    quantity: data.quantity,
    unitPrice: data.unitPrice || 0,
    totalCost,
    reason: data.reason || "",
    date: data.date,
    createdBy: data.createdBy || "",
  }]);

  // Update currentStock on the StockItem
  if (data.type === "adjustment") {
    // Adjustment sets the stock to the given quantity
    await query('UPDATE stock_items SET currentStock = ?, updatedAt = ? WHERE id = ?', [data.quantity, new Date(), data.stockItemId]);
  } else {
    // entry = +quantity, exit/waste = -quantity
    const delta = data.type === "entry" ? Math.abs(data.quantity) : -Math.abs(data.quantity);
    await query('UPDATE stock_items SET currentStock = currentStock + ?, updatedAt = ? WHERE id = ?', [delta, new Date(), data.stockItemId]);
  }

  const rows = await query('SELECT * FROM stock_movements WHERE id = ?', [(result as { insertId: string }).insertId]);
  return toStockMovement(rows[0]);
}

export async function deleteStockMovement(id: string): Promise<void> {
  const movementRows = await query('SELECT id, type, quantity, stockItemId FROM stock_movements WHERE id = ?', [id]);
  const movement = movementRows[0] as Pick<StockMovement, 'id' | 'type' | 'quantity' | 'stockItemId'> | undefined;
  if (!movement) return;

  // Reverse the stock change
  if (movement.type === "adjustment") {
    // Can't reliably reverse an adjustment — just delete the record
  } else {
    const delta = movement.type === "entry" ? -Math.abs(movement.quantity) : Math.abs(movement.quantity);
    await query('UPDATE stock_items SET currentStock = currentStock + ?, updatedAt = ? WHERE id = ?', [delta, new Date(), movement.stockItemId]);
  }

  await query('DELETE FROM stock_movements WHERE id = ?', [id]);
}

export async function countMovementsToday(date: string): Promise<number> {
  const rows = await query('SELECT COUNT(*) as count FROM stock_movements WHERE date = ?', [date]);
  return (rows[0] as { count: number }).count;
}
