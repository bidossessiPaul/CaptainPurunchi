import { prisma } from "@/lib/prisma";
import type { HeroSlide } from "@/app/types/hero";

function toHeroSlide(s: { id: string; src: string; title: string | null; subtitle: string | null; caption: string | null; order: number; active: boolean; createdAt: Date }): HeroSlide {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

export async function readSlides(): Promise<HeroSlide[]> {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  return slides.map(toHeroSlide);
}

export async function readActiveSlides(): Promise<HeroSlide[]> {
  const slides = await prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return slides.map(toHeroSlide);
}
