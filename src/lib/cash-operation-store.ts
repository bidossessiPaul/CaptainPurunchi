import { prisma } from "@/lib/prisma";
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
  const rows = await prisma.cashOperation.findMany({
    where: { cashRegisterId },
    orderBy: { createdAt: "desc" },
  });
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
  const op = await prisma.cashOperation.create({ data });
  return toOp(op);
}

export async function deleteCashOperation(id: string): Promise<void> {
  await prisma.cashOperation.delete({ where: { id } });
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
  const ops = await prisma.cashOperation.findMany({ where: { cashRegisterId } });

  const result = { especes: 0, carte: 0, mtnMoney: 0, moovMoney: 0, virement: 0, totalEncaissements: 0, totalRetraits: 0 };

  for (const op of ops) {
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
