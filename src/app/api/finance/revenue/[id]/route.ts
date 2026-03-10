import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readRevenueById, updateRevenue, deleteRevenue } from "@/lib/revenue-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readRevenueById(id);
  if (!existing) {
    return NextResponse.json({ error: "Revenu introuvable" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.source !== undefined) data.source = body.source;
  if (body.sourceId !== undefined) data.sourceId = body.sourceId;
  if (body.description !== undefined) data.description = body.description;
  if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;
  if (body.date !== undefined) data.date = body.date;

  const updated = await updateRevenue(id, data);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "update",
      target: "revenue",
      targetId: id,
      details: `Revenu modifié (${updated.amount} FCFA)`,
    }).catch(() => {});
  }

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readRevenueById(id);
  if (!existing) {
    return NextResponse.json({ error: "Revenu introuvable" }, { status: 404 });
  }

  await deleteRevenue(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "revenue",
      targetId: id,
      details: `Revenu supprimé (${existing.amount} FCFA - ${existing.source})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
