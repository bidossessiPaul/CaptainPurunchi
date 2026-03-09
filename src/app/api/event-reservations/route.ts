import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const rows = await prisma.eventReservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  );
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { customerName, customerPhone, eventId, eventTitle, attendees, notes } = body;

  if (!customerName || !customerPhone || !eventId || !eventTitle) {
    return NextResponse.json(
      { error: "customerName, customerPhone, eventId and eventTitle are required" },
      { status: 400 }
    );
  }

  const reservation = await prisma.eventReservation.create({
    data: {
      customerName,
      customerPhone,
      eventId,
      eventTitle,
      attendees: attendees || "",
      notes: notes || "",
    },
  });

  return NextResponse.json(
    {
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    },
    { status: 201 }
  );
});
