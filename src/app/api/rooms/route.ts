import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readRooms, countRooms, createRoom } from "@/lib/room-store";

export const GET = apiHandler(async () => {
  const rooms = await readRooms();
  return NextResponse.json(rooms);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { name, shortDesc, price, thumb, capacity, features, description, gallery } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  const count = await countRooms();

  const room = await createRoom({
    name,
    shortDesc: shortDesc || "",
    price,
    thumb: thumb || "",
    capacity: capacity || "",
    features: features || [],
    description: description || "",
    gallery: gallery || [],
    order: count,
    active: true,
  });

  return NextResponse.json(room, { status: 201 });
});
