import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readTestimonials } from "@/lib/testimonial-store";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (request: Request) => {
  const { orderedIds } = await request.json();
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.testimonial.update({
      where: { id: orderedIds[i] },
      data: { order: i },
    });
  }
  const items = await readTestimonials();
  return NextResponse.json(items);
});
