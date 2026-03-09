import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { apiHandler } from "@/lib/api-handler";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "daily-dishes");

export const POST = apiHandler(async (request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Type non autorisé. Utilisez JPEG, PNG, WebP ou AVIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux. Max 5 MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const src = `/images/daily-dishes/${filename}`;
  return NextResponse.json({ src }, { status: 201 });
});
