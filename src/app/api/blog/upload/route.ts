import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { apiHandler } from "@/lib/api-handler";

export const POST = apiHandler(async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const dir = path.join(process.cwd(), "public", "images", "blog");
  await mkdir(dir, { recursive: true });

  const filepath = path.join(dir, filename);
  await writeFile(filepath, buffer);

  return NextResponse.json({ src: `/images/blog/${filename}` });
});
