import { query } from "@/lib/db";
import type { Invoice } from "@/app/types/invoice";

function toInvoice(i: {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
  paidDate: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Invoice {
  return {
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CP-${year}-`;
  const rows = await query(
    'SELECT invoiceNumber FROM invoices WHERE invoiceNumber LIKE ? ORDER BY invoiceNumber DESC LIMIT 1',
    [`${prefix}%`]
  );

  let next = 1;
  if (rows[0]) {
    const num = parseInt((rows[0] as { invoiceNumber: string }).invoiceNumber.replace(prefix, ""), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function readInvoices(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Invoice[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.dateFrom) {
    conditions.push('createdAt >= ?');
    params.push(new Date(filters.dateFrom));
  }
  if (filters?.dateTo) {
    conditions.push('createdAt <= ?');
    params.push(new Date(filters.dateTo + "T23:59:59"));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query(`SELECT * FROM invoices ${whereClause} ORDER BY createdAt DESC`, params);
  return rows.map(toInvoice);
}

export async function readInvoiceById(id: string): Promise<Invoice | null> {
  const rows = await query('SELECT * FROM invoices WHERE id = ?', [id]);
  return rows[0] ? toInvoice(rows[0]) : null;
}

export async function createInvoice(data: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: string;
  subtotal: number;
  tax?: number;
  total: number;
  dueDate?: string;
  notes?: string;
  createdBy?: string;
}): Promise<Invoice> {
  const invoiceNumber = await generateInvoiceNumber();
  const result = await query('INSERT INTO invoices SET ?', [{ ...data, invoiceNumber, updatedAt: new Date() }]);
  const rows = await query('SELECT * FROM invoices WHERE id = ?', [(result as { insertId: string }).insertId]);
  return toInvoice(rows[0]);
}

export async function updateInvoice(
  id: string,
  data: Partial<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: string;
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    dueDate: string;
    paidDate: string;
    notes: string;
  }>
): Promise<Invoice> {
  await query('UPDATE invoices SET ? WHERE id = ?', [{ ...data, updatedAt: new Date() }, id]);
  const rows = await query('SELECT * FROM invoices WHERE id = ?', [id]);
  return toInvoice(rows[0]);
}

export async function deleteInvoice(id: string): Promise<void> {
  await query('DELETE FROM invoices WHERE id = ?', [id]);
}

export async function sumInvoicesByStatus() {
  const rows = await query(
    'SELECT status, SUM(total) as total, COUNT(*) as count FROM invoices GROUP BY status'
  );
  return rows.map((r: { status: string; total: number | null; count: number }) => ({
    status: r.status,
    total: r.total ?? 0,
    count: r.count,
  }));
}
