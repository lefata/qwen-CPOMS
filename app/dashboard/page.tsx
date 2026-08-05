// app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDashboardData } from '../actions';
import { CreateIncidentForm } from '@/components/create-incident-form'; // Ensure this path is correct

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  let incidentsData: Awaited<ReturnType<typeof getDashboardData>> = [];
  try {
    incidentsData = await getDashboardData();
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Safeguarding Dashboard</h1>
          <p className="text-slate-500">Welcome back, {session.user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
            {session.user?.role}
          </span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-sm text-red-600 hover:text-red-800 font-medium">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Open Incidents</p>
          <p className="text-2xl font-bold text-slate-900">
            {incidentsData.filter(i => i.status === 'open').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">High/Critical Severity</p>
          <p className="text-2xl font-bold text-red-600">
            {incidentsData.filter(i => i.severity === 'high' || i.severity === 'critical').length}
          </p>
        </div>
        {/* Add more stats as needed */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Incidents List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Recent Incidents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Student</th>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Severity</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidentsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No incidents found.
                    </td>
                  </tr>
                ) : (
                  incidentsData.map((incident) => (
                    <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {incident.studentName || 'Unknown Student'}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{incident.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${incident.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                            incident.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / New Incident Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Incident</h2>
          <CreateIncidentForm />
        </div>
      </div>
    </div>
  );
}
