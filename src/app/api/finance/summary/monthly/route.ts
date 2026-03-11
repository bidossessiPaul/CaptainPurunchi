import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { query } from "@/lib/db";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const yearStr = String(year);
  const dateFrom = `${yearStr}-01-01`;
  const dateTo = `${yearStr}-12-31`;

  const [revenues, expenses] = await Promise.all([
    query('SELECT amount, date FROM revenues WHERE date >= ? AND date <= ?', [dateFrom, dateTo]),
    query('SELECT amount, date FROM expenses WHERE date >= ? AND date <= ? AND status = ?', [dateFrom, dateTo, "approved"]),
  ]);

  // Aggregate by month
  const months: { month: string; revenue: number; expense: number; net: number }[] = [];

  for (let m = 1; m <= 12; m++) {
    const prefix = `${yearStr}-${String(m).padStart(2, "0")}`;
    const rev = (revenues as { amount: number; date: string }[])
      .filter((r) => r.date.startsWith(prefix))
      .reduce((s, r) => s + r.amount, 0);
    const exp = (expenses as { amount: number; date: string }[])
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
