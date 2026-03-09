import { prisma } from "@/lib/prisma";
import type { Specialty } from "@/app/types/specialty";

function toSpecialty(s: {
  id: string;
  title: string;
  description: string;
  src: string;
  order: number;
  active: boolean;
  createdAt: Date;
}): Specialty {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

export async function readSpecialties(): Promise<Specialty[]> {
  const items = await prisma.specialty.findMany({ orderBy: { order: "asc" } });
  return items.map(toSpecialty);
}

export async function readActiveSpecialties(): Promise<Specialty[]> {
  const items = await prisma.specialty.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return items.map(toSpecialty);
}
