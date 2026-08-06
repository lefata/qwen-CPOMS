import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <LoginForm />
    </div>
  );
}
