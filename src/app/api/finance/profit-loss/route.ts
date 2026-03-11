import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { calculateProfitLoss } from "@/lib/finance-calculations";

/**
 * GET /api/finance/profit-loss?start=2026-03-01&end=2026-03-31
 *
 * Returns complete Profit & Loss statement:
 * - Revenue breakdown by source (restaurant, bar, hébergement, événement, autre)
 * - Expense breakdown by category
 * - Net profit
 * - Profit margin %
 */
export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // Default to current month if no dates provided
  const today = new Date();
  const startDate =
    start ||
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  const endDate =
    end ||
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

  const profitLoss = await calculateProfitLoss(startDate, endDate);

  return NextResponse.json(profitLoss);
});
