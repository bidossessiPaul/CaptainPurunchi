import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { sendCustomerReservationConfirmation } from "@/lib/mail";
import { notifyTeamNewReservation } from "@/lib/notification-helpers";

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
  const { customerName, customerPhone, customerEmail, eventId, eventTitle, attendees, notes, paymentMethod } = body;

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
      customerEmail: customerEmail || "",
      eventId,
      eventTitle,
      attendees: attendees || "",
      notes: notes || "",
      paymentMethod: paymentMethod || "",
    },
  });

  // Send customer confirmation email (non-blocking)
  if (customerEmail) {
    sendCustomerReservationConfirmation({
      to: customerEmail,
      customerName,
      type: "event",
      details: [
        { label: "Événement", value: eventTitle },
        { label: "Participants", value: attendees || "Non précisé" },
      ],
    }).catch(() => {});
  }

  // Notify team (non-blocking)
  notifyTeamNewReservation("event", customerName, `${eventTitle} — ${attendees || "?"} pers.`, eventTitle).catch(() => {});

  return NextResponse.json(
    {
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    },
    { status: 201 }
  );
});
