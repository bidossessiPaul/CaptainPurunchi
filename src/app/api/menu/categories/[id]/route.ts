import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.menuCategory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.menuCategory.update({
    where: { id },
    data,
    include: { items: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.menuCategory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // Cascade delete handled by onDelete: Cascade
  await prisma.menuCategory.delete({ where: { id } });

  // Re-index remaining categories
  const remaining = await prisma.menuCategory.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.menuCategory.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  return NextResponse.json({ success: true });
});
