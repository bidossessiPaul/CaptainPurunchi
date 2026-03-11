import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readItems, countItemsInCategory, createItem } from "@/lib/menu-store";

export const GET = apiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const items = await readItems(categoryId || undefined);
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

  const count = await countItemsInCategory(categoryId);

  const item = await createItem({
    categoryId,
    name,
    description: description || "",
    price,
    order: count,
    active: true,
  });

  return NextResponse.json(item, { status: 201 });
});
