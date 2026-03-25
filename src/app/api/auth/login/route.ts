import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken, getLegacySessionToken } from "@/lib/auth";
import { verifyUserPassword } from "@/lib/user-store";
import { logActivity } from "@/lib/activity-log-store";
import { checkRateLimit } from "@/lib/rate-limiter";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function POST(request: NextRequest) {
  // Rate limiting — 5 attempts per IP per 15 minutes
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await request.json();
  const { email, password } = body;

  // New flow: email + password → user login
  if (email && password) {
    const user = await verifyUserPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    const token = await createSessionToken(user.id, user.role);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTS);

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "login",
      target: "auth",
    });

    return response;
  }

  // Legacy flow: password only → ADMIN_PASSWORD check
  if (password && password === process.env.ADMIN_PASSWORD) {
    const token = await getLegacySessionToken();
    const response = NextResponse.json({
      success: true,
      user: { id: "legacy-admin", name: "Admin", email: "admin@captainpurunchi.com", role: "super_admin" },
    });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTS);
    return response;
  }

  return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
}
