import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (request: Request) => {
  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.blogPost.update({
      where: { id: orderedIds[i] },
      data: { order: i },
    });
  }

  return NextResponse.json({ success: true });
});
