import { prisma } from "@/lib/prisma";
import type { GalleryImage } from "@/app/types/gallery";

function toGalleryImage(g: {
  id: string;
  src: string;
  alt: string;
  type: string;
  order: number;
  active: boolean;
  createdAt: Date;
}): GalleryImage {
  return { ...g, type: g.type as "image" | "video", createdAt: g.createdAt.toISOString() };
}

export async function readGalleryImages(): Promise<GalleryImage[]> {
  const items = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  return items.map(toGalleryImage);
}

export async function readActiveGalleryImages(): Promise<GalleryImage[]> {
  const items = await prisma.galleryImage.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return items.map(toGalleryImage);
}
