import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Ignore static files and API routes (except auth)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") 
  ) {
    return NextResponse.next();
  }

  // 2. Check for session token safely
  const sessionToken = request.cookies.get("authjs.session-token")?.value;
  const isLoggedIn = !!sessionToken;

  // 3. Redirect Logic
  const isLoginPath = pathname === "/login";
  const isDashboardPath = pathname.startsWith("/dashboard");

  // If logged in and trying to access login page -> go to dashboard
  if (isLoggedIn && isLoginPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If NOT logged in and trying to access protected route -> go to login
  // We consider root "/" and "/dashboard" as protected. 
  // Adjust this list if you have public landing pages.
  if (!isLoggedIn && !isLoginPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
