import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readRevenues, createRevenue } from "@/lib/revenue-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const source = searchParams.get("source") || undefined;

  const revenues = await readRevenues({ dateFrom, dateTo, source });
  return NextResponse.json(revenues);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { amount, source, description, date } = body;

  if (!amount || !source || !description || !date) {
    return NextResponse.json(
      { error: "amount, source, description et date sont requis" },
      { status: 400 }
    );
  }

  const me = await getSessionUser();
  const revenue = await createRevenue({
    amount: Number(amount),
    source,
    sourceId: body.sourceId || "",
    description,
    paymentMethod: body.paymentMethod || "",
    date,
    createdBy: me?.name || "",
  });

  if (me) {
    logActivity({
      userId: me.id,
      userName: me.name,
      action: "create",
      target: "revenue",
      targetId: revenue.id,
      details: `Revenu ${amount} FCFA (${source})`,
    }).catch(() => {});
  }

  return NextResponse.json(revenue, { status: 201 });
});
