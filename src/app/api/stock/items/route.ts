import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readStockItems, createStockItem } from "@/lib/stock-item-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const active = searchParams.get("active");
  const search = searchParams.get("search") || undefined;

  const items = await readStockItems({
    category,
    active: active !== null ? active === "true" : undefined,
    search,
  });
  return NextResponse.json(items);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { name, category, unit } = body;

  if (!name || !category || !unit) {
    return NextResponse.json(
      { error: "name, category et unit sont requis" },
      { status: 400 }
    );
  }

  const item = await createStockItem({
    name,
    description: body.description || "",
    category,
    unit,
    currentStock: body.currentStock ? Number(body.currentStock) : 0,
    minStock: body.minStock ? Number(body.minStock) : 0,
    unitPrice: body.unitPrice ? Number(body.unitPrice) : 0,
    supplier: body.supplier || "",
  });

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "stock_item",
      targetId: item.id,
      details: `Produit créé : ${item.name}`,
    }).catch(() => {});
  }

  return NextResponse.json(item, { status: 201 });
});
