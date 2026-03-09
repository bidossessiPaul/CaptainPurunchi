import { prisma } from "@/lib/prisma";
import type { Room } from "@/app/types/room";

function toRoom(r: {
  id: string;
  name: string;
  shortDesc: string;
  price: string;
  thumb: string;
  capacity: string;
  features: string;
  description: string;
  gallery: string;
  order: number;
  active: boolean;
  createdAt: Date;
}): Room {
  return {
    ...r,
    features: JSON.parse(r.features) as string[],
    gallery: JSON.parse(r.gallery) as string[],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readRooms(): Promise<Room[]> {
  const items = await prisma.room.findMany({ orderBy: { order: "asc" } });
  return items.map(toRoom);
}

export async function readActiveRooms(): Promise<Room[]> {
  const items = await prisma.room.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return items.map(toRoom);
}
