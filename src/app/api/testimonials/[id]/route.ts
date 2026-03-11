import { NextResponse } from "next/server";
import { readTestimonials, updateTestimonial, deleteTestimonial } from "@/lib/testimonial-store";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.text !== undefined) data.text = body.text;
  if (body.name !== undefined) data.name = body.name;
  if (body.role !== undefined) data.role = body.role;
  if (body.image !== undefined) data.image = body.image || null;
  if (body.avatar !== undefined) data.avatar = body.avatar || null;
  if (body.stars !== undefined) data.stars = body.stars;
  if (body.active !== undefined) data.active = body.active;
  await updateTestimonial(id, data);
  const items = await readTestimonials();
  return NextResponse.json(items);
});

export const DELETE = apiHandler(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await deleteTestimonial(id);
  // Re-index order
  const remaining = await readTestimonials();
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateTestimonial(remaining[i].id, { order: i });
    }
  }
  const items = await readTestimonials();
  return NextResponse.json(items);
});
