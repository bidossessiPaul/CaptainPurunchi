import { prisma } from "@/lib/prisma";
import type { Revenue } from "@/app/types/revenue";

function toRevenue(r: {
  id: string;
  amount: number;
  source: string;
  sourceId: string;
  description: string;
  paymentMethod: string;
  date: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Revenue {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readRevenues(filters?: {
  dateFrom?: string;
  dateTo?: string;
  source?: string;
}): Promise<Revenue[]> {
  const where: Record<string, unknown> = {};
  if (filters?.source) where.source = filters.source;
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) (where.date as Record<string, string>).gte = filters.dateFrom;
    if (filters.dateTo) (where.date as Record<string, string>).lte = filters.dateTo;
  }
  const rows = await prisma.revenue.findMany({ where, orderBy: { date: "desc" } });
  return rows.map(toRevenue);
}

export async function readRevenueById(id: string): Promise<Revenue | null> {
  const r = await prisma.revenue.findUnique({ where: { id } });
  return r ? toRevenue(r) : null;
}

export async function createRevenue(data: {
  amount: number;
  source: string;
  sourceId?: string;
  description: string;
  paymentMethod?: string;
  date: string;
  createdBy?: string;
}): Promise<Revenue> {
  const r = await prisma.revenue.create({ data });
  return toRevenue(r);
}

export async function updateRevenue(
  id: string,
  data: Partial<{
    amount: number;
    source: string;
    sourceId: string;
    description: string;
    paymentMethod: string;
    date: string;
  }>
): Promise<Revenue> {
  const r = await prisma.revenue.update({ where: { id }, data });
  return toRevenue(r);
}

export async function deleteRevenue(id: string): Promise<void> {
  await prisma.revenue.delete({ where: { id } });
}

export async function sumRevenueByPeriod(dateFrom: string, dateTo: string) {
  const result = await prisma.revenue.aggregate({
    _sum: { amount: true },
    where: { date: { gte: dateFrom, lte: dateTo } },
  });
  return result._sum.amount ?? 0;
}

export async function revenueBySource(dateFrom: string, dateTo: string) {
  const rows = await prisma.revenue.groupBy({
    by: ["source"],
    _sum: { amount: true },
    where: { date: { gte: dateFrom, lte: dateTo } },
  });
  return rows.map((r) => ({ source: r.source, total: r._sum.amount ?? 0 }));
}
