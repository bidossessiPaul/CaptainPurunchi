import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { readOperationsByCashRegister, createCashOperation } from "@/lib/cash-operation-store";
import { readCashRegisterById } from "@/lib/cash-register-store";
import { logActivity } from "@/lib/activity-log-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const cashRegisterId = searchParams.get("cashRegisterId");

  if (!cashRegisterId) {
    return NextResponse.json({ error: "cashRegisterId requis" }, { status: 400 });
  }

  const ops = await readOperationsByCashRegister(cashRegisterId);
  return NextResponse.json(ops);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { cashRegisterId, type, amount, paymentMethod, description } = body;

  if (!cashRegisterId || !type || !amount) {
    return NextResponse.json(
      { error: "cashRegisterId, type et amount sont requis" },
      { status: 400 }
    );
  }

  // Verify register exists and is open
  const register = await readCashRegisterById(cashRegisterId);
  if (!register) {
    return NextResponse.json({ error: "Caisse introuvable" }, { status: 404 });
  }
  if (register.status !== "open") {
    return NextResponse.json({ error: "La caisse est fermée" }, { status: 400 });
  }

  const me = await getSessionUser();

  const op = await createCashOperation({
    cashRegisterId,
    type,
    amount: Math.abs(Number(amount)),
    paymentMethod: paymentMethod || "especes",
    description: description || "",
    createdBy: me?.name || "",
  });

  if (me) {
    const typeLabel = type === "encaissement" ? "Encaissement" : "Retrait";
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "cash_operation",
      targetId: op.id,
      details: `${typeLabel} de ${Math.abs(Number(amount))} FCFA (${paymentMethod || "especes"})`,
    }).catch(() => {});
  }

  return NextResponse.json(op, { status: 201 });
});
