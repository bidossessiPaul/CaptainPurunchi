import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readCashRegisters, readTodayCashRegister, openCashRegister } from "@/lib/cash-register-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const today = searchParams.get("today");
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const status = searchParams.get("status") || undefined;

  if (today) {
    const reg = await readTodayCashRegister(today);
    return NextResponse.json(reg);
  }

  const registers = await readCashRegisters({ dateFrom, dateTo, status });
  return NextResponse.json(registers);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { date, openingBalance } = body;

  if (!date) {
    return NextResponse.json(
      { error: "date est requis" },
      { status: 400 }
    );
  }

  const existing = await readTodayCashRegister(date);
  if (existing && existing.status === "open") {
    return NextResponse.json(
      { error: "Une caisse est déjà ouverte pour cette date" },
      { status: 400 }
    );
  }

  const me = await getSessionUser();
  const register = await openCashRegister({
    date,
    openedBy: me?.name || "",
    openingBalance: Number(openingBalance) || 0,
    notes: body.notes || "",
  });

  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "cash_register",
      targetId: register.id,
      details: `Caisse ouverte (fond: ${openingBalance || 0} FCFA)`,
    }).catch(() => {});
  }

  return NextResponse.json(register, { status: 201 });
});
