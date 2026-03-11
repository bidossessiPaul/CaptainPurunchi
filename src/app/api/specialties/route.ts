import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readSpecialties, countSpecialties, createSpecialty } from "@/lib/specialty-store";

export const GET = apiHandler(async () => {
  const items = await readSpecialties();
  return NextResponse.json(items);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { title, description, src } = body;

  if (!title || !description || !src) {
    return NextResponse.json(
      { error: "title, description and src are required" },
      { status: 400 }
    );
  }

  const count = await countSpecialties();

  const item = await createSpecialty({
    title,
    description,
    src,
    order: count,
    active: true,
  });

  return NextResponse.json(item, { status: 201 });
});
