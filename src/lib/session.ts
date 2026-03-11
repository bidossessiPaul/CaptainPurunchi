import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { COOKIE_NAME, parseSessionToken } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  active?: number;
}

// Get the current session user (for server components & API routes)
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return null;

  const parsed = await parseSessionToken(cookie);
  if (!parsed) return null;

  if (parsed.isLegacy) {
    // Try to map legacy session to owner account
    const owners: UserRow[] = await query(
      'SELECT id, name, email, role, avatar FROM users WHERE email = ?',
      ["dossoumaxime888@gmail.com"]
    );

    const owner = owners[0];
    if (owner) {
      return { id: owner.id, name: owner.name, email: owner.email, role: owner.role, avatar: owner.avatar };
    }
    return {
      id: "legacy-admin",
      name: "Admin",
      email: "admin@captainpurunchi.com",
      role: "super_admin",
      avatar: null,
    };
  }

  const users: UserRow[] = await query(
    'SELECT id, name, email, role, avatar, active FROM users WHERE id = ?',
    [parsed.userId]
  );

  const user = users[0];
  if (!user || !user.active) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
}
