import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readStockMovements, createStockMovement } from "@/lib/stock-movement-store";
import { readStockItemById } from "@/lib/stock-item-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const stockItemId = searchParams.get("stockItemId") || undefined;
  const type = searchParams.get("type") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;

  const movements = await readStockMovements({ stockItemId, type, dateFrom, dateTo });
  return NextResponse.json(movements);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { stockItemId, type, quantity, date } = body;

  if (!stockItemId || !type || quantity === undefined || !date) {
    return NextResponse.json(
      { error: "stockItemId, type, quantity et date sont requis" },
      { status: 400 }
    );
  }

  const item = await readStockItemById(stockItemId);
  if (!item) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const me = await getSessionUser();

  const movement = await createStockMovement({
    stockItemId,
    stockItemName: item.name,
    type,
    quantity: Number(quantity),
    unitPrice: body.unitPrice !== undefined ? Number(body.unitPrice) : item.unitPrice,
    reason: body.reason || "",
    date,
    createdBy: me?.name || "",
  });

  if (me) {
    const typeLabel = { entry: "Entrée", exit: "Sortie", waste: "Perte", adjustment: "Ajustement" }[type as string] || type;
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "stock_movement",
      targetId: movement.id,
      details: `${typeLabel} : ${Math.abs(Number(quantity))} ${item.unit} de ${item.name}`,
    }).catch(() => {});
  }

  return NextResponse.json(movement, { status: 201 });
});
