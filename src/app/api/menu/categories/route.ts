import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const cats = await prisma.menuCategory.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(cats);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { name, icon } = body;

  if (!name || !icon) {
    return NextResponse.json(
      { error: "name and icon are required" },
      { status: 400 }
    );
  }

  const count = await prisma.menuCategory.count();

  const cat = await prisma.menuCategory.create({
    data: { name, icon, order: count, active: true },
    include: { items: true },
  });

  return NextResponse.json(cat, { status: 201 });
});
