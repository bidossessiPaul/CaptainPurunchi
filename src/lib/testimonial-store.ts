import { query } from "@/lib/db";
import type { Testimonial } from "@/app/types/testimonial";

function toTestimonial(r: {
  id: string;
  text: string;
  name: string;
  role: string;
  image: string | null;
  avatar: string | null;
  stars: number;
  order: number;
  active: number;
  createdAt: Date;
}): Testimonial {
  return {
    ...r,
    active: r.active === 1,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readTestimonials(): Promise<Testimonial[]> {
  const items = await query('SELECT * FROM testimonials ORDER BY `order` ASC');
  return items.map(toTestimonial);
}

export async function readActiveTestimonials(): Promise<Testimonial[]> {
  const items = await query('SELECT * FROM testimonials WHERE active = 1 ORDER BY `order` ASC');
  return items.map(toTestimonial);
}

export async function readTestimonialById(id: string): Promise<Testimonial | null> {
  const items = await query('SELECT * FROM testimonials WHERE id = ?', [id]);
  if (items.length === 0) return null;
  return toTestimonial(items[0]);
}

export async function countTestimonials(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM testimonials');
  return result[0].count;
}

export async function createTestimonial(data: {
  text: string;
  name: string;
  role: string;
  image: string | null;
  avatar: string | null;
  stars: number;
  order: number;
  active: boolean;
}): Promise<Testimonial> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO testimonials (id, text, name, role, image, avatar, stars, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.text, data.name, data.role, data.image, data.avatar, data.stars, data.order, data.active ? 1 : 0]
  );
  const created = await readTestimonialById(id);
  if (!created) throw new Error('Failed to create testimonial');
  return created;
}

export async function updateTestimonial(id: string, data: Partial<{
  text: string;
  name: string;
  role: string;
  image: string | null;
  avatar: string | null;
  stars: number;
  order: number;
  active: boolean;
}>): Promise<Testimonial | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.text !== undefined) {
    fields.push('text = ?');
    values.push(data.text);
  }
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.role !== undefined) {
    fields.push('role = ?');
    values.push(data.role);
  }
  if (data.image !== undefined) {
    fields.push('image = ?');
    values.push(data.image);
  }
  if (data.avatar !== undefined) {
    fields.push('avatar = ?');
    values.push(data.avatar);
  }
  if (data.stars !== undefined) {
    fields.push('stars = ?');
    values.push(data.stars);
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
    return readTestimonialById(id);
  }

  values.push(id);
  await query(`UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`, values);
  return readTestimonialById(id);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await query('DELETE FROM testimonials WHERE id = ?', [id]);
}
