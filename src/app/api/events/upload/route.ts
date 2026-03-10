import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

  const buffer = Buffer.from(await file.arrayBuffer());
  const src = await uploadToCloudinary(buffer, "events");

  return NextResponse.json({ src });
});
