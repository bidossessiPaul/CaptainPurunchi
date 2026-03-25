import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

function toPublic(u: {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  active: number;
  lastLogin: Date | null;
  createdAt: Date;
}): UserPublic {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    active: u.active === 1,
    lastLogin: u.lastLogin?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function readAllUsers(): Promise<UserPublic[]> {
  const rows = await query('SELECT id, name, email, role, avatar, active, lastLogin, createdAt, updatedAt FROM users ORDER BY createdAt DESC');
  return rows.map(toPublic);
}

export async function readUserById(id: string): Promise<UserPublic | null> {
  const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] ? toPublic(rows[0]) : null;
}

export async function readUserByEmail(email: string) {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<UserPublic> {
  const hash = await bcrypt.hash(data.password, 10);
  const result = await query('INSERT INTO users SET ?', [{
    name: data.name,
    email: data.email,
    password: hash,
    role: data.role,
    updatedAt: new Date(),
  }]);
  const rows = await query('SELECT * FROM users WHERE id = ?', [(result as { insertId: string }).insertId]);
  return toPublic(rows[0]);
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; password?: string; role?: string; active?: boolean; avatar?: string }
): Promise<UserPublic> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email;
  if (data.role !== undefined) update.role = data.role;
  if (data.active !== undefined) update.active = data.active ? 1 : 0;
  if (data.avatar !== undefined) update.avatar = data.avatar;
  if (data.password) update.password = await bcrypt.hash(data.password, 10);

  update.updatedAt = new Date();
  await query('UPDATE users SET ? WHERE id = ?', [update, id]);
  const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
  return toPublic(rows[0]);
}

export async function deleteUser(id: string): Promise<void> {
  await query('DELETE FROM users WHERE id = ?', [id]);
}

export async function verifyUserPassword(email: string, password: string) {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0] as { id: string; name: string; email: string; role: string; avatar: string | null; active: number; password: string } | undefined;

  if (!user || user.active !== 1) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  await query('UPDATE users SET lastLogin = ?, updatedAt = ? WHERE id = ?', [new Date(), new Date(), user.id]);

  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
}
