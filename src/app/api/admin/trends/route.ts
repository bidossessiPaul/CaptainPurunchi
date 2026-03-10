import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    prisma.tableReservation.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { date: true },
    }),
    prisma.order.findMany({
      where: { orderDate: { gte: startDate, lte: endDate } },
      select: { orderDate: true },
    }),
    prisma.roomReservation.findMany({
      where: { checkIn: { gte: startDate, lte: endDate } },
      select: { checkIn: true },
    }),
    prisma.eventReservation.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate + "T23:59:59Z") } },
      select: { createdAt: true },
    }),
  ]);

  // Count per day
  const tableCounts: Record<string, number> = {};
  for (const r of tables) {
    tableCounts[r.date] = (tableCounts[r.date] || 0) + 1;
  }

  const orderCounts: Record<string, number> = {};
  for (const o of orders) {
    orderCounts[o.orderDate] = (orderCounts[o.orderDate] || 0) + 1;
  }

  const roomCounts: Record<string, number> = {};
  for (const r of rooms) {
    roomCounts[r.checkIn] = (roomCounts[r.checkIn] || 0) + 1;
  }

  const eventCounts: Record<string, number> = {};
  for (const e of events) {
    const d = e.createdAt.toISOString().split("T")[0];
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
