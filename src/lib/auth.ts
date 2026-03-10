export const COOKIE_NAME = "admin_session";
const SECRET = process.env.ADMIN_PASSWORD || "captain-purunchi-secret";

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Legacy token (backward compat with ADMIN_PASSWORD-only login)
export async function getLegacySessionToken(): Promise<string> {
  return sha256("captain-purunchi-auth:" + (process.env.ADMIN_PASSWORD || ""));
}

// New user-based session token: "userId:role:hash"
export async function createSessionToken(userId: string, role: string): Promise<string> {
  const hash = await sha256(`session:${userId}:${role}:${SECRET}`);
  return `${userId}:${role}:${hash}`;
}

export interface SessionInfo {
  userId: string;
  role: string;
  isLegacy: boolean;
}

// Parse session cookie → extract userId + role
// Works in middleware (no Prisma needed)
export async function parseSessionToken(cookieValue: string): Promise<SessionInfo | null> {
  if (!cookieValue) return null;

  // New format: userId:role:hash
  const parts = cookieValue.split(":");
  if (parts.length === 3) {
    const [userId, role, hash] = parts;
    const expected = await sha256(`session:${userId}:${role}:${SECRET}`);
    if (hash === expected) {
      return { userId, role, isLegacy: false };
    }
  }

  // Legacy format: plain hash
  const legacyToken = await getLegacySessionToken();
  if (cookieValue === legacyToken) {
    return { userId: "legacy-admin", role: "super_admin", isLegacy: true };
  }

  return null;
}

// Simple boolean check (middleware compat)
export async function verifySession(cookieValue: string): Promise<boolean> {
  return (await parseSessionToken(cookieValue)) !== null;
}

// Kept for backward compat
export async function getSessionToken(): Promise<string> {
  return getLegacySessionToken();
}
