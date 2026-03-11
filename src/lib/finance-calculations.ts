import { query } from "./db";

/**
 * Finance Calculations Helper
 * Provides functions for calculating financial metrics (balance, P&L, breakdowns)
 */

export interface BalanceSheet {
  period: { start: string; end: string };
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueBySource: Record<string, number>;
  expenseByCategory: Record<string, number>;
}

export interface ProfitLoss {
  period: { start: string; end: string };
  revenue: {
    restaurant: number;
    bar: number;
    hébergement: number;
    événement: number;
    autre: number;
    total: number;
  };
  expenses: {
    "Achats fournisseurs": number;
    "Salaires": number;
    "Charges fixes": number;
    "Entretien & réparations": number;
    "Marketing": number;
    "Divers": number;
    total: number;
  };
  netProfit: number;
  margin: number; // %
}

/**
 * Calculate total revenue for a period
 */
export async function calculateTotalRevenue(
  startDate: string,
  endDate: string
): Promise<number> {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM revenues
     WHERE date >= ? AND date <= ?`,
    [startDate, endDate]
  );
  return (result as any[])[0]?.total || 0;
}

/**
 * Calculate total approved expenses for a period
 */
export async function calculateTotalExpenses(
  startDate: string,
  endDate: string
): Promise<number> {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM expenses
     WHERE date >= ? AND date <= ? AND status = 'approved'`,
    [startDate, endDate]
  );
  return (result as any[])[0]?.total || 0;
}

/**
 * Get revenue breakdown by source
 */
export async function getRevenueBySource(
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const result = await query(
    `SELECT source, SUM(amount) as total
     FROM revenues
     WHERE date >= ? AND date <= ?
     GROUP BY source`,
    [startDate, endDate]
  );

  const breakdown: Record<string, number> = {
    restaurant: 0,
    bar: 0,
    hébergement: 0,
    événement: 0,
    autre: 0,
  };

  (result as any[]).forEach((row) => {
    breakdown[row.source] = row.total || 0;
  });

  return breakdown;
}

/**
 * Get expense breakdown by category
 */
export async function getExpenseByCategory(
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const result = await query(
    `SELECT category, SUM(amount) as total
     FROM expenses
     WHERE date >= ? AND date <= ? AND status = 'approved'
     GROUP BY category`,
    [startDate, endDate]
  );

  const breakdown: Record<string, number> = {
    "Achats fournisseurs": 0,
    "Salaires": 0,
    "Charges fixes": 0,
    "Entretien & réparations": 0,
    "Marketing": 0,
    "Divers": 0,
  };

  (result as any[]).forEach((row) => {
    breakdown[row.category] = row.total || 0;
  });

  return breakdown;
}

/**
 * Calculate complete balance sheet for a period
 */
export async function calculateBalance(
  startDate: string,
  endDate: string
): Promise<BalanceSheet> {
  const [totalRevenue, totalExpenses, revenueBySource, expenseByCategory] =
    await Promise.all([
      calculateTotalRevenue(startDate, endDate),
      calculateTotalExpenses(startDate, endDate),
      getRevenueBySource(startDate, endDate),
      getExpenseByCategory(startDate, endDate),
    ]);

  return {
    period: { start: startDate, end: endDate },
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    revenueBySource,
    expenseByCategory,
  };
}

/**
 * Calculate complete Profit & Loss statement
 */
export async function calculateProfitLoss(
  startDate: string,
  endDate: string
): Promise<ProfitLoss> {
  const [revenueBySource, expenseByCategory] = await Promise.all([
    getRevenueBySource(startDate, endDate),
    getExpenseByCategory(startDate, endDate),
  ]);

  const revenueTotal =
    revenueBySource.restaurant +
    revenueBySource.bar +
    revenueBySource.hébergement +
    revenueBySource.événement +
    revenueBySource.autre;

  const expensesTotal =
    expenseByCategory["Achats fournisseurs"] +
    expenseByCategory["Salaires"] +
    expenseByCategory["Charges fixes"] +
    expenseByCategory["Entretien & réparations"] +
    expenseByCategory["Marketing"] +
    expenseByCategory["Divers"];

  const netProfit = revenueTotal - expensesTotal;
  const margin = revenueTotal > 0 ? (netProfit / revenueTotal) * 100 : 0;

  return {
    period: { start: startDate, end: endDate },
    revenue: {
      restaurant: revenueBySource.restaurant,
      bar: revenueBySource.bar,
      hébergement: revenueBySource.hébergement,
      événement: revenueBySource.événement,
      autre: revenueBySource.autre,
      total: revenueTotal,
    },
    expenses: {
      "Achats fournisseurs": expenseByCategory["Achats fournisseurs"],
      "Salaires": expenseByCategory["Salaires"],
      "Charges fixes": expenseByCategory["Charges fixes"],
      "Entretien & réparations": expenseByCategory["Entretien & réparations"],
      "Marketing": expenseByCategory["Marketing"],
      "Divers": expenseByCategory["Divers"],
      total: expensesTotal,
    },
    netProfit,
    margin: Math.round(margin * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Get revenue breakdown with percentages (for pie chart)
 */
export async function getRevenueBreakdown(
  startDate: string,
  endDate: string
): Promise<Array<{ source: string; amount: number; percentage: number }>> {
  const revenueBySource = await getRevenueBySource(startDate, endDate);
  const total = Object.values(revenueBySource).reduce((sum, val) => sum + val, 0);

  return Object.entries(revenueBySource)
    .filter(([, amount]) => amount > 0) // Only include sources with revenue
    .map(([source, amount]) => ({
      source,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
}

/**
 * Get expense breakdown with percentages (for pie chart)
 */
export async function getExpenseBreakdown(
  startDate: string,
  endDate: string
): Promise<Array<{ category: string; amount: number; percentage: number }>> {
  const expenseByCategory = await getExpenseByCategory(startDate, endDate);
  const total = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);

  return Object.entries(expenseByCategory)
    .filter(([, amount]) => amount > 0) // Only include categories with expenses
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
}

/**
 * Get daily revenue trend for the last N days (for line chart)
 */
export async function getRevenueTrend(
  days: number = 30
): Promise<Array<{ date: string; amount: number }>> {
  const result = await query(
    `SELECT DATE(date) as date, SUM(amount) as amount
     FROM revenues
     WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(date)
     ORDER BY date ASC`,
    [days]
  );

  return (result as any[]).map((row) => ({
    date: row.date,
    amount: row.amount || 0,
  }));
}

/**
 * Get comparison between two periods (for N vs N-1 comparison)
 */
export async function comparePeriods(
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): Promise<{
  current: BalanceSheet;
  previous: BalanceSheet;
  growth: {
    revenue: number; // %
    expenses: number; // %
    netProfit: number; // %
  };
}> {
  const [current, previous] = await Promise.all([
    calculateBalance(currentStart, currentEnd),
    calculateBalance(previousStart, previousEnd),
  ]);

  const revenueGrowth =
    previous.totalRevenue > 0
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
      : 0;

  const expensesGrowth =
    previous.totalExpenses > 0
      ? ((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100
      : 0;

  const netProfitGrowth =
    previous.netProfit !== 0
      ? ((current.netProfit - previous.netProfit) / Math.abs(previous.netProfit)) * 100
      : 0;

  return {
    current,
    previous,
    growth: {
      revenue: Math.round(revenueGrowth * 100) / 100,
      expenses: Math.round(expensesGrowth * 100) / 100,
      netProfit: Math.round(netProfitGrowth * 100) / 100,
    },
  };
}
