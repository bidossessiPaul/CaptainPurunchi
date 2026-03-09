import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readTestimonials } from "@/lib/testimonial-store";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const items = await readTestimonials();
  return NextResponse.json(items);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const count = await prisma.testimonial.count();
  await prisma.testimonial.create({
    data: {
      text: body.text,
      name: body.name,
      role: body.role,
      image: body.image || null,
      avatar: body.avatar || null,
      stars: body.stars ?? 5,
      order: count,
      active: true,
    },
  });
  const items = await readTestimonials();
  return NextResponse.json(items);
});
