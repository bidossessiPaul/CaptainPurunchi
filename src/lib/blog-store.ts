import { prisma } from "@/lib/prisma";
import type { BlogPost, BlogComment } from "@/app/types/blog";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toBlogPost(r: {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  thumb: string;
  order: number;
  active: boolean;
  createdAt: Date;
}): BlogPost {
  return {
    ...r,
    slug: r.slug || slugify(r.title) + "-" + r.id.slice(0, 6),
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readBlogPosts(): Promise<BlogPost[]> {
  const items = await prisma.blogPost.findMany({ orderBy: { order: "asc" } });
  return items.map(toBlogPost);
}

export async function readActiveBlogPosts(): Promise<BlogPost[]> {
  const items = await prisma.blogPost.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return items.map(toBlogPost);
}

export async function readBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Try exact slug match first
  let post = await prisma.blogPost.findFirst({
    where: { slug, active: true },
  });
  // Fallback: find by generated slug from title
  if (!post) {
    const all = await prisma.blogPost.findMany({ where: { active: true } });
    post = all.find((p) => {
      const gen = slugify(p.title) + "-" + p.id.slice(0, 6);
      return gen === slug;
    }) || null;
  }
  return post ? toBlogPost(post) : null;
}

export function generateSlug(title: string, id: string): string {
  return slugify(title) + "-" + id.slice(0, 6);
}

export async function readApprovedComments(postId: string): Promise<BlogComment[]> {
  const items = await prisma.blogComment.findMany({
    where: { postId, approved: true },
    orderBy: { createdAt: "desc" },
  });
  return items.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }));
}

export async function readAllComments(): Promise<(BlogComment & { postTitle: string })[]> {
  const items = await prisma.blogComment.findMany({
    orderBy: { createdAt: "desc" },
    include: { post: { select: { title: true } } },
  });
  return items.map((c) => ({
    ...c,
    postTitle: c.post.title,
    createdAt: c.createdAt.toISOString(),
  }));
}
