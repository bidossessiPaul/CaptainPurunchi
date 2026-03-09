import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.menuItem.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await prisma.menuItem.delete({ where: { id } });

  // Re-index remaining items in this category
  const remaining = await prisma.menuItem.findMany({
    where: { categoryId: existing.categoryId },
    orderBy: { order: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.menuItem.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  return NextResponse.json({ success: true });
});
