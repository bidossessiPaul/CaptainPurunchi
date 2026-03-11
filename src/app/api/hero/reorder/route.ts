import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateSlide, readSlides } from "@/lib/hero-store";

export const PUT = apiHandler(async (request) => {
  const { orderedIds } = (await request.json()) as { orderedIds: string[] };

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
  }

  // Update each slide's order sequentially
  for (let i = 0; i < orderedIds.length; i++) {
    await updateSlide(orderedIds[i], { order: i });
  }

  const slides = await readSlides();
  return NextResponse.json(slides);
});
