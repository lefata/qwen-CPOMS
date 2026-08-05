// components/login-form.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-slate-200">
      <div className="mb-6 flex justify-center text-blue-900">
        <ShieldCheck size={56} strokeWidth={1.5} />
      </div>
      <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
        CPOMS Portal
      </h1>
      <p className="mb-8 text-center text-sm text-slate-500">
        Secure Safeguarding Login
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@school.edu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
