import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { sendCustomerOrderConfirmation } from "@/lib/mail";
import { notifyTeamNewOrder } from "@/lib/notification-helpers";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const where: Record<string, string> = {};
  if (date) where.orderDate = date;
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((o) => ({ ...o, items: JSON.parse(o.items) }))
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

  const order = await prisma.order.create({
    data: {
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      items: JSON.stringify(items),
      totalAmount: totalAmount || "",
      notes: notes || "",
      status: "pending",
      paymentMethod: paymentMethod || "",
      orderDate: orderDate || new Date().toISOString().split("T")[0],
    },
  });

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
