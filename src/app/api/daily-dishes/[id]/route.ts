import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { apiHandler } from "@/lib/api-handler";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { readDishById, updateDailyDish, deleteDailyDish, readDishesForDate } from "@/lib/daily-dish-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readDishById(id);
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

  const updated = await updateDailyDish(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readDishById(id);
  if (!existing) {
    return NextResponse.json({ error: "Dish not found" }, { status: 404 });
  }

  await deleteDailyDish(id);

  const remaining = await readDishesForDate(existing.availableDate);
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateDailyDish(remaining[i].id, { order: i });
    }
  }

  if (existing.photo) {
    await deleteFromCloudinary(existing.photo);
    try {
      const filePath = path.join(process.cwd(), "public", existing.photo);
      await fs.unlink(filePath);
    } catch { /* file may not exist locally */ }
  }

  return NextResponse.json({ success: true });
});
