import { prisma } from "@/lib/prisma";
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
  const where: Record<string, unknown> = {};
  if (filters?.category) where.category = filters.category;
  if (filters?.status) where.status = filters.status;
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) (where.date as Record<string, string>).gte = filters.dateFrom;
    if (filters.dateTo) (where.date as Record<string, string>).lte = filters.dateTo;
  }
  const rows = await prisma.expense.findMany({ where, orderBy: { date: "desc" } });
  return rows.map(toExpense);
}

export async function readExpenseById(id: string): Promise<Expense | null> {
  const e = await prisma.expense.findUnique({ where: { id } });
  return e ? toExpense(e) : null;
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
  const e = await prisma.expense.create({ data });
  return toExpense(e);
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
  const e = await prisma.expense.update({ where: { id }, data });
  return toExpense(e);
}

export async function deleteExpense(id: string): Promise<void> {
  await prisma.expense.delete({ where: { id } });
}

export async function sumExpenseByPeriod(dateFrom: string, dateTo: string) {
  const result = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: dateFrom, lte: dateTo }, status: "approved" },
  });
  return result._sum.amount ?? 0;
}

export async function expenseByCategory(dateFrom: string, dateTo: string) {
  const rows = await prisma.expense.groupBy({
    by: ["category"],
    _sum: { amount: true },
    where: { date: { gte: dateFrom, lte: dateTo }, status: "approved" },
  });
  return rows.map((r) => ({ category: r.category, total: r._sum.amount ?? 0 }));
}
