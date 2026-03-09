import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.tag !== undefined) data.tag = body.tag;
  if (body.title !== undefined) data.title = body.title;
  if (body.shortDesc !== undefined) data.shortDesc = body.shortDesc;
  if (body.description !== undefined) data.description = body.description;
  if (body.day !== undefined) data.day = body.day;
  if (body.month !== undefined) data.month = body.month;
  if (body.time !== undefined) data.time = body.time;
  if (body.location !== undefined) data.location = body.location;
  if (body.price !== undefined) data.price = body.price;
  if (body.thumb !== undefined) data.thumb = body.thumb;
  if (body.gallery !== undefined) data.gallery = JSON.stringify(body.gallery);
  if (body.includes !== undefined) data.includes = JSON.stringify(body.includes);
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.event.update({ where: { id }, data });
  return NextResponse.json({
    ...updated,
    gallery: JSON.parse(updated.gallery),
    includes: JSON.parse(updated.includes),
  });
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });

  // Re-index remaining events
  const remaining = await prisma.event.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.event.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  return NextResponse.json({ success: true });
});
