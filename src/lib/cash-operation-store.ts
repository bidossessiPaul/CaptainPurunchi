import { query } from "@/lib/db";
import type { CashOperation } from "@/app/types/cash-operation";

function toOp(c: {
  id: string;
  cashRegisterId: string;
  type: string;
  amount: number;
  paymentMethod: string;
  description: string;
  createdBy: string;
  createdAt: Date;
}): CashOperation {
  return { ...c, createdAt: c.createdAt.toISOString() };
}

export async function readOperationsByCashRegister(cashRegisterId: string): Promise<CashOperation[]> {
  const rows = await query(
    'SELECT * FROM cash_operations WHERE cashRegisterId = ? ORDER BY createdAt DESC',
    [cashRegisterId]
  );
  return rows.map(toOp);
}

export async function createCashOperation(data: {
  cashRegisterId: string;
  type: string;
  amount: number;
  paymentMethod: string;
  description: string;
  createdBy: string;
}): Promise<CashOperation> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO cash_operations (id, cashRegisterId, type, amount, paymentMethod, description, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.cashRegisterId, data.type, data.amount, data.paymentMethod, data.description, data.createdBy]
  );
  const ops = await query('SELECT * FROM cash_operations WHERE id = ?', [id]);
  return toOp(ops[0]);
}

export async function deleteCashOperation(id: string): Promise<void> {
  await query('DELETE FROM cash_operations WHERE id = ?', [id]);
}

export async function sumOperationsByPaymentMethod(cashRegisterId: string): Promise<{
  especes: number;
  carte: number;
  mtnMoney: number;
  moovMoney: number;
  virement: number;
  totalEncaissements: number;
  totalRetraits: number;
}> {
  const ops = await query('SELECT type, amount, paymentMethod FROM cash_operations WHERE cashRegisterId = ?', [cashRegisterId]);

  const result = { especes: 0, carte: 0, mtnMoney: 0, moovMoney: 0, virement: 0, totalEncaissements: 0, totalRetraits: 0 };

  for (const op of ops as Pick<CashOperation, 'type' | 'amount' | 'paymentMethod'>[]) {
    const sign = op.type === "encaissement" ? 1 : -1;
    const amount = op.amount * sign;

    if (op.paymentMethod === "especes") result.especes += amount;
    else if (op.paymentMethod === "carte") result.carte += amount;
    else if (op.paymentMethod === "mtn_money") result.mtnMoney += amount;
    else if (op.paymentMethod === "moov_money") result.moovMoney += amount;
    else if (op.paymentMethod === "virement") result.virement += amount;

    if (op.type === "encaissement") result.totalEncaissements += op.amount;
    else result.totalRetraits += op.amount;
  }

  return result;
}
