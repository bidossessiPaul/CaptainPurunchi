import { query, cachedQuery } from "@/lib/db";
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
  active: number;
  createdAt: Date;
}): BlogPost {
  return {
    ...r,
    active: r.active === 1,
    slug: r.slug || slugify(r.title) + "-" + r.id.slice(0, 6),
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readBlogPosts(): Promise<BlogPost[]> {
  const items = await query('SELECT * FROM blog_posts ORDER BY `order` ASC');
  return items.map(toBlogPost);
}

export async function readActiveBlogPosts(): Promise<BlogPost[]> {
  const items = await cachedQuery('SELECT * FROM blog_posts WHERE active = 1 ORDER BY `order` ASC');
  return items.map(toBlogPost);
}

export async function readBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Try exact slug match first
  const posts = await query('SELECT * FROM blog_posts WHERE slug = ? AND active = 1', [slug]);
  let post = posts[0] || null;

  // Fallback: find by generated slug from title
  if (!post) {
    const all = await query('SELECT * FROM blog_posts WHERE active = 1');
    post = all.find((p: { id: string; title: string }) => {
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
  const items = await query(
    'SELECT * FROM blog_comments WHERE postId = ? AND approved = 1 ORDER BY createdAt DESC',
    [postId]
  );
  return items.map((c: { id: string; postId: string; name: string; email: string; comment: string; approved: number; createdAt: Date }) => ({
    ...c,
    approved: c.approved === 1,
    createdAt: c.createdAt.toISOString()
  }));
}

export async function readAllComments(): Promise<(BlogComment & { postTitle: string })[]> {
  const items = await query(`
    SELECT bc.*, bp.title as postTitle
    FROM blog_comments bc
    JOIN blog_posts bp ON bc.postId = bp.id
    ORDER BY bc.createdAt DESC
  `);
  return items.map((c: { id: string; postId: string; name: string; email: string; comment: string; approved: number; createdAt: Date; postTitle: string }) => ({
    ...c,
    approved: c.approved === 1,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function readBlogPostById(id: string): Promise<BlogPost | null> {
  const posts = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);
  if (posts.length === 0) return null;
  return toBlogPost(posts[0]);
}

export async function countBlogPosts(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM blog_posts');
  return result[0].count;
}

export async function createBlogPost(data: {
  title: string;
  slug: string | null;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  thumb: string;
  order: number;
  active: boolean;
}): Promise<BlogPost> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO blog_posts (id, title, slug, excerpt, content, date, author, thumb, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.title, data.slug, data.excerpt, data.content, data.date, data.author, data.thumb, data.order, data.active ? 1 : 0]
  );
  const created = await readBlogPostById(id);
  if (!created) throw new Error('Failed to create blog post');
  return created;
}

export async function updateBlogPost(id: string, data: Partial<{
  title: string;
  slug: string | null;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  thumb: string;
  order: number;
  active: boolean;
}>): Promise<BlogPost | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.slug !== undefined) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.excerpt !== undefined) {
    fields.push('excerpt = ?');
    values.push(data.excerpt);
  }
  if (data.content !== undefined) {
    fields.push('content = ?');
    values.push(data.content);
  }
  if (data.date !== undefined) {
    fields.push('date = ?');
    values.push(data.date);
  }
  if (data.author !== undefined) {
    fields.push('author = ?');
    values.push(data.author);
  }
  if (data.thumb !== undefined) {
    fields.push('thumb = ?');
    values.push(data.thumb);
  }
  if (data.order !== undefined) {
    fields.push('`order` = ?');
    values.push(data.order);
  }
  if (data.active !== undefined) {
    fields.push('active = ?');
    values.push(data.active ? 1 : 0);
  }

  if (fields.length === 0) {
    return readBlogPostById(id);
  }

  values.push(id);
  await query(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`, values);
  return readBlogPostById(id);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await query('DELETE FROM blog_posts WHERE id = ?', [id]);
}

export async function readCommentById(id: string): Promise<BlogComment | null> {
  const comments = await query('SELECT * FROM blog_comments WHERE id = ?', [id]);
  if (comments.length === 0) return null;
  const c = comments[0];
  return {
    ...c,
    approved: c.approved === 1,
    createdAt: c.createdAt.toISOString()
  };
}

export async function createComment(data: {
  postId: string;
  name: string;
  email: string;
  comment: string;
  approved: boolean;
}): Promise<BlogComment> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO blog_comments (id, postId, name, email, comment, approved) VALUES (?, ?, ?, ?, ?, ?)',
    [id, data.postId, data.name, data.email, data.comment, data.approved ? 1 : 0]
  );
  const created = await readCommentById(id);
  if (!created) throw new Error('Failed to create comment');
  return created;
}

export async function updateComment(id: string, data: Partial<{
  name: string;
  email: string;
  comment: string;
  approved: boolean;
}>): Promise<BlogComment | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.comment !== undefined) {
    fields.push('comment = ?');
    values.push(data.comment);
  }
  if (data.approved !== undefined) {
    fields.push('approved = ?');
    values.push(data.approved ? 1 : 0);
  }

  if (fields.length === 0) {
    return readCommentById(id);
  }

  values.push(id);
  await query(`UPDATE blog_comments SET ${fields.join(', ')} WHERE id = ?`, values);
  return readCommentById(id);
}

export async function deleteComment(id: string): Promise<void> {
  await query('DELETE FROM blog_comments WHERE id = ?', [id]);
}

export async function findPostBySlugExact(slug: string): Promise<BlogPost | null> {
  const posts = await query('SELECT * FROM blog_posts WHERE slug = ?', [slug]);
  if (posts.length === 0) return null;
  return toBlogPost(posts[0]);
}
