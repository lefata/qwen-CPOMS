// middleware.ts
import { nextauth } from "next-auth"; // Import the low-level handler if needed, or just use cookies
import { NextResponse } from "next/server";

// We rely on the presence of the auth token cookie instead of importing the heavy auth object
export async function middleware(req: any) {
  const { nextUrl } = req;
  const isLoggedIn = !!req.cookies.get("authjs.session-token"); // Default NextAuth v5 cookie name
  
  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isOnLogin = nextUrl.pathname.startsWith("/login");

  // Redirect logged-in users away from login page
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect logged-out users to login page
  if (!isLoggedIn && !isOnLogin && !nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
