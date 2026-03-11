import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { sendCustomerReservationConfirmation } from "@/lib/mail";
import { notifyTeamNewReservation } from "@/lib/notification-helpers";
import { readTableReservationsByFilters, createTableReservation } from "@/lib/table-reservation-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const filters: { date?: string; status?: string } = {};
  if (date) filters.date = date;
  if (status) filters.status = status;

  const rows = await readTableReservationsByFilters(filters);

  return NextResponse.json(rows);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { name, phone, email, numberOfPersons, date, time, message, paymentMethod } = body;

  if (!name || !phone || !numberOfPersons || !date || !time) {
    return NextResponse.json(
      { error: "name, phone, numberOfPersons, date and time are required" },
      { status: 400 }
    );
  }

  const reservation = await createTableReservation({
    name,
    phone,
    email: email || "",
    numberOfPersons,
    date,
    time,
    message: message || "",
    paymentMethod: paymentMethod || "",
  });

  // Send customer confirmation email (non-blocking)
  if (email) {
    sendCustomerReservationConfirmation({
      to: email,
      customerName: name,
      type: "table",
      details: [
        { label: "Date", value: date },
        { label: "Heure", value: time },
        { label: "Personnes", value: numberOfPersons },
      ],
    }).catch(() => {});
  }

  // Notify team (non-blocking)
  notifyTeamNewReservation("table", name, `${numberOfPersons} pers. à ${time}`, date).catch(() => {});

  return NextResponse.json(reservation, { status: 201 });
});
