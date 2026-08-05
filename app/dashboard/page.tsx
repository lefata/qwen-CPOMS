import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { incidents, users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { LogOut, Shield, UserCheck, AlertTriangle } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const recentIncidents = await db.select().from(incidents).orderBy(desc(incidents.createdAt)).limit(5);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'principal': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-900" />
          <span className="font-bold text-xl text-slate-800">CPOMS Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{session.user.name || session.user.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor(session.user.role!)}`}>
              {session.user.role?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600"><AlertTriangle /></div>
              <div>
                <p className="text-sm text-slate-500">Open Incidents</p>
                <p className="text-2xl font-bold">{recentIncidents.filter(i => i.status === 'open').length}</p>
              </div>
            </div>
          </div>
          {/* Add more stats cards here based on role */}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Recent Incidents</h2>
            {session.user.role === 'super_admin' || session.user.role === 'principal' ? (
               <button className="text-sm bg-blue-900 text-white px-3 py-1.5 rounded hover:bg-blue-800">
                 + New Report
               </button>
            ) : null}
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentIncidents.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No incidents recorded yet.</td></tr>
              ) : (
                recentIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{incident.studentName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${incident.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize">{incident.status}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(incident.createdAt!).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
