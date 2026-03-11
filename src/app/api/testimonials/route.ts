import { NextResponse } from "next/server";
import { readTestimonials, countTestimonials, createTestimonial } from "@/lib/testimonial-store";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const items = await readTestimonials();
  return NextResponse.json(items);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const count = await countTestimonials();
  await createTestimonial({
    text: body.text,
    name: body.name,
    role: body.role,
    image: body.image || null,
    avatar: body.avatar || null,
    stars: body.stars ?? 5,
    order: count,
    active: true,
  });
  const items = await readTestimonials();
  return NextResponse.json(items);
});
