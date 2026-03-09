import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const rooms = await prisma.room.findMany({ orderBy: { order: "asc" } });
  // Parse JSON fields for the client
  const parsed = rooms.map((r) => ({
    ...r,
    features: JSON.parse(r.features),
    gallery: JSON.parse(r.gallery),
  }));
  return NextResponse.json(parsed);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { name, shortDesc, price, thumb, capacity, features, description, gallery } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  const count = await prisma.room.count();

  const room = await prisma.room.create({
    data: {
      name,
      shortDesc: shortDesc || "",
      price,
      thumb: thumb || "",
      capacity: capacity || "",
      features: JSON.stringify(features || []),
      description: description || "",
      gallery: JSON.stringify(gallery || []),
      order: count,
      active: true,
    },
  });

  return NextResponse.json({
    ...room,
    features: JSON.parse(room.features),
    gallery: JSON.parse(room.gallery),
  }, { status: 201 });
});
