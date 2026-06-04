import { query, cachedQuery } from "@/lib/db";
import type { Room } from "@/app/types/room";

export function slugifyRoom(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseJson<T>(val: unknown, fallback: T): T {
  try { const p = JSON.parse(val as string || "[]"); return Array.isArray(p) ? p as T : fallback; } catch { return fallback; }
}

function toRoom(r: Record<string, unknown>): Room {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: (r.slug as string) || slugifyRoom(r.name as string),
    shortDesc: r.shortDesc as string,
    price: r.price as string,
    thumb: r.thumb as string,
    capacity: r.capacity as string,
    size: (r.size as string) || null,
    bedType: (r.bedType as string) || null,
    view: (r.view as string) || null,
    features: parseJson<string[]>(r.features, []),
    description: r.description as string,
    gallery: parseJson<string[]>(r.gallery, []),
    order: r.order as number,
    active: r.active === 1,
    createdAt: (r.createdAt as Date).toISOString(),
  };
}

export async function readRooms(): Promise<Room[]> {
  const items = await query('SELECT * FROM rooms ORDER BY `order` ASC');
  return items.map(toRoom);
}

export async function readActiveRooms(): Promise<Room[]> {
  const items = await cachedQuery('SELECT * FROM rooms WHERE active = 1 ORDER BY `order` ASC');
  return items.map(toRoom);
}

export async function readRoomById(id: string): Promise<Room | null> {
  const items = await query('SELECT * FROM rooms WHERE id = ?', [id]);
  if (items.length === 0) return null;
  return toRoom(items[0]);
}

export async function readRoomBySlug(slug: string): Promise<Room | null> {
  const items = await query('SELECT * FROM rooms WHERE slug = ?', [slug]);
  if (items.length === 0) return null;
  return toRoom(items[0]);
}

export async function countRooms(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM rooms');
  return result[0].count;
}

export async function createRoom(data: {
  name: string;
  shortDesc: string;
  price: string;
  thumb: string;
  capacity: string;
  size?: string;
  bedType?: string;
  view?: string;
  features: string[];
  description: string;
  gallery: string[];
  order: number;
  active: boolean;
}): Promise<Room> {
  const id = crypto.randomUUID();
  const slug = slugifyRoom(data.name);
  await query(
    'INSERT INTO rooms (id, name, slug, shortDesc, price, thumb, capacity, size, bedType, view, features, description, gallery, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, slug, data.shortDesc, data.price, data.thumb, data.capacity, data.size || null, data.bedType || null, data.view || null, JSON.stringify(data.features), data.description, JSON.stringify(data.gallery), data.order, data.active ? 1 : 0]
  );
  const created = await readRoomById(id);
  if (!created) throw new Error('Failed to create room');
  return created;
}

export async function updateRoom(id: string, data: Partial<{
  name: string;
  shortDesc: string;
  price: string;
  thumb: string;
  capacity: string;
  size: string;
  bedType: string;
  view: string;
  features: string[];
  description: string;
  gallery: string[];
  order: number;
  active: boolean;
}>): Promise<Room | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?', 'slug = ?');
    values.push(data.name, slugifyRoom(data.name));
  }
  if (data.shortDesc !== undefined) { fields.push('shortDesc = ?'); values.push(data.shortDesc); }
  if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
  if (data.thumb !== undefined) { fields.push('thumb = ?'); values.push(data.thumb); }
  if (data.capacity !== undefined) { fields.push('capacity = ?'); values.push(data.capacity); }
  if (data.size !== undefined) { fields.push('size = ?'); values.push(data.size || null); }
  if (data.bedType !== undefined) { fields.push('bedType = ?'); values.push(data.bedType || null); }
  if (data.view !== undefined) { fields.push('view = ?'); values.push(data.view || null); }
  if (data.features !== undefined) { fields.push('features = ?'); values.push(JSON.stringify(data.features)); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.gallery !== undefined) { fields.push('gallery = ?'); values.push(JSON.stringify(data.gallery)); }
  if (data.order !== undefined) { fields.push('`order` = ?'); values.push(data.order); }
  if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active ? 1 : 0); }

  if (fields.length === 0) return readRoomById(id);

  values.push(id);
  await query(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, values);
  return readRoomById(id);
}

export async function deleteRoom(id: string): Promise<void> {
  await query('DELETE FROM rooms WHERE id = ?', [id]);
}
