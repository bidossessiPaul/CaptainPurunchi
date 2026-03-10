import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { deleteStockMovement } from "@/lib/stock-movement-store";

export const DELETE = apiHandler(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  await deleteStockMovement(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "stock_movement",
      targetId: id,
      details: "Mouvement de stock supprimé",
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
