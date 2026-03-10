import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, parseSessionToken } from "@/lib/auth";
import { getPageFromPath, getPageFromApiPath, canAccess, canAction } from "@/lib/permissions";

// Public POST routes (forms submitted by visitors)
const PUBLIC_POST_ROUTES = [
  "/api/table-reservations",
  "/api/orders",
  "/api/contact-messages",
  "/api/room-reservations",
  "/api/event-reservations",
  "/api/comments",
];

function methodToAction(method: string): "create" | "update" | "delete" | null {
  if (method === "POST") return "create";
  if (method === "PATCH" || method === "PUT") return "update";
  if (method === "DELETE") return "delete";
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin pages (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const parsed = await parseSessionToken(session);
    if (!parsed) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check page-level permissions
    const page = getPageFromPath(pathname);
    if (page && page !== "dashboard" && !canAccess(parsed.role, page)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // Auth routes are always public
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Mutative API routes — protect unless public
  if (pathname.startsWith("/api/")) {
    const method = request.method;
    if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
      const isPublic = PUBLIC_POST_ROUTES.some(
        (route) => pathname === route && method === "POST"
      );
      if (!isPublic) {
        const session = request.cookies.get(COOKIE_NAME)?.value;
        if (!session) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsed = await parseSessionToken(session);
        if (!parsed) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check action-level permissions
        const page = getPageFromApiPath(pathname);
        const action = methodToAction(method);
        if (page && action && !canAction(parsed.role, page, action)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
