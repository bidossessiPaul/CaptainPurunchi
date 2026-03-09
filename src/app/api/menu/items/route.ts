import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const where = categoryId ? { categoryId } : {};
  const items = await prisma.menuItem.findMany({
    where,
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { categoryId, name, description, price } = body;

  if (!categoryId || !name || !price) {
    return NextResponse.json(
      { error: "categoryId, name and price are required" },
      { status: 400 }
    );
  }

  const count = await prisma.menuItem.count({ where: { categoryId } });

  const item = await prisma.menuItem.create({
    data: {
      categoryId,
      name,
      description: description || "",
      price,
      order: count,
      active: true,
    },
  });

  return NextResponse.json(item, { status: 201 });
});
