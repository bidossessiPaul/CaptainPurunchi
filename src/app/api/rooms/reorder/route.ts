import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateRoom, readRooms } from "@/lib/room-store";

export const PUT = apiHandler(async (request: Request) => {
  const { orderedIds } = (await request.json()) as { orderedIds: string[] };

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await updateRoom(orderedIds[i], { order: i });
  }

  const rooms = await readRooms();
  return NextResponse.json(rooms);
});
