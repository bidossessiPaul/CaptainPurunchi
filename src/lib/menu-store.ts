import { query } from "@/lib/db";
import type { MenuCategoryWithItems } from "@/app/types/menu";

function toCategory(c: {
  id: string;
  name: string;
  icon: string;
  order: number;
  active: number;
  createdAt: Date;
  items: {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: string;
    order: number;
    active: number;
    createdAt: Date;
  }[];
}): MenuCategoryWithItems {
  return {
    ...c,
    active: c.active === 1,
    createdAt: c.createdAt.toISOString(),
    items: c.items.map((item) => ({
      ...item,
      active: item.active === 1,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function readCategories(): Promise<MenuCategoryWithItems[]> {
  const cats = await query('SELECT * FROM menu_categories ORDER BY `order` ASC');

  const categoriesWithItems = await Promise.all(
    cats.map(async (cat: { id: string }) => {
      const items = await query(
        'SELECT * FROM menu_items WHERE categoryId = ? ORDER BY `order` ASC',
        [cat.id]
      );
      return { ...cat, items };
    })
  );

  return categoriesWithItems.map(toCategory);
}

export async function readActiveMenu(): Promise<MenuCategoryWithItems[]> {
  const cats = await query('SELECT * FROM menu_categories WHERE active = 1 ORDER BY `order` ASC');

  const categoriesWithItems = await Promise.all(
    cats.map(async (cat: { id: string }) => {
      const items = await query(
        'SELECT * FROM menu_items WHERE categoryId = ? AND active = 1 ORDER BY `order` ASC',
        [cat.id]
      );
      return { ...cat, items };
    })
  );

  return categoriesWithItems.map(toCategory);
}

export async function readCategoryById(id: string): Promise<MenuCategoryWithItems | null> {
  const cats = await query('SELECT * FROM menu_categories WHERE id = ?', [id]);
  if (cats.length === 0) return null;
  const cat = cats[0];
  const items = await query('SELECT * FROM menu_items WHERE categoryId = ? ORDER BY `order` ASC', [id]);
  return toCategory({ ...cat, items });
}

export async function countCategories(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM menu_categories');
  return result[0].count;
}

export async function createCategory(data: { name: string; icon: string; order: number; active: boolean }): Promise<MenuCategoryWithItems> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO menu_categories (id, name, icon, `order`, active) VALUES (?, ?, ?, ?, ?)',
    [id, data.name, data.icon, data.order, data.active ? 1 : 0]
  );
  const created = await readCategoryById(id);
  if (!created) throw new Error('Failed to create category');
  return created;
}

export async function updateCategory(id: string, data: Partial<{ name: string; icon: string; order: number; active: boolean }>): Promise<MenuCategoryWithItems | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.icon !== undefined) {
    fields.push('icon = ?');
    values.push(data.icon);
  }
  if (data.order !== undefined) {
    fields.push('`order` = ?');
    values.push(data.order);
  }
  if (data.active !== undefined) {
    fields.push('active = ?');
    values.push(data.active ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(id);
    await query(`UPDATE menu_categories SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return readCategoryById(id);
}

export async function deleteCategory(id: string): Promise<void> {
  await query('DELETE FROM menu_items WHERE categoryId = ?', [id]);
  await query('DELETE FROM menu_categories WHERE id = ?', [id]);
}

export async function readItems(categoryId?: string): Promise<{ id: string; categoryId: string; name: string; description: string; price: string; order: number; active: boolean; createdAt: string }[]> {
  const items = categoryId
    ? await query('SELECT * FROM menu_items WHERE categoryId = ? ORDER BY `order` ASC', [categoryId])
    : await query('SELECT * FROM menu_items ORDER BY `order` ASC');

  return items.map((item: { id: string; categoryId: string; name: string; description: string; price: string; order: number; active: number; createdAt: Date }) => ({
    ...item,
    active: item.active === 1,
    createdAt: item.createdAt.toISOString()
  }));
}

export async function readItemById(id: string): Promise<{ id: string; categoryId: string; name: string; description: string; price: string; order: number; active: boolean; createdAt: string } | null> {
  const items = await query('SELECT * FROM menu_items WHERE id = ?', [id]);
  if (items.length === 0) return null;
  const item = items[0];
  return {
    ...item,
    active: item.active === 1,
    createdAt: item.createdAt.toISOString()
  };
}

export async function countItemsInCategory(categoryId: string): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM menu_items WHERE categoryId = ?', [categoryId]);
  return result[0].count;
}

export async function createItem(data: {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  order: number;
  active: boolean;
}): Promise<{ id: string; categoryId: string; name: string; description: string; price: string; order: number; active: boolean; createdAt: string }> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO menu_items (id, categoryId, name, description, price, `order`, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.categoryId, data.name, data.description, data.price, data.order, data.active ? 1 : 0]
  );
  const created = await readItemById(id);
  if (!created) throw new Error('Failed to create item');
  return created;
}

export async function updateItem(id: string, data: Partial<{
  name: string;
  description: string;
  price: string;
  order: number;
  active: boolean;
}>): Promise<{ id: string; categoryId: string; name: string; description: string; price: string; order: number; active: boolean; createdAt: string } | null> {
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
  if (data.order !== undefined) {
    fields.push('`order` = ?');
    values.push(data.order);
  }
  if (data.active !== undefined) {
    fields.push('active = ?');
    values.push(data.active ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(id);
    await query(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return readItemById(id);
}

export async function deleteItem(id: string): Promise<void> {
  await query('DELETE FROM menu_items WHERE id = ?', [id]);
}
