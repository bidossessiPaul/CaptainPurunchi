import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { calculateBalance } from "@/lib/finance-calculations";

/**
 * GET /api/finance/balance?start=2026-03-01&end=2026-03-31
 *
 * Returns complete balance sheet for the specified period:
 * - Total revenue
 * - Total expenses (approved only)
 * - Net profit
 * - Revenue breakdown by source
 * - Expense breakdown by category
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

  const balance = await calculateBalance(startDate, endDate);

  return NextResponse.json(balance);
});
