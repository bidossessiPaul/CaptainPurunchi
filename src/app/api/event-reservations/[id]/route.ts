import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { sendCustomerStatusNotification } from "@/lib/mail";
import { createRevenueFromEventReservation } from "@/lib/revenue-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await query('SELECT * FROM event_reservations WHERE id = ?', [id]);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.customerName !== undefined) {
    fields.push('customerName = ?');
    values.push(body.customerName);
  }
  if (body.customerPhone !== undefined) {
    fields.push('customerPhone = ?');
    values.push(body.customerPhone);
  }
  if (body.customerEmail !== undefined) {
    fields.push('customerEmail = ?');
    values.push(body.customerEmail);
  }
  if (body.eventId !== undefined) {
    fields.push('eventId = ?');
    values.push(body.eventId);
  }
  if (body.eventTitle !== undefined) {
    fields.push('eventTitle = ?');
    values.push(body.eventTitle);
  }
  if (body.attendees !== undefined) {
    fields.push('attendees = ?');
    values.push(body.attendees);
  }
  if (body.notes !== undefined) {
    fields.push('notes = ?');
    values.push(body.notes);
  }
  if (body.status !== undefined) {
    fields.push('status = ?');
    values.push(body.status);
  }
  if (body.paymentMethod !== undefined) {
    fields.push('paymentMethod = ?');
    values.push(body.paymentMethod);
  }

  if (fields.length > 0) {
    values.push(id);
    await query(`UPDATE event_reservations SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  const updated = await query('SELECT * FROM event_reservations WHERE id = ?', [id]);
  const updatedRecord = updated[0];

  // AUTO-CREATE REVENUE when reservation status changes to "confirmed"
  const me = await getSessionUser();
  if (
    body.status === "confirmed" &&
    existing[0].status !== "confirmed" &&
    updatedRecord.totalPrice > 0
  ) {
    try {
      // Use eventDate if available, otherwise use current date
      const revenueDate = updatedRecord.eventDate || new Date().toISOString().split('T')[0];
      await createRevenueFromEventReservation(
        id,
        updatedRecord.totalPrice,
        updatedRecord.paymentMethod || "especes",
        revenueDate,
        me?.id || "system"
      );
      console.log(`✅ Revenue auto-created for EventReservation ${id}`);
    } catch (error) {
      console.error(`❌ Failed to create revenue for EventReservation ${id}:`, error);
      // Continue anyway - don't block the reservation update
    }
  }

  // Send status change email to customer
  if (body.status && body.status !== existing[0].status && updatedRecord.customerEmail) {
    if (body.status === "confirmed" || body.status === "cancelled") {
      sendCustomerStatusNotification({
        to: updatedRecord.customerEmail,
        customerName: updatedRecord.customerName,
        type: "event",
        status: body.status,
        details: [
          { label: "Événement", value: updatedRecord.eventTitle },
          { label: "Participants", value: updatedRecord.attendees },
        ],
      }).catch(() => {});
    }
  }

  // Log activity
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "update",
      target: "event-reservation",
      targetId: id,
      details: body.status && body.status !== existing[0].status
        ? `Statut: ${existing[0].status} → ${body.status}`
        : `Réservation événement modifiée (${updatedRecord.customerName})`,
    }).catch(() => {});
  }

  return NextResponse.json(updatedRecord);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await query('SELECT * FROM event_reservations WHERE id = ?', [id]);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await query('DELETE FROM event_reservations WHERE id = ?', [id]);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "event-reservation",
      targetId: id,
      details: `Réservation supprimée (${existing[0].customerName} — ${existing[0].eventTitle})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
