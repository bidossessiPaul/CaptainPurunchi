import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.read !== undefined) data.read = Boolean(body.read);

  const updated = await prisma.contactMessage.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
