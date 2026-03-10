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

  const existing = await readExpenseById(id);
  if (!existing) {
    return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.category !== undefined) data.category = body.category;
  if (body.supplier !== undefined) data.supplier = body.supplier;
  if (body.description !== undefined) data.description = body.description;
  if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;
  if (body.receipt !== undefined) data.receipt = body.receipt;
  if (body.date !== undefined) data.date = body.date;
  if (body.status !== undefined) data.status = body.status;

  const updated = await updateExpense(id, data);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "update",
      target: "expense",
      targetId: id,
      details: `Dépense modifiée (${updated.amount} FCFA)`,
    }).catch(() => {});
  }

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readExpenseById(id);
  if (!existing) {
    return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
  }

  await deleteExpense(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "expense",
      targetId: id,
      details: `Dépense supprimée (${existing.amount} FCFA - ${existing.category})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
