import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readTestimonials } from "@/lib/testimonial-store";
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
  await prisma.testimonial.update({ where: { id }, data });
  const items = await readTestimonials();
  return NextResponse.json(items);
});

export const DELETE = apiHandler(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  // Re-index order
  const remaining = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.testimonial.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }
  const items = await readTestimonials();
  return NextResponse.json(items);
});
