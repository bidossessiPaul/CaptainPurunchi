import { prisma } from "@/lib/prisma";
import type { RoomReservation } from "@/app/types/room-reservation";

function toRoomReservation(r: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  notes: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}): RoomReservation {
  return {
    ...r,
    status: r.status as RoomReservation["status"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readAllRoomReservations(): Promise<RoomReservation[]> {
  const rows = await prisma.roomReservation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRoomReservation);
}

export async function readPendingRoomReservationsCount(): Promise<number> {
  return prisma.roomReservation.count({ where: { status: "pending" } });
}

/**
 * Check if a room is available for given dates.
 * Returns true if no overlapping non-cancelled reservations exist.
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string
): Promise<boolean> {
  const where: Record<string, unknown> = {
    roomId,
    status: { not: "cancelled" },
    checkIn: { lt: checkOut },
    checkOut: { gt: checkIn },
  };
  if (excludeId) {
    where.id = { not: excludeId };
  }

  const overlapping = await prisma.roomReservation.findFirst({ where });
  return overlapping === null;
}
