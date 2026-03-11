import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateDailyDish } from "@/lib/daily-dish-store";

export const PUT = apiHandler(async (request) => {
  const { orderedIds } = (await request.json()) as { orderedIds: string[] };

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await updateDailyDish(orderedIds[i], { order: i });
  }

  return NextResponse.json({ success: true });
});
