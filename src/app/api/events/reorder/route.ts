import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateEvent } from "@/lib/event-store";

export const PUT = apiHandler(async (request: Request) => {
  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await updateEvent(orderedIds[i], { order: i });
  }

  return NextResponse.json({ success: true });
});
