import { NextResponse } from "next/server";
import { checkRoomAvailability } from "@/lib/room-reservation-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const excludeId = searchParams.get("excludeId");

  if (!roomId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "roomId, checkIn, and checkOut are required" },
      { status: 400 }
    );
  }

  const available = await checkRoomAvailability(
    roomId,
    checkIn,
    checkOut,
    excludeId || undefined
  );

  return NextResponse.json({ available });
}
