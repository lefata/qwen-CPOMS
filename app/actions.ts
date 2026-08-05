// app/actions.ts
'use server';

import { db } from '@/lib/db';
import { incidents, students, auditLogs, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm'; // Ensure this exists
import { headers } from 'next/headers';

// Schema for creating an incident
const createIncidentSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().min(5).max(255),
  description: z.string().min(10),
  category: z.string().min(2),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export async function createIncident(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = createIncidentSchema.safeParse({
    studentId: formData.get('studentId'),
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    severity: formData.get('severity'),
  });

  if (!validated.success) {
    throw new Error('Invalid input');
  }

  // FIX: Use 'reportedById' to match the schema column name
  const [incident] = await db.insert(incidents).values({
    ...validated.data,
    reportedById: session.user.id as string, 
    status: 'open',
  }).returning();

  await logAction('CREATE_INCIDENT', `incident:${incident.id}`);
  
  revalidatePath('/dashboard');
  return incident;
}

async function logAction(action: string, entityId: string) {
  const session = await auth();
  const headersList = await headers();
  
  await db.insert(auditLogs).values({
    userId: session?.user?.id ? (session.user.id as string) : null,
    action,
    entityId,
    ipAddress: headersList.get('x-forwarded-for') || 'unknown',
    userAgent: headersList.get('user-agent') || 'unknown',
  });
}
export async function getDashboardData() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await logAction('VIEW_DASHBOARD', 'dashboard_main');

  // Fetch incidents with student data joined
  const allIncidents = await db.select({
    id: incidents.id,
    title: incidents.title,
    severity: incidents.severity,
    status: incidents.status,
    createdAt: incidents.createdAt,
    studentName: students.firstName, // Get student name
    studentId: students.id,
  })
  .from(incidents)
  .leftJoin(students, eq(incidents.studentId, students.id))
  .orderBy(desc(incidents.createdAt))
  .limit(50); // Limit for performance

  // Transform data to ensure compatibility with UI expecting 'studentName'
  const incidentsWithNames = allIncidents.map(inc => ({
    ...inc,
    studentName: inc.studentName || 'Unknown Student', // Fallback
  }));

  return {
    incidents: incidentsWithNames,
    stats: {
      total: incidentsWithNames.length,
      open: incidentsWithNames.filter(i => i.status === 'open').length,
      critical: incidentsWithNames.filter(i => i.severity === 'critical').length,
    },
  };
}
