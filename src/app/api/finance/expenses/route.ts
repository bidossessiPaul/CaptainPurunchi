import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readExpenses, createExpense } from "@/lib/expense-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;

  const expenses = await readExpenses({ dateFrom, dateTo, category, status });
  return NextResponse.json(expenses);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { amount, category, description, date } = body;

  if (!amount || !category || !description || !date) {
    return NextResponse.json(
      { error: "amount, category, description et date sont requis" },
      { status: 400 }
    );
  }

  const me = await getSessionUser();
  const expense = await createExpense({
    amount: Number(amount),
    category,
    supplier: body.supplier || "",
    description,
    paymentMethod: body.paymentMethod || "",
    receipt: body.receipt || "",
    date,
    status: body.status || "approved",
    createdBy: me?.name || "",
  });

  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "expense",
      targetId: expense.id,
      details: `Dépense ${amount} FCFA (${category})`,
    }).catch(() => {});
  }

  return NextResponse.json(expense, { status: 201 });
});
