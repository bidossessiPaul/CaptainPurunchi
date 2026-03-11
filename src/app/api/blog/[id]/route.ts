import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readBlogPostById, updateBlogPost, deleteBlogPost, readBlogPosts } from "@/lib/blog-store";

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await readBlogPostById(id);
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

  const updated = await updateBlogPost(id, data);
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await readBlogPostById(id);
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await deleteBlogPost(id);

  const remaining = await readBlogPosts();
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await updateBlogPost(remaining[i].id, { order: i });
    }
  }

  return NextResponse.json({ success: true });
});
