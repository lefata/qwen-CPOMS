// app/actions.ts
'use server';

import { db } from '@/lib/db';
import { incidents, students, auditLogs, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';

// Schema for creating an incident
const createIncidentSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

// Define the validation schema
const incidentSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export async function createIncident(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validated = incidentSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    severity: formData.get('severity'),
    studentId: formData.get('studentId'),
    status: 'open',
  });

  const [incident] = await db.insert(incidents).values({
    ...validated,
    reportedById: session.user.id,
  }).returning();

  await logAction('CREATE_INCIDENT', `incident:${incident.id}`);
  
  revalidatePath('/dashboard');
  
  // Fix: Do not return the incident object. Return void implicitly or explicitly.
  // return incident; // <--- Remove this line if it exists
}

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch incidents joined with students
  const data = await db.select({
    id: incidents.id,
    title: incidents.title,
    severity: incidents.severity,
    status: incidents.status,
    createdAt: incidents.createdAt,
    studentName: students.firstName, // Map to studentName
    studentId: students.id,
    reporterId: incidents.reportedById,
    assignedToId: incidents.assignedToId,
    description: incidents.description,
    category: incidents.category,
    updatedAt: incidents.updatedAt,
  })
  .from(incidents)
  .leftJoin(students, eq(incidents.studentId, students.id))
  .orderBy(desc(incidents.createdAt))
  .limit(50);

  return data;
}

async function logAction(action: string, entityId: string) {
  const session = await auth();
  const headersList = await headers();
  
  await db.insert(auditLogs).values({
    userId: session?.user?.id || null,
    action,
    entityId,
    entity: action.split('_')[1]?.toLowerCase() || 'unknown',
    ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
    userAgent: headersList.get('user-agent') || 'unknown',
  });
}
