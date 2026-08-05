import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { incidents, users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { BadgeAlert, Users, FileText, Shield } from 'lucide-react';

export default async function Dashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role;
  
  // Fetch data based on role (Simplified for demo)
  const recentIncidents = await db.query.incidents.findMany({
    orderBy: desc(incidents.createdAt),
    limit: 5,
  });

  const stats = [
    { label: 'Open Incidents', value: recentIncidents.filter(i => i.status === 'OPEN').length, icon: BadgeAlert, color: 'text-red-600 bg-red-50' },
    { label: 'Students Monitored', value: '1,240', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Reports Filed', value: recentIncidents.length, icon: FileText, color: 'text-green-600 bg-green-50' },
    { label: 'Security Level', value: 'High', icon: Shield, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Safeguarding Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Welcome, {session.user?.name}</span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase">
            {role?.replace('_', ' ')}
          </span>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Recent Incidents</h2>
            {role === 'SUPER_ADMIN' || role === 'PRINCIPAL' ? (
               <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            ) : null}
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        incident.severity! >= 4 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Level {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize">{incident.status}</td>
                    <td className="px-6 py-4">{new Date(incident.createdAt!).toLocaleDateString()}</td>
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
