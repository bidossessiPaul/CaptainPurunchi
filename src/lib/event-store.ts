import { query, cachedQuery } from "@/lib/db";
import type { Event } from "@/app/types/event";

function toEvent(r: {
  id: string;
  featured: number;
  tag: string;
  title: string;
  shortDesc: string;
  description: string;
  day: string;
  month: string;
  time: string;
  location: string;
  price: string;
  thumb: string;
  gallery: string;
  includes: string;
  order: number;
  active: number;
  createdAt: Date;
}): Event {
  return {
    ...r,
    featured: r.featured === 1,
    active: r.active === 1,
    gallery: JSON.parse(r.gallery) as string[],
    includes: JSON.parse(r.includes) as string[],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readEvents(): Promise<Event[]> {
  const items = await query('SELECT * FROM events ORDER BY `order` ASC');
  return items.map(toEvent);
}

export async function readActiveEvents(): Promise<Event[]> {
  const items = await cachedQuery('SELECT * FROM events WHERE active = 1 ORDER BY `order` ASC');
  return items.map(toEvent);
}

export async function readEventById(id: string): Promise<Event | null> {
  const items = await query('SELECT * FROM events WHERE id = ?', [id]);
  if (items.length === 0) return null;
  return toEvent(items[0]);
}

export async function countEvents(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM events');
  return result[0].count;
}

export async function createEvent(data: {
  featured: boolean;
  tag: string;
  title: string;
  shortDesc: string;
  description: string;
  day: string;
  month: string;
  time: string;
  location: string;
  price: string;
  thumb: string;
  gallery: string[];
  includes: string[];
  order: number;
  active: boolean;
}): Promise<Event> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO events (id, featured, tag, title, shortDesc, description, day, month, time, location, price, thumb, gallery, includes, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.featured ? 1 : 0, data.tag, data.title, data.shortDesc, data.description, data.day, data.month, data.time, data.location, data.price, data.thumb, JSON.stringify(data.gallery), JSON.stringify(data.includes), data.order, data.active ? 1 : 0]
  );
  const created = await readEventById(id);
  if (!created) throw new Error('Failed to create event');
  return created;
}

export async function updateEvent(id: string, data: Partial<{
  featured: boolean;
  tag: string;
  title: string;
  shortDesc: string;
  description: string;
  day: string;
  month: string;
  time: string;
  location: string;
  price: string;
  thumb: string;
  gallery: string[];
  includes: string[];
  order: number;
  active: boolean;
}>): Promise<Event | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.featured !== undefined) {
    fields.push('featured = ?');
    values.push(data.featured ? 1 : 0);
  }
  if (data.tag !== undefined) {
    fields.push('tag = ?');
    values.push(data.tag);
  }
  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.shortDesc !== undefined) {
    fields.push('shortDesc = ?');
    values.push(data.shortDesc);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.day !== undefined) {
    fields.push('day = ?');
    values.push(data.day);
  }
  if (data.month !== undefined) {
    fields.push('month = ?');
    values.push(data.month);
  }
  if (data.time !== undefined) {
    fields.push('time = ?');
    values.push(data.time);
  }
  if (data.location !== undefined) {
    fields.push('location = ?');
    values.push(data.location);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    values.push(data.price);
  }
  if (data.thumb !== undefined) {
    fields.push('thumb = ?');
    values.push(data.thumb);
  }
  if (data.gallery !== undefined) {
    fields.push('gallery = ?');
    values.push(JSON.stringify(data.gallery));
  }
  if (data.includes !== undefined) {
    fields.push('includes = ?');
    values.push(JSON.stringify(data.includes));
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
    return readEventById(id);
  }

  values.push(id);
  await query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
  return readEventById(id);
}

export async function deleteEvent(id: string): Promise<void> {
  await query('DELETE FROM events WHERE id = ?', [id]);
}
