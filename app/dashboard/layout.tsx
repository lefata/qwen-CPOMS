import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">CPOMS Platform</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{session.user?.name}</span>
          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700 uppercase">
            {session.user?.role}
          </span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-sm text-red-600 hover:text-red-800 font-medium">
              Sign Out
            </button>
          </form>
        </div>
      </nav>
      
      {/* Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
