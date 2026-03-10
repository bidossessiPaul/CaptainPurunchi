import { prisma } from "@/lib/prisma";
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
  active: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}): UserPublic {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    active: u.active,
    lastLogin: u.lastLogin?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function readAllUsers(): Promise<UserPublic[]> {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toPublic);
}

export async function readUserById(id: string): Promise<UserPublic | null> {
  const u = await prisma.user.findUnique({ where: { id } });
  return u ? toPublic(u) : null;
}

export async function readUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<UserPublic> {
  const hash = await bcrypt.hash(data.password, 10);
  const u = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hash, role: data.role },
  });
  return toPublic(u);
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; password?: string; role?: string; active?: boolean; avatar?: string }
): Promise<UserPublic> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email;
  if (data.role !== undefined) update.role = data.role;
  if (data.active !== undefined) update.active = data.active;
  if (data.avatar !== undefined) update.avatar = data.avatar;
  if (data.password) update.password = await bcrypt.hash(data.password, 10);

  const u = await prisma.user.update({ where: { id }, data: update });
  return toPublic(u);
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}

export async function verifyUserPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return null;
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
}
