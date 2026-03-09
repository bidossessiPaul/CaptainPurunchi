import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(slides);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { src, title, subtitle, caption } = body;

  if (!src) {
    return NextResponse.json({ error: "src is required" }, { status: 400 });
  }

  const count = await prisma.heroSlide.count();

  const slide = await prisma.heroSlide.create({
    data: {
      src,
      title: title || null,
      subtitle: subtitle || null,
      caption: caption || null,
      order: count,
      active: true,
    },
  });

  return NextResponse.json(slide, { status: 201 });
});
