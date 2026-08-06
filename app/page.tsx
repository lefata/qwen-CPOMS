import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    // If logged in, go to dashboard
    redirect("/dashboard");
  } else {
    // If not logged in, go to login
    redirect("/login");
  }
}
