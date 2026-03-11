import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readExpenseById, updateExpense, deleteExpense } from "@/lib/expense-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await readExpenseById(id);
  if (!existing) {
    return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
  }

  // Only allow updates if status is "pending" or user is the creator
  if (existing.status !== "pending" && existing.createdBy !== me.id) {
    return NextResponse.json(
      { error: "Cannot modify approved/rejected expenses" },
      { status: 403 }
    );
  }

  const data: Record<string, unknown> = {};
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.category !== undefined) data.category = body.category;
  if (body.supplier !== undefined) data.supplier = body.supplier;
  if (body.description !== undefined) data.description = body.description;
  if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;
  if (body.receiptUrl !== undefined) data.receiptUrl = body.receiptUrl;
  if (body.date !== undefined) data.date = body.date;
  if (body.isRecurring !== undefined) data.isRecurring = body.isRecurring;
  if (body.recurringDay !== undefined) data.recurringDay = body.recurringDay;

  const updated = await updateExpense(id, data);

  logActivity({
    userId: me.id,
    userName: me.name,
    action: "update",
    target: "expense",
    targetId: id,
    details: `Dépense modifiée (${updated.amount} FCFA)`,
  }).catch(() => {});

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await readExpenseById(id);
  if (!existing) {
    return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
  }

  // Only allow deletion if status is "pending" and user is the creator
  if (existing.status !== "pending" || existing.createdBy !== me.id) {
    return NextResponse.json(
      { error: "Cannot delete approved/rejected expenses or expenses created by others" },
      { status: 403 }
    );
  }

  await deleteExpense(id);

  logActivity({
    userId: me.id,
    userName: me.name,
    action: "delete",
    target: "expense",
    targetId: id,
    details: `Dépense supprimée (${existing.amount} FCFA - ${existing.category})`,
  }).catch(() => {});

  return NextResponse.json({ success: true });
});
