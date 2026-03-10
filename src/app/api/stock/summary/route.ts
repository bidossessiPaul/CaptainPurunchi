import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readStockItems, countLowStockItems } from "@/lib/stock-item-store";
import { countMovementsToday } from "@/lib/stock-movement-store";

export const GET = apiHandler(async () => {
  const today = new Date().toISOString().split("T")[0];

  const [items, lowStockCount, movementsToday] = await Promise.all([
    readStockItems({ active: true }),
    countLowStockItems(),
    countMovementsToday(today),
  ]);

  const totalItems = items.length;
  const totalValue = items.reduce((sum, i) => sum + Math.round(i.currentStock * i.unitPrice), 0);

  // Stock value by category
  const byCategory: Record<string, number> = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + Math.round(item.currentStock * item.unitPrice);
  }

  return NextResponse.json({
    totalItems,
    lowStockCount,
    movementsToday,
    totalValue,
    byCategory,
  });
});
