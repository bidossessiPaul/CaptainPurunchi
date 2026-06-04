import { query, cachedQuery } from "@/lib/db";
import type { Specialty } from "@/app/types/specialty";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toSpecialty(s: {
  id: string;
  title: string;
  slug: string;
  description: string;
  details: string | null;
  src: string;
  order: number;
  active: number;
  createdAt: Date;
}): Specialty {
  return {
    ...s,
    slug: s.slug || slugify(s.title),
    active: s.active === 1,
    createdAt: s.createdAt.toISOString()
  };
}

export async function readSpecialties(): Promise<Specialty[]> {
  const items = await query('SELECT * FROM specialties ORDER BY `order` ASC');
  return items.map(toSpecialty);
}

export async function readActiveSpecialties(): Promise<Specialty[]> {
  const items = await cachedQuery('SELECT * FROM specialties WHERE active = 1 ORDER BY `order` ASC');
  return items.map(toSpecialty);
}

export async function readSpecialtyById(id: string): Promise<Specialty | null> {
  const items = await query('SELECT * FROM specialties WHERE id = ?', [id]);
  if (items.length === 0) return null;
  return toSpecialty(items[0]);
}

export async function readSpecialtyBySlug(slug: string): Promise<Specialty | null> {
  const items = await query('SELECT * FROM specialties WHERE slug = ?', [slug]);
  if (items.length === 0) return null;
  return toSpecialty(items[0]);
}

export async function countSpecialties(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM specialties');
  return result[0].count;
}

export async function createSpecialty(data: {
  title: string;
  description: string;
  details?: string;
  src: string;
  order: number;
  active: boolean;
}): Promise<Specialty> {
  const id = crypto.randomUUID();
  const slug = slugify(data.title);
  await query(
    'INSERT INTO specialties (id, title, slug, description, details, src, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.title, slug, data.description, data.details || null, data.src, data.order, data.active ? 1 : 0]
  );
  const created = await readSpecialtyById(id);
  if (!created) throw new Error('Failed to create specialty');
  return created;
}

export async function updateSpecialty(id: string, data: Partial<{
  title: string;
  description: string;
  details: string;
  src: string;
  order: number;
  active: boolean;
}>): Promise<Specialty | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
    fields.push('slug = ?');
    values.push(slugify(data.title));
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.details !== undefined) {
    fields.push('details = ?');
    values.push(data.details);
  }
  if (data.src !== undefined) {
    fields.push('src = ?');
    values.push(data.src);
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
    return readSpecialtyById(id);
  }

  values.push(id);
  await query(`UPDATE specialties SET ${fields.join(', ')} WHERE id = ?`, values);
  return readSpecialtyById(id);
}

export async function deleteSpecialty(id: string): Promise<void> {
  await query('DELETE FROM specialties WHERE id = ?', [id]);
}
