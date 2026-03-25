import { query } from "@/lib/db";
import type { StockItem } from "@/app/types/stock-item";

function toStockItem(r: {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  active: number;
  createdAt: Date;
  updatedAt: Date;
}): StockItem {
  return {
    ...r,
    active: r.active === 1,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readStockItems(filters?: {
  category?: string;
  active?: boolean;
  search?: string;
}): Promise<StockItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters?.active !== undefined) {
    conditions.push('active = ?');
    params.push(filters.active ? 1 : 0);
  }
  if (filters?.search) {
    conditions.push('name LIKE ?');
    params.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query(`SELECT * FROM stock_items ${whereClause} ORDER BY name ASC`, params);
  return rows.map(toStockItem);
}

export async function readStockItemById(id: string): Promise<StockItem | null> {
  const rows = await query('SELECT * FROM stock_items WHERE id = ?', [id]);
  return rows[0] ? toStockItem(rows[0]) : null;
}

export async function createStockItem(data: {
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock?: number;
  minStock?: number;
  unitPrice?: number;
  supplier?: string;
}): Promise<StockItem> {
  const result = await query('INSERT INTO stock_items SET ?', [{ ...data, updatedAt: new Date() }]);
  const rows = await query('SELECT * FROM stock_items WHERE id = ?', [(result as { insertId: string }).insertId]);
  return toStockItem(rows[0]);
}

export async function updateStockItem(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    category: string;
    unit: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    supplier: string;
    active: boolean;
  }>
): Promise<StockItem> {
  const updateData: any = { ...data };
  if (updateData.active !== undefined) {
    updateData.active = updateData.active ? 1 : 0;
  }
  updateData.updatedAt = new Date();
  await query('UPDATE stock_items SET ? WHERE id = ?', [updateData, id]);
  const rows = await query('SELECT * FROM stock_items WHERE id = ?', [id]);
  return toStockItem(rows[0]);
}

export async function deleteStockItem(id: string): Promise<void> {
  await query('DELETE FROM stock_items WHERE id = ?', [id]);
}

export async function countLowStockItems(): Promise<number> {
  const rows = await query(
    'SELECT COUNT(*) as count FROM stock_items WHERE active = 1 AND minStock > 0 AND currentStock < minStock'
  );
  return (rows[0] as { count: number }).count;
}

export async function readLowStockItems(): Promise<StockItem[]> {
  const rows = await query(
    'SELECT * FROM stock_items WHERE active = 1 AND minStock > 0 AND currentStock < minStock ORDER BY name ASC'
  );
  return rows.map(toStockItem);
}
