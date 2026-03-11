import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readItemById, updateItem, deleteItem, readItems } from "@/lib/menu-store";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readItemById(id);
  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await updateItem(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readItemById(id);
  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await deleteItem(id);

  // Re-index remaining items in this category
  const remaining = await readItems(existing.categoryId);
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateItem(remaining[i].id, { order: i });
    }
  }

  return NextResponse.json({ success: true });
});
