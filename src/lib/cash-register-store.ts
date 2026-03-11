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
  const result = await query('INSERT INTO cash_registers SET ?', [data]);
  const rows = await query('SELECT * FROM cash_registers WHERE id = ?', [(result as { insertId: string }).insertId]);
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

  await query('UPDATE cash_registers SET ? WHERE id = ?', [
    {
      ...data,
      difference,
      status: "closed",
      closedAt: new Date(),
    },
    id
  ]);

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
  await query('UPDATE cash_registers SET ? WHERE id = ?', [data, id]);
  const rows = await query('SELECT * FROM cash_registers WHERE id = ?', [id]);
  return toCashRegister(rows[0]);
}
