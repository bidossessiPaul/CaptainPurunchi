import { query } from "@/lib/db";
import type { Expense } from "@/app/types/expense";

function toExpense(e: {
  id: string;
  amount: number;
  category: string;
  supplier: string;
  description: string;
  paymentMethod: string;
  receipt: string;
  date: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Expense {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function readExpenses(filters?: {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  status?: string;
}): Promise<Expense[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
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
  const rows = await query(`SELECT * FROM expenses ${whereClause} ORDER BY date DESC`, params);
  return rows.map(toExpense);
}

export async function readExpenseById(id: string): Promise<Expense | null> {
  const rows = await query('SELECT * FROM expenses WHERE id = ?', [id]);
  return rows[0] ? toExpense(rows[0]) : null;
}

export async function createExpense(data: {
  amount: number;
  category: string;
  supplier?: string;
  description: string;
  paymentMethod?: string;
  receipt?: string;
  date: string;
  status?: string;
  createdBy?: string;
}): Promise<Expense> {
  const result = await query('INSERT INTO expenses SET ?', [data]);
  const rows = await query('SELECT * FROM expenses WHERE id = ?', [(result as { insertId: string }).insertId]);
  return toExpense(rows[0]);
}

export async function updateExpense(
  id: string,
  data: Partial<{
    amount: number;
    category: string;
    supplier: string;
    description: string;
    paymentMethod: string;
    receipt: string;
    date: string;
    status: string;
  }>
): Promise<Expense> {
  await query('UPDATE expenses SET ? WHERE id = ?', [data, id]);
  const rows = await query('SELECT * FROM expenses WHERE id = ?', [id]);
  return toExpense(rows[0]);
}

export async function deleteExpense(id: string): Promise<void> {
  await query('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function sumExpenseByPeriod(dateFrom: string, dateTo: string) {
  const rows = await query(
    'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ? AND status = ?',
    [dateFrom, dateTo, 'approved']
  );
  return (rows[0] as { total: number | null }).total ?? 0;
}

export async function expenseByCategory(dateFrom: string, dateTo: string) {
  const rows = await query(
    'SELECT category, SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ? AND status = ? GROUP BY category',
    [dateFrom, dateTo, 'approved']
  );
  return rows.map((r: { category: string; total: number }) => ({ category: r.category, total: r.total ?? 0 }));
}
