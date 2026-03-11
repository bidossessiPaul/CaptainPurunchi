import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { apiHandler } from "@/lib/api-handler";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { readSlideById, updateSlide, deleteSlide, readSlides } from "@/lib/hero-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readSlideById(id);
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title || null;
  if (body.subtitle !== undefined) data.subtitle = body.subtitle || null;
  if (body.caption !== undefined) data.caption = body.caption || null;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await updateSlide(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readSlideById(id);
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  await deleteSlide(id);

  // Re-index remaining slides
  const remaining = await readSlides();
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateSlide(remaining[i].id, { order: i });
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
