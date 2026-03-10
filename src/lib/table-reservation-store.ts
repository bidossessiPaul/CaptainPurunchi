import { prisma } from "@/lib/prisma";
import type { TableReservation } from "@/app/types/table-reservation";

function toTableReservation(r: {
  id: string;
  name: string;
  phone: string;
  email: string;
  numberOfPersons: string;
  date: string;
  time: string;
  message: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}): TableReservation {
  return {
    ...r,
    status: r.status as TableReservation["status"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function readAllTableReservations(): Promise<TableReservation[]> {
  const rows = await prisma.tableReservation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toTableReservation);
}

export async function readTableReservationsByDate(date: string): Promise<TableReservation[]> {
  const rows = await prisma.tableReservation.findMany({
    where: { date },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toTableReservation);
}

export async function readPendingTableReservationsCount(): Promise<number> {
  return prisma.tableReservation.count({ where: { status: "pending" } });
}
