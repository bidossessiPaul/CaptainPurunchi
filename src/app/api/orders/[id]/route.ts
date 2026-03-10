import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { sendCustomerOrderStatusNotification } from "@/lib/mail";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.items !== undefined) data.items = JSON.stringify(body.items);
  if (body.totalAmount !== undefined) data.totalAmount = body.totalAmount;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.status !== undefined) data.status = body.status;
  if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;

  const updated = await prisma.order.update({ where: { id }, data });

  // Send status change email to customer
  if (body.status && body.status !== existing.status && updated.customerEmail) {
    if (body.status === "confirmed" || body.status === "cancelled") {
      sendCustomerOrderStatusNotification({
        to: updated.customerEmail,
        customerName: updated.customerName,
        status: body.status,
        totalAmount: updated.totalAmount,
      }).catch(() => {});
    }
  }

  // Log activity
  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "update",
      target: "order",
      targetId: id,
      details: body.status && body.status !== existing.status
        ? `Statut: ${existing.status} → ${body.status}`
        : `Commande modifiée (${updated.customerName})`,
    }).catch(() => {});
  }

  return NextResponse.json({ ...updated, items: JSON.parse(updated.items) });
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.order.delete({ where: { id } });

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "order",
      targetId: id,
      details: `Commande supprimée (${existing.customerName})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
