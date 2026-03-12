import { query, cachedQuery } from "@/lib/db";
import type { DailyDish } from "@/app/types/daily-dish";

function toDailyDish(d: {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  photo: string;
  availableDate: string;
  order: number;
  active: number;
  createdAt: Date;
}): DailyDish {
  return {
    ...d,
    active: d.active === 1,
    createdAt: d.createdAt.toISOString()
  };
}

export async function readAllDailyDishes(): Promise<DailyDish[]> {
  const dishes = await query('SELECT * FROM daily_dishes ORDER BY `order` ASC');
  return dishes.map(toDailyDish);
}

export async function readDishesForDate(date: string): Promise<DailyDish[]> {
  const dishes = await query(
    'SELECT * FROM daily_dishes WHERE availableDate = ? AND active = 1 ORDER BY `order` ASC',
    [date]
  );
  return dishes.map(toDailyDish);
}

export async function readTodaysDishes(): Promise<DailyDish[]> {
  const today = new Date().toISOString().split("T")[0];
  const dishes = await cachedQuery(
    'SELECT * FROM daily_dishes WHERE availableDate = ? AND active = 1 ORDER BY `order` ASC',
    [today]
  );
  return dishes.map(toDailyDish);
}

export async function readDishById(id: string): Promise<DailyDish | null> {
  const dishes = await query('SELECT * FROM daily_dishes WHERE id = ?', [id]);
  if (dishes.length === 0) return null;
  return toDailyDish(dishes[0]);
}

export async function countDailyDishes(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM daily_dishes');
  return result[0].count;
}

export async function createDailyDish(data: {
  name: string;
  description: string;
  price: string;
  category: string;
  photo: string;
  availableDate: string;
  order: number;
  active: boolean;
}): Promise<DailyDish> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO daily_dishes (id, name, description, price, category, photo, availableDate, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.description, data.price, data.category, data.photo, data.availableDate, data.order, data.active ? 1 : 0]
  );
  const created = await readDishById(id);
  if (!created) throw new Error('Failed to create daily dish');
  return created;
}

export async function updateDailyDish(id: string, data: Partial<{
  name: string;
  description: string;
  price: string;
  category: string;
  photo: string;
  availableDate: string;
  order: number;
  active: boolean;
}>): Promise<DailyDish | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    values.push(data.price);
  }
  if (data.category !== undefined) {
    fields.push('category = ?');
    values.push(data.category);
  }
  if (data.photo !== undefined) {
    fields.push('photo = ?');
    values.push(data.photo);
  }
  if (data.availableDate !== undefined) {
    fields.push('availableDate = ?');
    values.push(data.availableDate);
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
    return readDishById(id);
  }

  values.push(id);
  await query(`UPDATE daily_dishes SET ${fields.join(', ')} WHERE id = ?`, values);
  return readDishById(id);
}

export async function deleteDailyDish(id: string): Promise<void> {
  await query('DELETE FROM daily_dishes WHERE id = ?', [id]);
}

export async function countDailyDishesByDate(date: string): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM daily_dishes WHERE availableDate = ?', [date]);
  return result[0].count;
}
