import { query } from "@/lib/db";
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
  const orders = await query('SELECT * FROM orders ORDER BY createdAt DESC');
  return orders.map(toOrder);
}

export async function readOrdersByDate(date: string): Promise<Order[]> {
  const orders = await query('SELECT * FROM orders WHERE orderDate = ? ORDER BY createdAt DESC', [date]);
  return orders.map(toOrder);
}

export async function readPendingOrdersCount(): Promise<number> {
  const rows = await query('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['pending']);
  return (rows[0] as { count: number }).count;
}
