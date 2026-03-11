import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readContactMessageById, updateContactMessage, deleteContactMessage } from "@/lib/contact-store";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readContactMessageById(id);
  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.read !== undefined) data.read = Boolean(body.read);

  const updated = await updateContactMessage(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readContactMessageById(id);
  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await deleteContactMessage(id);
  return NextResponse.json({ success: true });
});
