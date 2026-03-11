import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readSlides, countSlides, createSlide } from "@/lib/hero-store";

export const GET = apiHandler(async () => {
  const slides = await readSlides();
  return NextResponse.json(slides);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { src, title, subtitle, caption } = body;

  if (!src) {
    return NextResponse.json({ error: "src is required" }, { status: 400 });
  }

  const count = await countSlides();

  const slide = await createSlide({
    src,
    title: title || null,
    subtitle: subtitle || null,
    caption: caption || null,
    order: count,
    active: true,
  });

  return NextResponse.json(slide, { status: 201 });
});
