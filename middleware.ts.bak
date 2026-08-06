// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Node.js runtime to avoid Edge limitations and crashes
export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static files and API routes to prevent loops
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Check for the NextAuth session cookie
  // NextAuth v5 uses 'authjs.session-token' by default
  const sessionCookie = request.cookies.get("authjs.session-token");
  const isLoggedIn = !!sessionCookie;

  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnLogin = pathname.startsWith("/login");

  // 3. Redirect Logic
  
  // If logged in and trying to visit login page -> go to dashboard
  if (isLoggedIn && isOnLogin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If NOT logged in and trying to visit dashboard -> go to login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
