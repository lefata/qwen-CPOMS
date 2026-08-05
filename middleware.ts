// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

  // Role Based Access Control (Optional refinement)
  if (isLoggedIn && isOnDashboard) {
    const role = req.auth.user?.role;
    // Example: Prevent 'staff' from accessing specific admin routes if needed
    // if (req.nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'super_admin') {
    //   return NextResponse.redirect(new URL('/dashboard', req.url));
    // }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
