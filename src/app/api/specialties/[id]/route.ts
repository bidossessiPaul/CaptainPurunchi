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

  const existing = await prisma.specialty.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Specialty not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.src !== undefined) data.src = body.src;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.specialty.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.specialty.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Specialty not found" }, { status: 404 });
  }

  await prisma.specialty.delete({ where: { id } });

  // Re-index remaining items
  const remaining = await prisma.specialty.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.specialty.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  // Try to delete the image file
  try {
    const filePath = path.join(process.cwd(), "public", existing.src);
    await fs.unlink(filePath);
  } catch {
    // File may not exist or is a seed image
  }

  return NextResponse.json({ success: true });
});
