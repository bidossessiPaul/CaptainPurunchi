import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { sendCustomerStatusNotification } from "@/lib/mail";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.tableReservation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.email !== undefined) data.email = body.email;
  if (body.numberOfPersons !== undefined) data.numberOfPersons = body.numberOfPersons;
  if (body.date !== undefined) data.date = body.date;
  if (body.time !== undefined) data.time = body.time;
  if (body.message !== undefined) data.message = body.message;
  if (body.status !== undefined) data.status = body.status;
  if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;

  const updated = await prisma.tableReservation.update({ where: { id }, data });

  // Send status change email to customer
  if (body.status && body.status !== existing.status && updated.email) {
    if (body.status === "confirmed" || body.status === "cancelled") {
      sendCustomerStatusNotification({
        to: updated.email,
        customerName: updated.name,
        type: "table",
        status: body.status,
        details: [
          { label: "Date", value: updated.date },
          { label: "Heure", value: updated.time },
          { label: "Personnes", value: updated.numberOfPersons },
        ],
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
      target: "table-reservation",
      targetId: id,
      details: body.status && body.status !== existing.status
        ? `Statut: ${existing.status} → ${body.status}`
        : `Réservation table modifiée (${updated.name})`,
    }).catch(() => {});
  }

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.tableReservation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.tableReservation.delete({ where: { id } });

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "table-reservation",
      targetId: id,
      details: `Réservation supprimée (${existing.name})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
