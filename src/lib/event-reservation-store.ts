import { prisma } from "@/lib/prisma";
import type { EventReservation } from "@/app/types/event-reservation";

function toEventReservation(r: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventId: string;
  eventTitle: string;
  attendees: string;
  notes: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}): EventReservation {
  return {
    ...r,
    status: r.status as EventReservation["status"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readAllEventReservations(): Promise<EventReservation[]> {
  const rows = await prisma.eventReservation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toEventReservation);
}

export async function readPendingEventReservationsCount(): Promise<number> {
  return prisma.eventReservation.count({ where: { status: "pending" } });
}
