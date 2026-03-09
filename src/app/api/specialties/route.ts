import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const items = await prisma.specialty.findMany({ orderBy: { order: "asc" } });
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

  const count = await prisma.specialty.count();

  const item = await prisma.specialty.create({
    data: {
      title,
      description,
      src,
      order: count,
      active: true,
    },
  });

  return NextResponse.json(item, { status: 201 });
});
