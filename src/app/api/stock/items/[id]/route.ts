import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readStockItemById, updateStockItem, deleteStockItem } from "@/lib/stock-item-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readStockItemById(id);
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.category = body.category;
  if (body.unit !== undefined) data.unit = body.unit;
  if (body.currentStock !== undefined) data.currentStock = Number(body.currentStock);
  if (body.minStock !== undefined) data.minStock = Number(body.minStock);
  if (body.unitPrice !== undefined) data.unitPrice = Number(body.unitPrice);
  if (body.supplier !== undefined) data.supplier = body.supplier;
  if (body.active !== undefined) data.active = body.active;

  const updated = await updateStockItem(id, data);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "update",
      target: "stock_item",
      targetId: id,
      details: `Produit modifié : ${updated.name}`,
    }).catch(() => {});
  }

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readStockItemById(id);
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  await deleteStockItem(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "stock_item",
      targetId: id,
      details: `Produit supprimé : ${existing.name}`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
