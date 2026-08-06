import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and api routes (except auth api)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    (pathname.startsWith("/api") && !pathname.includes("auth"))
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("authjs.session-token");
  const hasSessionToken = !!cookie;

  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnLogin = pathname.startsWith("/login");

  // Redirect logged-in users away from login page
  if (isOnLogin && hasSessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect logged-out users to login page
  if (!hasSessionToken && !isOnLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
