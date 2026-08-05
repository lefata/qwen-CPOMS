import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// FORCE NODEJS RUNTIME: This prevents the "unsupported modules" error
// because bcryptjs and the DB driver cannot run on the Edge.
export const runtime = 'nodejs'; 

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnLogin = req.nextUrl.pathname.startsWith("/login");

  // Redirect logged-in users away from login page
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect logged-out users to login page
  if (!isLoggedIn && !isOnLogin && !req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
