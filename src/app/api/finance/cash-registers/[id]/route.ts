import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readCashRegisterById, closeCashRegister, updateCashRegister } from "@/lib/cash-register-store";

export const PUT = apiHandler(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readCashRegisterById(id);
  if (!existing) {
    return NextResponse.json({ error: "Caisse introuvable" }, { status: 404 });
  }

  const me = await getSessionUser();

  // Close the register
  if (body.action === "close") {
    if (existing.status === "closed") {
      return NextResponse.json({ error: "Caisse déjà fermée" }, { status: 400 });
    }

    const updated = await closeCashRegister(id, {
      closedBy: me?.name || "",
      especes: Number(body.especes) || 0,
      carte: Number(body.carte) || 0,
      mtnMoney: Number(body.mtnMoney) || 0,
      moovMoney: Number(body.moovMoney) || 0,
      virement: Number(body.virement) || 0,
      closingBalance: Number(body.closingBalance) || 0,
      notes: body.notes,
    });

    if (me) {
      logActivity({
        userId: me.id,
        userName: me.name,
        action: "update",
        target: "cash_register",
        targetId: id,
        details: `Caisse fermée (solde: ${updated.closingBalance} FCFA, diff: ${updated.difference} FCFA)`,
      }).catch(() => {});
    }

    return NextResponse.json(updated);
  }

  // Simple update (notes, opening balance)
  const data: Record<string, unknown> = {};
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.openingBalance !== undefined) data.openingBalance = Number(body.openingBalance);

  const updated = await updateCashRegister(id, data);
  return NextResponse.json(updated);
});
