import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { apiHandler } from "@/lib/api-handler";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "gallery");

export const POST = apiHandler(async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Type non autorisé. Utilisez JPEG, PNG, WebP, AVIF, MP4 ou WebM." },
      { status: 400 }
    );
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `Fichier trop volumineux. Max ${isVideo ? "150" : "5"} MB.` },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const src = `/images/gallery/${filename}`;
  const type = isVideo ? "video" : "image";
  return NextResponse.json({ src, type }, { status: 201 });
});
