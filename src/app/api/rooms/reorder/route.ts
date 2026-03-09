import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (request: Request) => {
  const { orderedIds } = (await request.json()) as { orderedIds: string[] };

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.room.update({ where: { id }, data: { order: i } })
    )
  );

  const rooms = await prisma.room.findMany({ orderBy: { order: "asc" } });
  const parsed = rooms.map((r) => ({
    ...r,
    features: JSON.parse(r.features),
    gallery: JSON.parse(r.gallery),
  }));
  return NextResponse.json(parsed);
});
