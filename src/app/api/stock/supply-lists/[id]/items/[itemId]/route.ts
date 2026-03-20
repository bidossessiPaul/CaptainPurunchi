import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { markItemPurchased, removeSupplyListItem } from "@/lib/supply-list-store";

export const PATCH = apiHandler(async (request, context) => {
  const { itemId } = await context.params;
  const body = await request.json();
  const me = await getSessionUser();

  if (!body.quantityBought || body.quantityBought <= 0) {
    return NextResponse.json({ error: "quantityBought est requis et doit être > 0" }, { status: 400 });
  }

  const item = await markItemPurchased(itemId, {
    quantityBought: Number(body.quantityBought),
    unitPrice: Number(body.unitPrice) || 0,
    purchasedBy: me?.name || "",
  });

  return NextResponse.json(item);
});

export const DELETE = apiHandler(async (_request, context) => {
  const { itemId } = await context.params;
  await removeSupplyListItem(itemId);
  return NextResponse.json({ success: true });
});
