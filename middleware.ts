// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const { pathname } = request.nextUrl;

  // Skip static files and api routes (except auth api)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get the session cookie set by NextAuth v5 (default name is 'authjs.session-token')
  const sessionCookie = request.cookies.get("authjs.session-token");
  const isLoggedIn = !!sessionCookie;

  // Redirect logic
  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard and other private routes
  if (!isLoggedIn && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
