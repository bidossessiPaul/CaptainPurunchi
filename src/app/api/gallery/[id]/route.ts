import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.alt !== undefined) data.alt = body.alt;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.galleryImage.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await prisma.galleryImage.delete({ where: { id } });

  // Re-index remaining images
  const remaining = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.galleryImage.update({ where: { id: remaining[i].id }, data: { order: i } });
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
