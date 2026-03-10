import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const yearStr = String(year);
  const dateFrom = `${yearStr}-01-01`;
  const dateTo = `${yearStr}-12-31`;

  const [revenues, expenses] = await Promise.all([
    prisma.revenue.findMany({
      where: { date: { gte: dateFrom, lte: dateTo } },
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: dateFrom, lte: dateTo }, status: "approved" },
      select: { amount: true, date: true },
    }),
  ]);

  // Aggregate by month
  const months: { month: string; revenue: number; expense: number; net: number }[] = [];

  for (let m = 1; m <= 12; m++) {
    const prefix = `${yearStr}-${String(m).padStart(2, "0")}`;
    const rev = revenues
      .filter((r) => r.date.startsWith(prefix))
      .reduce((s, r) => s + r.amount, 0);
    const exp = expenses
      .filter((e) => e.date.startsWith(prefix))
      .reduce((s, e) => s + e.amount, 0);

    months.push({
      month: prefix,
      revenue: rev,
      expense: exp,
      net: rev - exp,
    });
  }

  const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);

  return NextResponse.json({
    year,
    months,
    totalRevenue,
    totalExpense,
    totalNet: totalRevenue - totalExpense,
  });
});
