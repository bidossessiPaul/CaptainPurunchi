import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const rows = await prisma.roomReservation.findMany({
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
  const { customerName, customerPhone, roomId, roomName, checkIn, checkOut, guests, notes } = body;

  if (!customerName || !customerPhone || !roomId || !roomName || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "customerName, customerPhone, roomId, roomName, checkIn and checkOut are required" },
      { status: 400 }
    );
  }

  const reservation = await prisma.roomReservation.create({
    data: {
      customerName,
      customerPhone,
      roomId,
      roomName,
      checkIn,
      checkOut,
      guests: guests || "",
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
