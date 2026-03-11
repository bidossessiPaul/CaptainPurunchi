import { NextResponse } from "next/server";
import { readTestimonials, updateTestimonial } from "@/lib/testimonial-store";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (request: Request) => {
  const { orderedIds } = await request.json();
  for (let i = 0; i < orderedIds.length; i++) {
    await updateTestimonial(orderedIds[i], { order: i });
  }
  const items = await readTestimonials();
  return NextResponse.json(items);
});
