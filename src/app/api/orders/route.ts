import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { sendCustomerOrderConfirmation } from "@/lib/mail";
import { notifyTeamNewOrder } from "@/lib/notification-helpers";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params: unknown[] = [];

  if (date) {
    sql += ' AND orderDate = ?';
    params.push(date);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY createdAt DESC';

  const orders = await query(sql, params);

  return NextResponse.json(
    orders.map((o: { items: string }) => ({ ...o, items: JSON.parse(o.items) }))
  );
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { customerName, customerPhone, customerEmail, items, totalAmount, notes, orderDate, paymentMethod } = body;

  if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "customerName, customerPhone and items are required" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  await query(
    'INSERT INTO orders (id, customerName, customerPhone, customerEmail, items, totalAmount, notes, status, paymentMethod, orderDate, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, customerName, customerPhone, customerEmail || "", JSON.stringify(items), totalAmount || "", notes || "", 'pending', paymentMethod || "", orderDate || new Date().toISOString().split("T")[0], new Date()]
  );

  const rows = await query('SELECT * FROM orders WHERE id = ?', [id]);
  const order = rows[0];

  // Send customer confirmation email (non-blocking)
  if (customerEmail) {
    sendCustomerOrderConfirmation({
      to: customerEmail,
      customerName,
      items: items.map((i: { dishName: string; quantity: number; price: string }) => ({
        name: i.dishName,
        qty: i.quantity,
        price: i.price,
      })),
      totalAmount: totalAmount || "",
    }).catch(() => {});
  }

  // Notify team (non-blocking)
  notifyTeamNewOrder(customerName, items.length, totalAmount || "").catch(() => {});

  return NextResponse.json(
    { ...order, items: JSON.parse(order.items) },
    { status: 201 }
  );
});
