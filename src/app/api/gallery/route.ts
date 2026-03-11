import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readGalleryImages, countGalleryImages, createGalleryImage } from "@/lib/gallery-store";

export const GET = apiHandler(async () => {
  const images = await readGalleryImages();
  return NextResponse.json(images);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { src, alt, type } = body;

  if (!src) {
    return NextResponse.json({ error: "src is required" }, { status: 400 });
  }

  const count = await countGalleryImages();

  const image = await createGalleryImage({
    src,
    alt: alt || "",
    type: type === "video" ? "video" : "image",
    order: count,
    active: true,
  });

  return NextResponse.json(image, { status: 201 });
});
