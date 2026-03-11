import { query } from "@/lib/db";
import type { HeroSlide } from "@/app/types/hero";

function toHeroSlide(s: { id: string; src: string; title: string | null; subtitle: string | null; caption: string | null; order: number; active: number; createdAt: Date }): HeroSlide {
  return {
    ...s,
    active: s.active === 1,  // MySQL returns 1/0 for boolean
    createdAt: s.createdAt.toISOString()
  };
}

export async function readSlides(): Promise<HeroSlide[]> {
  const slides = await query('SELECT * FROM hero_slides ORDER BY `order` ASC');
  return slides.map(toHeroSlide);
}

export async function readActiveSlides(): Promise<HeroSlide[]> {
  const slides = await query('SELECT * FROM hero_slides WHERE active = 1 ORDER BY `order` ASC');
  return slides.map(toHeroSlide);
}

export async function readSlideById(id: string): Promise<HeroSlide | null> {
  const slides = await query('SELECT * FROM hero_slides WHERE id = ?', [id]);
  if (slides.length === 0) return null;
  return toHeroSlide(slides[0]);
}

export async function countSlides(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM hero_slides');
  return result[0].count;
}

export async function createSlide(data: {
  src: string;
  title: string | null;
  subtitle: string | null;
  caption: string | null;
  order: number;
  active: boolean;
}): Promise<HeroSlide> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO hero_slides (id, src, title, subtitle, caption, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.src, data.title, data.subtitle, data.caption, data.order, data.active ? 1 : 0]
  );
  const created = await readSlideById(id);
  if (!created) throw new Error('Failed to create slide');
  return created;
}

export async function updateSlide(id: string, data: Partial<{
  src: string;
  title: string | null;
  subtitle: string | null;
  caption: string | null;
  order: number;
  active: boolean;
}>): Promise<HeroSlide | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.src !== undefined) {
    fields.push('src = ?');
    values.push(data.src);
  }
  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.subtitle !== undefined) {
    fields.push('subtitle = ?');
    values.push(data.subtitle);
  }
  if (data.caption !== undefined) {
    fields.push('caption = ?');
    values.push(data.caption);
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
    return readSlideById(id);
  }

  values.push(id);
  await query(`UPDATE hero_slides SET ${fields.join(', ')} WHERE id = ?`, values);
  return readSlideById(id);
}

export async function deleteSlide(id: string): Promise<void> {
  await query('DELETE FROM hero_slides WHERE id = ?', [id]);
}
