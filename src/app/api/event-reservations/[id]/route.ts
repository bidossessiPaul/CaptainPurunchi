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

  const existing = await prisma.eventReservation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.eventId !== undefined) data.eventId = body.eventId;
  if (body.eventTitle !== undefined) data.eventTitle = body.eventTitle;
  if (body.attendees !== undefined) data.attendees = body.attendees;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.status !== undefined) data.status = body.status;
  if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;

  const updated = await prisma.eventReservation.update({ where: { id }, data });

  // Send status change email to customer
  if (body.status && body.status !== existing.status && updated.customerEmail) {
    if (body.status === "confirmed" || body.status === "cancelled") {
      sendCustomerStatusNotification({
        to: updated.customerEmail,
        customerName: updated.customerName,
        type: "event",
        status: body.status,
        details: [
          { label: "Événement", value: updated.eventTitle },
          { label: "Participants", value: updated.attendees },
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
      target: "event-reservation",
      targetId: id,
      details: body.status && body.status !== existing.status
        ? `Statut: ${existing.status} → ${body.status}`
        : `Réservation événement modifiée (${updated.customerName})`,
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

  const existing = await prisma.eventReservation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.eventReservation.delete({ where: { id } });

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "event-reservation",
      targetId: id,
      details: `Réservation supprimée (${existing.customerName} — ${existing.eventTitle})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
