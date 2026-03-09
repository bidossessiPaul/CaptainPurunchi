import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (request) => {
  const { orderedIds } = (await request.json()) as { orderedIds: string[] };

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
  }

  // Update each slide's order in a transaction
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.heroSlide.update({ where: { id }, data: { order: i } })
    )
  );

  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(slides);
});
