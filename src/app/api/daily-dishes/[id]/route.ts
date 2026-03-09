import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.dailyDish.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Dish not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.category !== undefined) data.category = body.category;
  if (body.photo !== undefined) data.photo = body.photo;
  if (body.availableDate !== undefined) data.availableDate = body.availableDate;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.dailyDish.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.dailyDish.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Dish not found" }, { status: 404 });
  }

  await prisma.dailyDish.delete({ where: { id } });

  const remaining = await prisma.dailyDish.findMany({
    where: { availableDate: existing.availableDate },
    orderBy: { order: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.dailyDish.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  if (existing.photo) {
    try {
      const filePath = path.join(process.cwd(), "public", existing.photo);
      await fs.unlink(filePath);
    } catch { /* file may not exist */ }
  }

  return NextResponse.json({ success: true });
});
