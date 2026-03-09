import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug || null;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.content !== undefined) data.content = body.content;
  if (body.date !== undefined) data.date = body.date;
  if (body.author !== undefined) data.author = body.author;
  if (body.thumb !== undefined) data.thumb = body.thumb;
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.blogPost.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });

  const remaining = await prisma.blogPost.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.blogPost.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  return NextResponse.json({ success: true });
});
