import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (date) where.date = date;
  if (status) where.status = status;

  const rows = await prisma.tableReservation.findMany({
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
  const { name, phone, numberOfPersons, date, time, message } = body;

  if (!name || !phone || !numberOfPersons || !date || !time) {
    return NextResponse.json(
      { error: "name, phone, numberOfPersons, date and time are required" },
      { status: 400 }
    );
  }

  const reservation = await prisma.tableReservation.create({
    data: {
      name,
      phone,
      numberOfPersons,
      date,
      time,
      message: message || "",
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
