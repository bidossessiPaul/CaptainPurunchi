import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { sendCustomerReservationConfirmation } from "@/lib/mail";
import { notifyTeamNewReservation } from "@/lib/notification-helpers";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let sql = 'SELECT * FROM event_reservations';
  const params: unknown[] = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY createdAt DESC';

  const rows = await query(sql, params);

  return NextResponse.json(rows);
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

  const id = crypto.randomUUID();
  await query(
    'INSERT INTO event_reservations (id, customerName, customerPhone, customerEmail, eventId, eventTitle, attendees, notes, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, customerName, customerPhone, customerEmail || "", eventId, eventTitle, attendees || "", notes || "", paymentMethod || "", 'pending']
  );

  const rows = await query('SELECT * FROM event_reservations WHERE id = ?', [id]);
  const reservation = rows[0];

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
    }).catch((err) => console.error("[MAIL] Customer event confirmation failed:", err?.message));
  } else {
    console.warn("[MAIL] No email provided for event reservation by", customerName);
  }

  // Notify team (non-blocking)
  notifyTeamNewReservation("event", customerName, `${eventTitle} — ${attendees || "?"} pers.`, eventTitle).catch((err) => console.error("[MAIL] Team notification failed:", err?.message));

  return NextResponse.json(reservation, { status: 201 });
});
