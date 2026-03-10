import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readInvoices, createInvoice } from "@/lib/invoice-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;

  const invoices = await readInvoices({ status, dateFrom, dateTo });
  return NextResponse.json(invoices);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { customerName, items, subtotal, total } = body;

  if (!customerName || !items || !subtotal || !total) {
    return NextResponse.json(
      { error: "customerName, items, subtotal et total sont requis" },
      { status: 400 }
    );
  }

  const me = await getSessionUser();
  const invoice = await createInvoice({
    customerName,
    customerEmail: body.customerEmail || "",
    customerPhone: body.customerPhone || "",
    items: typeof items === "string" ? items : JSON.stringify(items),
    subtotal: Number(subtotal),
    tax: Number(body.tax) || 0,
    total: Number(total),
    dueDate: body.dueDate || "",
    notes: body.notes || "",
    createdBy: me?.name || "",
  });

  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "invoice",
      targetId: invoice.id,
      details: `Facture ${invoice.invoiceNumber} (${total} FCFA)`,
    }).catch(() => {});
  }

  return NextResponse.json(invoice, { status: 201 });
});
