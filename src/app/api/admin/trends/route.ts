import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(Number(searchParams.get("days")) || 30, 365);

  // Build date range
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  // Fetch all 4 datasets in parallel
  const [tables, orders, rooms, events] = await Promise.all([
    query('SELECT date FROM table_reservations WHERE date >= ? AND date <= ?', [startDate, endDate]),
    query('SELECT orderDate FROM orders WHERE orderDate >= ? AND orderDate <= ?', [startDate, endDate]),
    query('SELECT checkIn FROM room_reservations WHERE checkIn >= ? AND checkIn <= ?', [startDate, endDate]),
    query('SELECT createdAt FROM event_reservations WHERE createdAt >= ? AND createdAt <= ?', [new Date(startDate), new Date(endDate + "T23:59:59Z")]),
  ]);

  // Count per day
  const tableCounts: Record<string, number> = {};
  for (const r of tables as { date: string }[]) {
    tableCounts[r.date] = (tableCounts[r.date] || 0) + 1;
  }

  const orderCounts: Record<string, number> = {};
  for (const o of orders as { orderDate: string }[]) {
    orderCounts[o.orderDate] = (orderCounts[o.orderDate] || 0) + 1;
  }

  const roomCounts: Record<string, number> = {};
  for (const r of rooms as { checkIn: string }[]) {
    roomCounts[r.checkIn] = (roomCounts[r.checkIn] || 0) + 1;
  }

  const eventCounts: Record<string, number> = {};
  for (const e of events as { createdAt: string }[]) {
    const d = e.createdAt.split("T")[0];
    eventCounts[d] = (eventCounts[d] || 0) + 1;
  }

  // Assemble result
  const data = dates.map((date) => ({
    date,
    tables: tableCounts[date] || 0,
    orders: orderCounts[date] || 0,
    rooms: roomCounts[date] || 0,
    events: eventCounts[date] || 0,
  }));

  return NextResponse.json(data);
}
