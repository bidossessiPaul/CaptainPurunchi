import { prisma } from "@/lib/prisma";
import type { StockItem } from "@/app/types/stock-item";

function toStockItem(r: {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): StockItem {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readStockItems(filters?: {
  category?: string;
  active?: boolean;
  search?: string;
}): Promise<StockItem[]> {
  const where: Record<string, unknown> = {};
  if (filters?.category) where.category = filters.category;
  if (filters?.active !== undefined) where.active = filters.active;
  if (filters?.search) {
    where.name = { contains: filters.search };
  }
  const rows = await prisma.stockItem.findMany({ where, orderBy: { name: "asc" } });
  return rows.map(toStockItem);
}

export async function readStockItemById(id: string): Promise<StockItem | null> {
  const r = await prisma.stockItem.findUnique({ where: { id } });
  return r ? toStockItem(r) : null;
}

export async function createStockItem(data: {
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock?: number;
  minStock?: number;
  unitPrice?: number;
  supplier?: string;
}): Promise<StockItem> {
  const r = await prisma.stockItem.create({ data });
  return toStockItem(r);
}

export async function updateStockItem(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    category: string;
    unit: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    supplier: string;
    active: boolean;
  }>
): Promise<StockItem> {
  const r = await prisma.stockItem.update({ where: { id }, data });
  return toStockItem(r);
}

export async function deleteStockItem(id: string): Promise<void> {
  await prisma.stockItem.delete({ where: { id } });
}

export async function countLowStockItems(): Promise<number> {
  const items = await prisma.stockItem.findMany({
    where: { active: true },
    select: { currentStock: true, minStock: true },
  });
  return items.filter((i) => i.currentStock < i.minStock && i.minStock > 0).length;
}

export async function readLowStockItems(): Promise<StockItem[]> {
  const items = await prisma.stockItem.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return items
    .filter((i) => i.currentStock < i.minStock && i.minStock > 0)
    .map(toStockItem);
}
