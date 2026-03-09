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
      prisma.menuItem.update({ where: { id }, data: { order: i } })
    )
  );

  return NextResponse.json({ success: true });
});
