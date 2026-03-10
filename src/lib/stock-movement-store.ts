import { prisma } from "@/lib/prisma";
import type { StockMovement } from "@/app/types/stock-movement";

function toStockMovement(r: {
  id: string;
  stockItemId: string;
  stockItemName: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  reason: string;
  date: string;
  createdBy: string;
  createdAt: Date;
}): StockMovement {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readStockMovements(filters?: {
  stockItemId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<StockMovement[]> {
  const where: Record<string, unknown> = {};
  if (filters?.stockItemId) where.stockItemId = filters.stockItemId;
  if (filters?.type) where.type = filters.type;
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) (where.date as Record<string, string>).gte = filters.dateFrom;
    if (filters.dateTo) (where.date as Record<string, string>).lte = filters.dateTo;
  }
  const rows = await prisma.stockMovement.findMany({ where, orderBy: { createdAt: "desc" } });
  return rows.map(toStockMovement);
}

export async function createStockMovement(data: {
  stockItemId: string;
  stockItemName: string;
  type: string;
  quantity: number;
  unitPrice?: number;
  reason?: string;
  date: string;
  createdBy?: string;
}): Promise<StockMovement> {
  const totalCost = Math.round((data.unitPrice || 0) * Math.abs(data.quantity));

  const movement = await prisma.stockMovement.create({
    data: {
      stockItemId: data.stockItemId,
      stockItemName: data.stockItemName,
      type: data.type,
      quantity: data.quantity,
      unitPrice: data.unitPrice || 0,
      totalCost,
      reason: data.reason || "",
      date: data.date,
      createdBy: data.createdBy || "",
    },
  });

  // Update currentStock on the StockItem
  if (data.type === "adjustment") {
    // Adjustment sets the stock to the given quantity
    await prisma.stockItem.update({
      where: { id: data.stockItemId },
      data: { currentStock: data.quantity },
    });
  } else {
    // entry = +quantity, exit/waste = -quantity
    const delta = data.type === "entry" ? Math.abs(data.quantity) : -Math.abs(data.quantity);
    await prisma.stockItem.update({
      where: { id: data.stockItemId },
      data: { currentStock: { increment: delta } },
    });
  }

  return toStockMovement(movement);
}

export async function deleteStockMovement(id: string): Promise<void> {
  const movement = await prisma.stockMovement.findUnique({ where: { id } });
  if (!movement) return;

  // Reverse the stock change
  if (movement.type === "adjustment") {
    // Can't reliably reverse an adjustment — just delete the record
  } else {
    const delta = movement.type === "entry" ? -Math.abs(movement.quantity) : Math.abs(movement.quantity);
    await prisma.stockItem.update({
      where: { id: movement.stockItemId },
      data: { currentStock: { increment: delta } },
    });
  }

  await prisma.stockMovement.delete({ where: { id } });
}

export async function countMovementsToday(date: string): Promise<number> {
  return prisma.stockMovement.count({ where: { date } });
}
