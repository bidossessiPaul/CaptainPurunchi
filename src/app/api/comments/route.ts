import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readAllComments, createComment, readBlogPostById } from "@/lib/blog-store";

// GET all comments (admin)
export const GET = apiHandler(async () => {
  const comments = await readAllComments();
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

  const post = await readBlogPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await createComment({
    postId,
    name: name.trim(),
    email: email?.trim() || "",
    comment: text.trim(),
    approved: false,
  });

  return NextResponse.json(comment, { status: 201 });
});
