import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, parseSessionToken } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
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
    const owner = await prisma.user.findUnique({
      where: { email: "dossoumaxime888@gmail.com" },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
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

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, name: true, email: true, role: true, avatar: true, active: true },
  });

  if (!user || !user.active) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
}
