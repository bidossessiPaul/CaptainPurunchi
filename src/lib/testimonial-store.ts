import { prisma } from "@/lib/prisma";
import type { Testimonial } from "@/app/types/testimonial";

function toTestimonial(r: {
  id: string;
  text: string;
  name: string;
  role: string;
  image: string | null;
  avatar: string | null;
  stars: number;
  order: number;
  active: boolean;
  createdAt: Date;
}): Testimonial {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readTestimonials(): Promise<Testimonial[]> {
  const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return items.map(toTestimonial);
}

export async function readActiveTestimonials(): Promise<Testimonial[]> {
  const items = await prisma.testimonial.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return items.map(toTestimonial);
}
