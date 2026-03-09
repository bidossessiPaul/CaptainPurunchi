import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.shortDesc !== undefined) data.shortDesc = body.shortDesc;
  if (body.price !== undefined) data.price = body.price;
  if (body.thumb !== undefined) data.thumb = body.thumb;
  if (body.capacity !== undefined) data.capacity = body.capacity;
  if (body.features !== undefined) data.features = JSON.stringify(body.features);
  if (body.description !== undefined) data.description = body.description;
  if (body.gallery !== undefined) data.gallery = JSON.stringify(body.gallery);
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.room.update({ where: { id }, data });
  return NextResponse.json({
    ...updated,
    features: JSON.parse(updated.features),
    gallery: JSON.parse(updated.gallery),
  });
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await prisma.room.delete({ where: { id } });

  // Re-index remaining rooms
  const remaining = await prisma.room.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.room.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  return NextResponse.json({ success: true });
});
