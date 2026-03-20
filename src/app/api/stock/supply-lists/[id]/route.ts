import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readSupplyListById, updateSupplyList, deleteSupplyList } from "@/lib/supply-list-store";

export const GET = apiHandler(async (_request, context) => {
  const { id } = await context.params;
  const list = await readSupplyListById(id);
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(list);
});

export const PATCH = apiHandler(async (request, context) => {
  const { id } = await context.params;
  const body = await request.json();

  const list = await updateSupplyList(id, {
    status: body.status,
    note: body.note,
  });

  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const me = await getSessionUser();
  if (me && body.status) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "update",
      target: "supply_list",
      targetId: id,
      details: `Liste de ravitaillement → ${body.status}`,
    }).catch(() => {});
  }

  return NextResponse.json(list);
});

export const DELETE = apiHandler(async (_request, context) => {
  const { id } = await context.params;
  await deleteSupplyList(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "supply_list",
      targetId: id,
      details: "Liste de ravitaillement supprimée",
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
