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

  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title || null;
  if (body.subtitle !== undefined) data.subtitle = body.subtitle || null;
  if (body.caption !== undefined) data.caption = body.caption || null;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.heroSlide.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  await prisma.heroSlide.delete({ where: { id } });

  // Re-index remaining slides
  const remaining = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.heroSlide.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  // Try to delete the image file
  try {
    const filePath = path.join(process.cwd(), "public", existing.src);
    await fs.unlink(filePath);
  } catch {
    // File may not exist
  }

  return NextResponse.json({ success: true });
});
