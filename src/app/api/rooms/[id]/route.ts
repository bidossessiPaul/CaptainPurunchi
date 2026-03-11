import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readRoomById, updateRoom, deleteRoom, readRooms } from "@/lib/room-store";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readRoomById(id);
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.shortDesc !== undefined) data.shortDesc = body.shortDesc;
  if (body.price !== undefined) data.price = body.price;
  if (body.thumb !== undefined) data.thumb = body.thumb;
  if (body.capacity !== undefined) data.capacity = body.capacity;
  if (body.features !== undefined) data.features = body.features;
  if (body.description !== undefined) data.description = body.description;
  if (body.gallery !== undefined) data.gallery = body.gallery;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await updateRoom(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readRoomById(id);
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await deleteRoom(id);

  // Re-index remaining rooms
  const remaining = await readRooms();
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateRoom(remaining[i].id, { order: i });
    }
  }

  return NextResponse.json({ success: true });
});
