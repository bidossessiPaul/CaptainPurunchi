import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

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
  const { customerName, customerPhone, items, totalAmount, notes, orderDate } = body;

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
      items: JSON.stringify(items),
      totalAmount: totalAmount || "",
      notes: notes || "",
      status: "pending",
      orderDate: orderDate || new Date().toISOString().split("T")[0],
    },
  });

  return NextResponse.json(
    { ...order, items: JSON.parse(order.items) },
    { status: 201 }
  );
});
