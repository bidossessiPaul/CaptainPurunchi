import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { addSupplyListItem } from "@/lib/supply-list-store";

export const POST = apiHandler(async (request, context) => {
  const { id } = await context.params;
  const body = await request.json();

  if (!body.stockItemId || !body.stockItemName) {
    return NextResponse.json({ error: "stockItemId et stockItemName requis" }, { status: 400 });
  }

  const item = await addSupplyListItem(id, {
    stockItemId: body.stockItemId,
    stockItemName: body.stockItemName,
    quantityNeeded: body.quantityNeeded || 1,
  });

  return NextResponse.json(item, { status: 201 });
});
