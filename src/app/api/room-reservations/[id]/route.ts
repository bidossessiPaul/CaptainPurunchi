import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { checkRoomAvailability, readRoomReservationById, updateRoomReservation, deleteRoomReservation } from "@/lib/room-reservation-store";
import { sendCustomerStatusNotification } from "@/lib/mail";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readRoomReservationById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check availability if room or dates changed
  if (body.roomId || body.checkIn || body.checkOut) {
    const newRoomId = body.roomId ?? existing.roomId;
    const newCheckIn = body.checkIn ?? existing.checkIn;
    const newCheckOut = body.checkOut ?? existing.checkOut;
    const available = await checkRoomAvailability(newRoomId, newCheckIn, newCheckOut, id);
    if (!available) {
      return NextResponse.json(
        { error: "Cette chambre n'est pas disponible pour ces dates" },
        { status: 409 }
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.roomId !== undefined) data.roomId = body.roomId;
  if (body.roomName !== undefined) data.roomName = body.roomName;
  if (body.checkIn !== undefined) data.checkIn = body.checkIn;
  if (body.checkOut !== undefined) data.checkOut = body.checkOut;
  if (body.guests !== undefined) data.guests = body.guests;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.status !== undefined) data.status = body.status;
  if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;

  const updated = await updateRoomReservation(id, data);
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Send status change email to customer
  if (body.status && body.status !== existing.status && updated.customerEmail) {
    if (body.status === "confirmed" || body.status === "cancelled") {
      sendCustomerStatusNotification({
        to: updated.customerEmail,
        customerName: updated.customerName,
        type: "room",
        status: body.status,
        details: [
          { label: "Chambre", value: updated.roomName },
          { label: "Arrivée", value: updated.checkIn },
          { label: "Départ", value: updated.checkOut },
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
      target: "room-reservation",
      targetId: id,
      details: body.status && body.status !== existing.status
        ? `Statut: ${existing.status} → ${body.status}`
        : `Réservation chambre modifiée (${updated.customerName})`,
    }).catch(() => {});
  }

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readRoomReservationById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteRoomReservation(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "room-reservation",
      targetId: id,
      details: `Réservation supprimée (${existing.customerName} — ${existing.roomName})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
