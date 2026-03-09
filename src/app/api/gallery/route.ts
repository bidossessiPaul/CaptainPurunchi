import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(images);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { src, alt, type } = body;

  if (!src) {
    return NextResponse.json({ error: "src is required" }, { status: 400 });
  }

  const count = await prisma.galleryImage.count();

  const image = await prisma.galleryImage.create({
    data: {
      src,
      alt: alt || "",
      type: type === "video" ? "video" : "image",
      order: count,
      active: true,
    },
  });

  return NextResponse.json(image, { status: 201 });
});
