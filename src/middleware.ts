import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

// Public POST routes (forms submitted by visitors)
const PUBLIC_POST_ROUTES = [
  "/api/table-reservations",
  "/api/orders",
  "/api/contact-messages",
  "/api/room-reservations",
  "/api/event-reservations",
  "/api/comments",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin pages (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    if (!session || !(await verifySession(session))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Auth routes are always public
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Mutative API routes (POST/PUT/DELETE) — protect unless public
  if (pathname.startsWith("/api/")) {
    const method = request.method;
    if (method === "POST" || method === "PUT" || method === "DELETE") {
      const isPublic = PUBLIC_POST_ROUTES.some(
        (route) => pathname === route && method === "POST"
      );
      if (!isPublic) {
        const session = request.cookies.get(COOKIE_NAME)?.value;
        if (!session || !(await verifySession(session))) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
