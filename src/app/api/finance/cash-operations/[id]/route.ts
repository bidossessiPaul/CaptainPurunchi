import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { deleteCashOperation } from "@/lib/cash-operation-store";
import { logActivity } from "@/lib/activity-log-store";

export const DELETE = apiHandler(async (_request, context) => {
  const { id } = await context.params;

  await deleteCashOperation(id);

  const me = await getSessionUser();
  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "cash_operation",
      targetId: id,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
});
