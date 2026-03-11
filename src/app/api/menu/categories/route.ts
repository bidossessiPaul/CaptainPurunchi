import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readCategories, countCategories, createCategory } from "@/lib/menu-store";

export const GET = apiHandler(async () => {
  const cats = await readCategories();
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

  const count = await countCategories();

  const cat = await createCategory({
    name,
    icon,
    order: count,
    active: true
  });

  return NextResponse.json(cat, { status: 201 });
});
