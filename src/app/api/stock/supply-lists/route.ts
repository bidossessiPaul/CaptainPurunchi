import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readSupplyLists, createSupplyList } from "@/lib/supply-list-store";
import { readLowStockItems } from "@/lib/stock-item-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const lists = await readSupplyLists({ status });
  return NextResponse.json(lists);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const me = await getSessionUser();

  // Get low stock items to pre-fill
  const lowStockItems = await readLowStockItems();
  const autoItems = lowStockItems.map((i) => ({
    stockItemId: i.id,
    stockItemName: i.name,
    quantityNeeded: Math.max(0, i.minStock - i.currentStock),
  }));

  // Merge with any manually added items
  const manualItems = Array.isArray(body.items) ? body.items : [];
  const allItems = [...autoItems, ...manualItems];

  const list = await createSupplyList({
    note: body.note || "",
    createdBy: me?.name || "",
    items: allItems,
  });

  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "supply_list",
      targetId: list.id,
      details: `Liste de ravitaillement créée (${allItems.length} articles)`,
    }).catch(() => {});
  }

  return NextResponse.json(list, { status: 201 });
});
