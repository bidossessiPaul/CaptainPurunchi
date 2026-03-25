import { query } from "@/lib/db";
import type { CashRegister } from "@/app/types/cash-register";

function toCashRegister(c: {
  id: string;
  date: string;
  openedBy: string;
  closedBy: string;
  openingBalance: number;
  especes: number;
  carte: number;
  mtnMoney: number;
  moovMoney: number;
  virement: number;
  closingBalance: number;
  difference: number;
  notes: string;
  status: string;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CashRegister {
  return {
    ...c,
    closedAt: c.closedAt ? c.closedAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function readCashRegisters(filters?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}): Promise<CashRegister[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

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
  const rows = await query(`SELECT * FROM cash_registers ${whereClause} ORDER BY date DESC`, params);
  return rows.map(toCashRegister);
}

export async function readCashRegisterById(id: string): Promise<CashRegister | null> {
  const rows = await query('SELECT * FROM cash_registers WHERE id = ?', [id]);
  return rows[0] ? toCashRegister(rows[0]) : null;
}

export async function readTodayCashRegister(date: string): Promise<CashRegister | null> {
  const rows = await query(
    'SELECT * FROM cash_registers WHERE date = ? ORDER BY createdAt DESC LIMIT 1',
    [date]
  );
  return rows[0] ? toCashRegister(rows[0]) : null;
}

export async function openCashRegister(data: {
  date: string;
  openedBy: string;
  openingBalance: number;
  notes?: string;
}): Promise<CashRegister> {
  const id = crypto.randomUUID();
  const now = new Date();
  await query(
    'INSERT INTO cash_registers (id, date, openedBy, openingBalance, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, data.date, data.openedBy, data.openingBalance, data.notes || '', now]
  );
  const rows = await query('SELECT * FROM cash_registers WHERE id = ?', [id]);
  return toCashRegister(rows[0]);
}

export async function closeCashRegister(
  id: string,
  data: {
    closedBy: string;
    especes: number;
    carte: number;
    mtnMoney: number;
    moovMoney: number;
    virement: number;
    closingBalance: number;
    notes?: string;
  }
): Promise<CashRegister> {
  const totalPayments = data.especes + data.carte + data.mtnMoney + data.moovMoney + data.virement;
  const regRows = await query('SELECT * FROM cash_registers WHERE id = ?', [id]);
  const opening = regRows[0]?.openingBalance ?? 0;
  const expectedBalance = opening + totalPayments;
  const difference = data.closingBalance - expectedBalance;

  const now = new Date();
  await query(
    'UPDATE cash_registers SET closedBy = ?, especes = ?, carte = ?, mtnMoney = ?, moovMoney = ?, virement = ?, closingBalance = ?, difference = ?, status = ?, closedAt = ?, notes = ?, updatedAt = ? WHERE id = ?',
    [data.closedBy, data.especes, data.carte, data.mtnMoney, data.moovMoney, data.virement, data.closingBalance, difference, 'closed', now, data.notes || '', now, id]
  );

  const rows = await query('SELECT * FROM cash_registers WHERE id = ?', [id]);
  return toCashRegister(rows[0]);
}

export async function updateCashRegister(
  id: string,
  data: Partial<{
    notes: string;
    openingBalance: number;
  }>
): Promise<CashRegister> {
  const fields: string[] = [];
  const params: unknown[] = [];
  if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }
  if (data.openingBalance !== undefined) { fields.push('openingBalance = ?'); params.push(data.openingBalance); }
  if (fields.length > 0) {
    fields.push('updatedAt = ?'); params.push(new Date());
    params.push(id);
    await query(`UPDATE cash_registers SET ${fields.join(', ')} WHERE id = ?`, params);
  }
  const rows = await query('SELECT * FROM cash_registers WHERE id = ?', [id]);
  return toCashRegister(rows[0]);
}
