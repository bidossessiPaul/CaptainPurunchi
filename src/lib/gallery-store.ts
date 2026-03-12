import { query, cachedQuery } from "@/lib/db";
import type { GalleryImage } from "@/app/types/gallery";

function toGalleryImage(g: {
  id: string;
  src: string;
  alt: string;
  type: string;
  order: number;
  active: number;
  createdAt: Date;
}): GalleryImage {
  return {
    ...g,
    active: g.active === 1,
    type: g.type as "image" | "video",
    createdAt: g.createdAt.toISOString()
  };
}

export async function readGalleryImages(): Promise<GalleryImage[]> {
  const items = await query('SELECT * FROM gallery_images ORDER BY `order` ASC');
  return items.map(toGalleryImage);
}

export async function readActiveGalleryImages(): Promise<GalleryImage[]> {
  const items = await cachedQuery('SELECT * FROM gallery_images WHERE active = 1 ORDER BY `order` ASC');
  return items.map(toGalleryImage);
}

export async function readGalleryImageById(id: string): Promise<GalleryImage | null> {
  const items = await query('SELECT * FROM gallery_images WHERE id = ?', [id]);
  if (items.length === 0) return null;
  return toGalleryImage(items[0]);
}

export async function countGalleryImages(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM gallery_images');
  return result[0].count;
}

export async function createGalleryImage(data: {
  src: string;
  alt: string;
  type: "image" | "video";
  order: number;
  active: boolean;
}): Promise<GalleryImage> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO gallery_images (id, src, alt, type, `order`, active) VALUES (?, ?, ?, ?, ?, ?)',
    [id, data.src, data.alt, data.type, data.order, data.active ? 1 : 0]
  );
  const created = await readGalleryImageById(id);
  if (!created) throw new Error('Failed to create gallery image');
  return created;
}

export async function updateGalleryImage(id: string, data: Partial<{
  src: string;
  alt: string;
  type: "image" | "video";
  order: number;
  active: boolean;
}>): Promise<GalleryImage | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.src !== undefined) {
    fields.push('src = ?');
    values.push(data.src);
  }
  if (data.alt !== undefined) {
    fields.push('alt = ?');
    values.push(data.alt);
  }
  if (data.type !== undefined) {
    fields.push('type = ?');
    values.push(data.type);
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
    return readGalleryImageById(id);
  }

  values.push(id);
  await query(`UPDATE gallery_images SET ${fields.join(', ')} WHERE id = ?`, values);
  return readGalleryImageById(id);
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await query('DELETE FROM gallery_images WHERE id = ?', [id]);
}
