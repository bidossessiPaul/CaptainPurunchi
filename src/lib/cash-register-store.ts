import { prisma } from "@/lib/prisma";
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
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) (where.date as Record<string, string>).gte = filters.dateFrom;
    if (filters.dateTo) (where.date as Record<string, string>).lte = filters.dateTo;
  }
  const rows = await prisma.cashRegister.findMany({ where, orderBy: { date: "desc" } });
  return rows.map(toCashRegister);
}

export async function readCashRegisterById(id: string): Promise<CashRegister | null> {
  const c = await prisma.cashRegister.findUnique({ where: { id } });
  return c ? toCashRegister(c) : null;
}

export async function readTodayCashRegister(date: string): Promise<CashRegister | null> {
  const c = await prisma.cashRegister.findFirst({
    where: { date },
    orderBy: { createdAt: "desc" },
  });
  return c ? toCashRegister(c) : null;
}

export async function openCashRegister(data: {
  date: string;
  openedBy: string;
  openingBalance: number;
  notes?: string;
}): Promise<CashRegister> {
  const c = await prisma.cashRegister.create({ data });
  return toCashRegister(c);
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
  const reg = await prisma.cashRegister.findUnique({ where: { id } });
  const opening = reg?.openingBalance ?? 0;
  const expectedBalance = opening + totalPayments;
  const difference = data.closingBalance - expectedBalance;

  const c = await prisma.cashRegister.update({
    where: { id },
    data: {
      ...data,
      difference,
      status: "closed",
      closedAt: new Date(),
    },
  });
  return toCashRegister(c);
}

export async function updateCashRegister(
  id: string,
  data: Partial<{
    notes: string;
    openingBalance: number;
  }>
): Promise<CashRegister> {
  const c = await prisma.cashRegister.update({ where: { id }, data });
  return toCashRegister(c);
}
