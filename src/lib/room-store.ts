import { query } from "@/lib/db";
import type { Room } from "@/app/types/room";

function toRoom(r: {
  id: string;
  name: string;
  shortDesc: string;
  price: string;
  thumb: string;
  capacity: string;
  features: string;
  description: string;
  gallery: string;
  order: number;
  active: number;
  createdAt: Date;
}): Room {
  return {
    ...r,
    active: r.active === 1,
    features: JSON.parse(r.features) as string[],
    gallery: JSON.parse(r.gallery) as string[],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function readRooms(): Promise<Room[]> {
  const items = await query('SELECT * FROM rooms ORDER BY `order` ASC');
  return items.map(toRoom);
}

export async function readActiveRooms(): Promise<Room[]> {
  const items = await query('SELECT * FROM rooms WHERE active = 1 ORDER BY `order` ASC');
  return items.map(toRoom);
}

export async function readRoomById(id: string): Promise<Room | null> {
  const items = await query('SELECT * FROM rooms WHERE id = ?', [id]);
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
  features: string[];
  description: string;
  gallery: string[];
  order: number;
  active: boolean;
}): Promise<Room> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO rooms (id, name, shortDesc, price, thumb, capacity, features, description, gallery, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.shortDesc, data.price, data.thumb, data.capacity, JSON.stringify(data.features), data.description, JSON.stringify(data.gallery), data.order, data.active ? 1 : 0]
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
  features: string[];
  description: string;
  gallery: string[];
  order: number;
  active: boolean;
}>): Promise<Room | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.shortDesc !== undefined) {
    fields.push('shortDesc = ?');
    values.push(data.shortDesc);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    values.push(data.price);
  }
  if (data.thumb !== undefined) {
    fields.push('thumb = ?');
    values.push(data.thumb);
  }
  if (data.capacity !== undefined) {
    fields.push('capacity = ?');
    values.push(data.capacity);
  }
  if (data.features !== undefined) {
    fields.push('features = ?');
    values.push(JSON.stringify(data.features));
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.gallery !== undefined) {
    fields.push('gallery = ?');
    values.push(JSON.stringify(data.gallery));
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
    return readRoomById(id);
  }

  values.push(id);
  await query(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, values);
  return readRoomById(id);
}

export async function deleteRoom(id: string): Promise<void> {
  await query('DELETE FROM rooms WHERE id = ?', [id]);
}
