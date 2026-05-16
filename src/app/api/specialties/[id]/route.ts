import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { apiHandler } from "@/lib/api-handler";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { readSpecialtyById, updateSpecialty, deleteSpecialty, readSpecialties } from "@/lib/specialty-store";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readSpecialtyById(id);
  if (!existing) {
    return NextResponse.json({ error: "Specialty not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.details !== undefined) data.details = body.details;
  if (body.src !== undefined) data.src = body.src;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await updateSpecialty(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readSpecialtyById(id);
  if (!existing) {
    return NextResponse.json({ error: "Specialty not found" }, { status: 404 });
  }

  await deleteSpecialty(id);

  // Re-index remaining items
  const remaining = await readSpecialties();
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateSpecialty(remaining[i].id, { order: i });
    }
  }

  // Delete from Cloudinary or local filesystem
  await deleteFromCloudinary(existing.src);
  try {
    const filePath = path.join(process.cwd(), "public", existing.src);
    await fs.unlink(filePath);
  } catch {
    // File may not exist locally
  }

  return NextResponse.json({ success: true });
});
