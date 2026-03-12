import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { sendCustomerOrderStatusNotification } from "@/lib/mail";
import { createRevenueFromOrder } from "@/lib/revenue-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await query('SELECT * FROM orders WHERE id = ?', [id]);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
  if (body.items !== undefined) {
    fields.push('items = ?');
    values.push(JSON.stringify(body.items));
  }
  if (body.totalAmount !== undefined) {
    fields.push('totalAmount = ?');
    values.push(body.totalAmount);
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
    await query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  const updated = await query('SELECT * FROM orders WHERE id = ?', [id]);
  const updatedRecord = updated[0];

  // AUTO-CREATE REVENUE when order status changes to "completed"
  const me = await getSessionUser();
  if (
    body.status === "completed" &&
    existing[0].status !== "completed" &&
    updatedRecord.totalAmount > 0
  ) {
    try {
      await createRevenueFromOrder(
        id,
        updatedRecord.totalAmount,
        updatedRecord.paymentMethod || "especes",
        updatedRecord.orderDate,
        me?.id || "system"
      );
      console.log(`✅ Revenue auto-created for Order ${id}`);
    } catch (error) {
      console.error(`❌ Failed to create revenue for Order ${id}:`, error);
      // Continue anyway - don't block the order update
    }
  }

  // Send status change email to customer
  if (body.status && body.status !== existing[0].status && updatedRecord.customerEmail) {
    if (body.status === "confirmed" || body.status === "cancelled") {
      sendCustomerOrderStatusNotification({
        to: updatedRecord.customerEmail,
        customerName: updatedRecord.customerName,
        status: body.status,
        totalAmount: updatedRecord.totalAmount,
      }).catch(() => {});
    }
  }

  // Log activity
  const meForLog = me || await getSessionUser();
  if (meForLog) {
    logActivity({
      userId: meForLog.id,
      userName: meForLog.name,
      action: "update",
      target: "order",
      targetId: id,
      details: body.status && body.status !== existing[0].status
        ? `Statut: ${existing[0].status} → ${body.status}`
        : `Commande modifiée (${updatedRecord.customerName})`,
    }).catch(() => {});
  }

  return NextResponse.json({ ...updatedRecord, items: JSON.parse(updatedRecord.items) });
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await query('SELECT * FROM orders WHERE id = ?', [id]);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await query('DELETE FROM orders WHERE id = ?', [id]);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "order",
      targetId: id,
      details: `Commande supprimée (${existing[0].customerName})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
