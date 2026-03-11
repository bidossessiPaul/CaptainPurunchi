import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readBlogPosts, countBlogPosts, createBlogPost, findPostBySlugExact } from "@/lib/blog-store";

export const GET = apiHandler(async () => {
  const posts = await readBlogPosts();
  return NextResponse.json(posts);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { title, date, author, thumb, slug, excerpt, content } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Deduplicate slug
  let finalSlug: string | null = slug || null;
  if (finalSlug) {
    let candidate = finalSlug;
    let suffix = 1;
    while (await findPostBySlugExact(candidate)) {
      candidate = `${finalSlug}-${suffix}`;
      suffix++;
    }
    finalSlug = candidate;
  }

  const count = await countBlogPosts();

  const post = await createBlogPost({
    title,
    slug: finalSlug,
    excerpt: excerpt || "",
    content: content || "",
    date: date || "",
    author: author || "",
    thumb: thumb || "",
    order: count,
    active: true,
  });

  return NextResponse.json(post, { status: 201 });
});
