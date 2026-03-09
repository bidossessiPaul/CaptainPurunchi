import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

// GET all comments (admin)
export const GET = apiHandler(async () => {
  const comments = await prisma.blogComment.findMany({
    orderBy: { createdAt: "desc" },
    include: { post: { select: { title: true } } },
  });
  return NextResponse.json(comments);
});

// POST new comment (public - no auth needed)
export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { postId, name, email, text } = body;

  if (!postId || !name?.trim() || !text?.trim()) {
    return NextResponse.json(
      { error: "postId, name, and text are required" },
      { status: 400 }
    );
  }

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.blogComment.create({
    data: {
      postId,
      name: name.trim(),
      email: email?.trim() || "",
      text: text.trim(),
      approved: false,
    },
  });

  return NextResponse.json(comment, { status: 201 });
});
