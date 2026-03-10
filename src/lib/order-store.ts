import { prisma } from "@/lib/prisma";
import type { Order } from "@/app/types/order";

function toOrder(o: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: string;
  totalAmount: string;
  notes: string;
  status: string;
  paymentMethod: string;
  orderDate: string;
  createdAt: Date;
  updatedAt: Date;
}): Order {
  return {
    ...o,
    items: JSON.parse(o.items),
    status: o.status as Order["status"],
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export async function readAllOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return orders.map(toOrder);
}

export async function readOrdersByDate(date: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { orderDate: date },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toOrder);
}

export async function readPendingOrdersCount(): Promise<number> {
  return prisma.order.count({ where: { status: "pending" } });
}
