import { signOut } from "@/lib/auth";

export async function POST() {
  await signOut();
  return Response.redirect(new URL("/login", process.env.NEXTAUTH_URL));
}
