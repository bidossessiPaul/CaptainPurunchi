import { prisma } from "@/lib/prisma";
import type { Event } from "@/app/types/event";

function toEvent(r: {
  id: string;
  featured: boolean;
  tag: string;
  title: string;
  shortDesc: string;
  description: string;
  day: string;
  month: string;
  time: string;
  location: string;
  price: string;
  thumb: string;
  gallery: string;
  includes: string;
  order: number;
  active: boolean;
  createdAt: Date;
}): Event {
  return {
    ...r,
    gallery: JSON.parse(r.gallery) as string[],
    includes: JSON.parse(r.includes) as string[],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readEvents(): Promise<Event[]> {
  const items = await prisma.event.findMany({ orderBy: { order: "asc" } });
  return items.map(toEvent);
}

export async function readActiveEvents(): Promise<Event[]> {
  const items = await prisma.event.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return items.map(toEvent);
}
