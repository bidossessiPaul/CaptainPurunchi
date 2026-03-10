import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readInvoiceById, updateInvoice, deleteInvoice } from "@/lib/invoice-store";
import { readContactInfo } from "@/lib/contact-store";
import { sendInvoiceEmail } from "@/lib/mail";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readInvoiceById(id);
  if (!existing) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const locked = ["sent", "paid", "cancelled"];
  const isStatusChange = body.status && body.status !== existing.status;
  const isContentEdit = !isStatusChange && Object.keys(body).some(
    (k) => !["status", "resendEmail"].includes(k)
  );

  // Block content edits on locked invoices (only status transitions allowed)
  if (locked.includes(existing.status) && isContentEdit) {
    return NextResponse.json(
      { error: "Cette facture est verrouillée et ne peut plus être modifiée." },
      { status: 403 }
    );
  }

  // Block deletion-like status changes: paid/cancelled can't go back to draft
  if (isStatusChange) {
    const allowed: Record<string, string[]> = {
      draft: ["sent", "paid", "cancelled"],
      sent: ["paid", "cancelled"],
      paid: [],       // no changes allowed
      cancelled: [],  // no changes allowed
    };
    if (!(allowed[existing.status] || []).includes(body.status)) {
      return NextResponse.json(
        { error: `Transition de statut non autorisée : ${existing.status} → ${body.status}` },
        { status: 403 }
      );
    }
  }

  const data: Record<string, unknown> = {};

  // Only allow content edits on draft invoices
  if (existing.status === "draft") {
    if (body.customerName !== undefined) data.customerName = body.customerName;
    if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
    if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone;
    if (body.items !== undefined) data.items = typeof body.items === "string" ? body.items : JSON.stringify(body.items);
    if (body.subtotal !== undefined) data.subtotal = Number(body.subtotal);
    if (body.tax !== undefined) data.tax = Number(body.tax);
    if (body.total !== undefined) data.total = Number(body.total);
    if (body.dueDate !== undefined) data.dueDate = body.dueDate;
    if (body.notes !== undefined) data.notes = body.notes;
  }

  // Status transitions always allowed (if valid per rules above)
  if (isStatusChange) {
    data.status = body.status;
    if (body.status === "paid") data.paidDate = new Date().toISOString().split("T")[0];
  }

  const updated = await updateInvoice(id, data);

  // Send invoice email when status changes to "sent" or resend requested
  if ((isStatusChange && body.status === "sent" || body.resendEmail) && updated.customerEmail) {
    const items = JSON.parse(updated.items) as { description: string; qty: number; unitPrice: number; total: number }[];
    const contact = await readContactInfo();
    sendInvoiceEmail({
      to: updated.customerEmail,
      invoiceNumber: updated.invoiceNumber,
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      customerPhone: updated.customerPhone,
      items,
      subtotal: updated.subtotal,
      tax: updated.tax,
      total: updated.total,
      status: updated.status,
      dueDate: updated.dueDate,
      createdAt: updated.createdAt,
      notes: updated.notes,
      company: {
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
      },
    }).catch(() => {});
  }

  const me = await getSessionUser();
  if (me) {
    const statusChange = body.status && body.status !== existing.status
      ? `Statut: ${existing.status} → ${body.status}`
      : `Facture modifiée (${updated.invoiceNumber})`;
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "update",
      target: "invoice",
      targetId: id,
      details: statusChange,
    }).catch(() => {});
  }

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readInvoiceById(id);
  if (!existing) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  if (existing.status === "paid" || existing.status === "sent") {
    return NextResponse.json(
      { error: "Impossible de supprimer une facture envoyée ou payée." },
      { status: 403 }
    );
  }

  await deleteInvoice(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "invoice",
      targetId: id,
      details: `Facture supprimée (${existing.invoiceNumber})`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
