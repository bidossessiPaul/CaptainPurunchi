import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getRevenueBreakdown, getExpenseBreakdown } from "@/lib/finance-calculations";

/**
 * GET /api/finance/revenue-breakdown?start=2026-03-01&end=2026-03-31&type=revenue
 *
 * Returns breakdown with percentages for pie charts:
 * - type=revenue: Revenue by source with percentages
 * - type=expense: Expenses by category with percentages
 *
 * Returns: { source/category, amount, percentage }[]
 */
export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const type = searchParams.get("type") || "revenue";

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

  const breakdown =
    type === "expense"
      ? await getExpenseBreakdown(startDate, endDate)
      : await getRevenueBreakdown(startDate, endDate);

  return NextResponse.json(breakdown);
});
