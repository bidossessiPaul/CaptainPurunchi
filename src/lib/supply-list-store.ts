import { query } from "@/lib/db";
import { createStockMovement } from "@/lib/stock-movement-store";

export interface SupplyList {
  id: string;
  status: string;
  note: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: SupplyListItem[];
}

export interface SupplyListItem {
  id: string;
  supplyListId: string;
  stockItemId: string;
  stockItemName: string;
  quantityNeeded: number;
  quantityBought: number;
  unitPrice: number;
  purchased: boolean;
  purchasedAt: string | null;
  purchasedBy: string;
}

function toSupplyList(r: any): SupplyList {
  return {
    id: r.id,
    status: r.status,
    note: r.note,
    createdBy: r.createdBy,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
}

function toSupplyListItem(r: any): SupplyListItem {
  return {
    id: r.id,
    supplyListId: r.supplyListId,
    stockItemId: r.stockItemId,
    stockItemName: r.stockItemName,
    quantityNeeded: r.quantityNeeded,
    quantityBought: r.quantityBought,
    unitPrice: r.unitPrice,
    purchased: r.purchased === 1 || r.purchased === true,
    purchasedAt: r.purchasedAt ? (r.purchasedAt instanceof Date ? r.purchasedAt.toISOString() : r.purchasedAt) : null,
    purchasedBy: r.purchasedBy,
  };
}

export async function readSupplyLists(filters?: { status?: string }): Promise<SupplyList[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(`SELECT * FROM supply_lists ${where} ORDER BY createdAt DESC`, params);
  return rows.map(toSupplyList);
}

export async function readSupplyListById(id: string): Promise<SupplyList | null> {
  const rows = await query("SELECT * FROM supply_lists WHERE id = ?", [id]);
  if (!rows[0]) return null;
  const list = toSupplyList(rows[0]);
  const itemRows = await query("SELECT * FROM supply_list_items WHERE supplyListId = ? ORDER BY stockItemName ASC", [id]);
  list.items = itemRows.map(toSupplyListItem);
  return list;
}

export async function createSupplyList(data: {
  note?: string;
  createdBy?: string;
  items?: { stockItemId: string; stockItemName: string; quantityNeeded: number }[];
}): Promise<SupplyList> {
  const id = crypto.randomUUID();
  await query("INSERT INTO supply_lists SET ?", [{
    id,
    status: "draft",
    note: data.note || "",
    createdBy: data.createdBy || "",
    updatedAt: new Date(),
  }]);

  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      await query("INSERT INTO supply_list_items SET ?", [{
        id: crypto.randomUUID(),
        supplyListId: id,
        stockItemId: item.stockItemId,
        stockItemName: item.stockItemName,
        quantityNeeded: item.quantityNeeded,
      }]);
    }
  }

  return (await readSupplyListById(id))!;
}

export async function updateSupplyList(id: string, data: { status?: string; note?: string }): Promise<SupplyList | null> {
  const updateFields: any = {};
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.note !== undefined) updateFields.note = data.note;

  if (Object.keys(updateFields).length > 0) {
    updateFields.updatedAt = new Date();
    await query("UPDATE supply_lists SET ? WHERE id = ?", [updateFields, id]);
  }
  return readSupplyListById(id);
}

export async function deleteSupplyList(id: string): Promise<void> {
  await query("DELETE FROM supply_list_items WHERE supplyListId = ?", [id]);
  await query("DELETE FROM supply_lists WHERE id = ?", [id]);
}

export async function addSupplyListItem(listId: string, data: {
  stockItemId: string;
  stockItemName: string;
  quantityNeeded: number;
}): Promise<SupplyListItem> {
  const id = crypto.randomUUID();
  await query("INSERT INTO supply_list_items SET ?", [{
    id,
    supplyListId: listId,
    stockItemId: data.stockItemId,
    stockItemName: data.stockItemName,
    quantityNeeded: data.quantityNeeded,
  }]);
  const rows = await query("SELECT * FROM supply_list_items WHERE id = ?", [id]);
  return toSupplyListItem(rows[0]);
}

export async function removeSupplyListItem(itemId: string): Promise<void> {
  await query("DELETE FROM supply_list_items WHERE id = ?", [itemId]);
}

export async function markItemPurchased(itemId: string, data: {
  quantityBought: number;
  unitPrice: number;
  purchasedBy?: string;
}): Promise<SupplyListItem> {
  const now = new Date().toISOString();
  await query("UPDATE supply_list_items SET purchased = 1, quantityBought = ?, unitPrice = ?, purchasedAt = ?, purchasedBy = ? WHERE id = ?", [
    data.quantityBought,
    data.unitPrice,
    now,
    data.purchasedBy || "",
    itemId,
  ]);

  const rows = await query("SELECT * FROM supply_list_items WHERE id = ?", [itemId]);
  const item = toSupplyListItem(rows[0]);

  // Create stock entry movement automatically
  const today = new Date().toISOString().slice(0, 10);
  await createStockMovement({
    stockItemId: item.stockItemId,
    stockItemName: item.stockItemName,
    type: "entry",
    quantity: data.quantityBought,
    unitPrice: data.unitPrice,
    reason: "Ravitaillement",
    date: today,
    createdBy: data.purchasedBy || "",
  });

  // Check if all items in the list are purchased → auto-complete the list
  const allItems = await query("SELECT purchased FROM supply_list_items WHERE supplyListId = ?", [item.supplyListId]);
  const allPurchased = allItems.every((i: any) => i.purchased === 1 || i.purchased === true);
  if (allPurchased) {
    await query("UPDATE supply_lists SET status = 'completed' WHERE id = ?", [item.supplyListId]);
  }

  return item;
}
