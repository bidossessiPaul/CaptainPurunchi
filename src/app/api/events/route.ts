import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const events = await prisma.event.findMany({ orderBy: { order: "asc" } });
  const parsed = events.map((e) => ({
    ...e,
    gallery: JSON.parse(e.gallery),
    includes: JSON.parse(e.includes),
  }));
  return NextResponse.json(parsed);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { featured, tag, title, shortDesc, description, day, month, time, location, price, thumb, gallery, includes } = body;

  if (!title || !tag) {
    return NextResponse.json({ error: "title and tag are required" }, { status: 400 });
  }

  const count = await prisma.event.count();

  const event = await prisma.event.create({
    data: {
      featured: Boolean(featured),
      tag,
      title,
      shortDesc: shortDesc || "",
      description: description || "",
      day: day || "",
      month: month || "",
      time: time || "",
      location: location || "",
      price: price || "",
      thumb: thumb || "",
      gallery: JSON.stringify(gallery || []),
      includes: JSON.stringify(includes || []),
      order: count,
      active: true,
    },
  });

  return NextResponse.json({
    ...event,
    gallery: JSON.parse(event.gallery),
    includes: JSON.parse(event.includes),
  }, { status: 201 });
});
