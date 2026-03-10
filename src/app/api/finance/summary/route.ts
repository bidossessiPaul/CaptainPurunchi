import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { sumRevenueByPeriod, revenueBySource } from "@/lib/revenue-store";
import { sumExpenseByPeriod, expenseByCategory } from "@/lib/expense-store";
import { sumInvoicesByStatus } from "@/lib/invoice-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") || new Date().toISOString().split("T")[0];
  const dateTo = searchParams.get("dateTo") || new Date().toISOString().split("T")[0];

  const [totalRevenue, totalExpense, bySource, byCategory, invoiceStats] = await Promise.all([
    sumRevenueByPeriod(dateFrom, dateTo),
    sumExpenseByPeriod(dateFrom, dateTo),
    revenueBySource(dateFrom, dateTo),
    expenseByCategory(dateFrom, dateTo),
    sumInvoicesByStatus(),
  ]);

  return NextResponse.json({
    totalRevenue,
    totalExpense,
    netBalance: totalRevenue - totalExpense,
    bySource,
    byCategory,
    invoiceStats,
  });
});
