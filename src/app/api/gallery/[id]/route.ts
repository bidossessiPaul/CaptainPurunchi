import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { apiHandler } from "@/lib/api-handler";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { readGalleryImageById, updateGalleryImage, deleteGalleryImage, readGalleryImages } from "@/lib/gallery-store";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readGalleryImageById(id);
  if (!existing) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.alt !== undefined) data.alt = body.alt;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await updateGalleryImage(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readGalleryImageById(id);
  if (!existing) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await deleteGalleryImage(id);

  // Re-index remaining images
  const remaining = await readGalleryImages();
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateGalleryImage(remaining[i].id, { order: i });
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
