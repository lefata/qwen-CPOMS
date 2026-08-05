// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  const cookie = req.headers.get("cookie");
  
  // Check for the session token cookie set by NextAuth
  const hasSessionToken = cookie?.includes("authjs.session-token=");
  
  const isOnDashboard = url.pathname.startsWith("/dashboard");
  const isOnLogin = url.pathname.startsWith("/login");

  // Redirect logged-in users away from login page
  if (isOnLogin && hasSessionToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect logged-out users to login page
  if (!hasSessionToken && !isOnLogin && !url.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
