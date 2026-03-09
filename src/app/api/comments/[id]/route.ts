import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

// PUT - approve/reject comment (admin)
export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.blogComment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.approved !== undefined) data.approved = Boolean(body.approved);

  const updated = await prisma.blogComment.update({ where: { id }, data });
  return NextResponse.json(updated);
});

// DELETE comment (admin)
export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.blogComment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  await prisma.blogComment.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
