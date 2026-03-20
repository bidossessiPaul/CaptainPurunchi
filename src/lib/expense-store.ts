import { query } from "@/lib/db";
import type { Expense } from "@/app/types/expense";

function toExpense(e: {
  id: string;
  amount: number;
  category: string;
  supplier: string;
  description: string;
  paymentMethod: string;
  receiptUrl: string;
  date: string;
  status: string;
  isRecurring: boolean;
  recurringDay: number | null;
  approvedBy: string;
  approvedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Expense {
  return {
    ...e,
    status: e.status as Expense["status"],
    recurringDay: e.recurringDay ?? undefined,
    approvedAt: e.approvedAt ? e.approvedAt.toISOString() : undefined,
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

  if (filters?.category && filters.category !== "all") {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters?.status && filters.status !== "all") {
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
  const rows = await query(`SELECT * FROM expenses ${whereClause} ORDER BY date DESC, createdAt DESC`, params);
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
  receiptUrl?: string;
  date: string;
  status?: string;
  isRecurring?: boolean;
  recurringDay?: number;
  createdBy: string;
}): Promise<Expense> {
  const result = await query(
    `INSERT INTO expenses (
      id, amount, category, supplier, description, paymentMethod, receiptUrl,
      date, status, isRecurring, recurringDay, createdBy, updatedAt
    ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.amount,
      data.category,
      data.supplier || "",
      data.description,
      data.paymentMethod || "",
      data.receiptUrl || "",
      data.date,
      data.status || "pending",
      data.isRecurring || false,
      data.recurringDay || null,
      data.createdBy,
      new Date(),
    ]
  );

  // Get the ID from the last insert
  const rows = await query('SELECT * FROM expenses WHERE id = (SELECT id FROM expenses ORDER BY createdAt DESC LIMIT 1)');
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
    receiptUrl: string;
    date: string;
    status: string;
    isRecurring: boolean;
    recurringDay: number;
  }>
): Promise<Expense> {
  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    params.push(value);
  });

  params.push(id);

  await query(`UPDATE expenses SET ${fields.join(", ")}, updatedAt = NOW() WHERE id = ?`, params);

  const rows = await query('SELECT * FROM expenses WHERE id = ?', [id]);
  return toExpense(rows[0]);
}

export async function deleteExpense(id: string): Promise<void> {
  await query('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function approveExpense(
  id: string,
  approvedBy: string,
  approved: boolean
): Promise<Expense> {
  const status = approved ? "approved" : "rejected";

  await query(
    'UPDATE expenses SET status = ?, approvedBy = ?, approvedAt = NOW() WHERE id = ?',
    [status, approvedBy, id]
  );

  const rows = await query('SELECT * FROM expenses WHERE id = ?', [id]);
  return toExpense(rows[0]);
}

export async function readRecurringExpenses(): Promise<Expense[]> {
  const rows = await query('SELECT * FROM expenses WHERE isRecurring = TRUE ORDER BY recurringDay ASC');
  return rows.map(toExpense);
}

export async function sumExpenseByPeriod(dateFrom: string, dateTo: string): Promise<number> {
  const rows = await query(
    'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ? AND status = ?',
    [dateFrom, dateTo, 'approved']
  );
  return (rows[0] as { total: number | null }).total ?? 0;
}

export async function expenseByCategory(dateFrom: string, dateTo: string): Promise<{ category: string; total: number }[]> {
  const rows = await query(
    'SELECT category, SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ? AND status = ? GROUP BY category',
    [dateFrom, dateTo, 'approved']
  );
  return rows.map((r: { category: string; total: number }) => ({ category: r.category, total: r.total ?? 0 }));
}
