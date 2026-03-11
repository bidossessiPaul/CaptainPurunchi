import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { checkRoomAvailability, readRoomReservationsByStatus, createRoomReservation } from "@/lib/room-reservation-store";
import { sendCustomerReservationConfirmation } from "@/lib/mail";
import { notifyTeamNewReservation } from "@/lib/notification-helpers";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const rows = await readRoomReservationsByStatus(status || undefined);

  return NextResponse.json(rows);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { customerName, customerPhone, customerEmail, roomId, roomName, checkIn, checkOut, guests, notes, paymentMethod } = body;

  if (!customerName || !customerPhone || !roomId || !roomName || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "customerName, customerPhone, roomId, roomName, checkIn and checkOut are required" },
      { status: 400 }
    );
  }

  // Check room availability
  const available = await checkRoomAvailability(roomId, checkIn, checkOut);
  if (!available) {
    return NextResponse.json(
      { error: "Cette chambre n'est pas disponible pour ces dates" },
      { status: 409 }
    );
  }

  const reservation = await createRoomReservation({
    customerName,
    customerPhone,
    customerEmail: customerEmail || "",
    roomId,
    roomName,
    checkIn,
    checkOut,
    guests: guests || "",
    notes: notes || "",
    paymentMethod: paymentMethod || "",
  });

  // Send customer confirmation email (non-blocking)
  if (customerEmail) {
    sendCustomerReservationConfirmation({
      to: customerEmail,
      customerName,
      type: "room",
      details: [
        { label: "Chambre", value: roomName },
        { label: "Arrivée", value: checkIn },
        { label: "Départ", value: checkOut },
        { label: "Voyageurs", value: guests || "Non précisé" },
      ],
    }).catch(() => {});
  }

  // Notify team (non-blocking)
  notifyTeamNewReservation("room", customerName, `${roomName} du ${checkIn} au ${checkOut}`, checkIn).catch(() => {});

  return NextResponse.json(
    reservation,
    { status: 201 }
  );
});
