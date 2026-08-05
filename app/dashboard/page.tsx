import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { incidents, students } from "@/lib/db/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CreateIncidentForm } from "@/components/create-incident-form";
import { desc } from "drizzle-orm";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  
  // Fetch data based on role (Counselors/Principals see all, Staff might see limited)
  const recentIncidents = await db.query.incidents.findMany({
    limit: 5,
    orderBy: [desc(incidents.createdAt)],
    with: { student: true }
  });

  const studentCount = await db.$count(students);
  const openIncidents = await db.$count(incidents);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-900">Safeguarding Platform</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{session.user.name} ({role})</span>
          <form action="/api/auth/signout" method="POST">
             <button className="text-sm text-red-600 hover:underline">Sign Out</button>
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-500">Total Students</h3></CardHeader>
            <CardContent><p className="text-3xl font-bold text-slate-900">{studentCount}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-500">Open Incidents</h3></CardHeader>
            <CardContent><p className="text-3xl font-bold text-orange-600">{openIncidents}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-500">Critical Alerts</h3></CardHeader>
            <CardContent><p className="text-3xl font-bold text-red-600">0</p></CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Form - Visible to authorized roles */}
          {(role === 'counselor' || role === 'principal' || role === 'super_admin') && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader><h3 className="font-bold text-slate-800">Log New Incident</h3></CardHeader>
                <CardContent>
                  <CreateIncidentForm />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><h3 className="font-bold text-slate-800">Recent Incidents</h3></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Severity</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIncidents.map((inc) => (
                        <tr key={inc.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{inc.student.firstName} {inc.student.lastName}</td>
                          <td className="px-4 py-3">{inc.category}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              inc.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {inc.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 capitalize">{inc.status}</td>
                        </tr>
                      ))}
                      {recentIncidents.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No incidents recorded yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
