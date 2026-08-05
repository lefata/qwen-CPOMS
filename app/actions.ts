'use server';

import { db } from '@/lib/db';
import { incidents, students, auditLogs, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Validation Schemas
const incidentSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().min(10),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
});

async function logAction(action: string, entity?: string) {
  const session = await auth();
  const headersList = await headers();
  
  await db.insert(auditLogs).values({
    userId: session?.user?.id ? (session.user.id as any) : null,
    action,
    entity,
    ipAddress: headersList.get('x-forwarded-for') || 'unknown',
    userAgent: headersList.get('user-agent') || 'unknown',
  });
}

export async function createIncident(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = incidentSchema.parse({
    studentId: formData.get('studentId'),
    title: formData.get('title'),
    description: formData.get('description'),
    severity: formData.get('severity'),
    category: formData.get('category'),
  });

  const [incident] = await db.insert(incidents).values({
    ...validated,
    reporterId: session.user.id as any,
  }).returning();

  await logAction('CREATE_INCIDENT', `incident:${incident.id}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function seedSuperAdmin() {
  // Run this once via a protected route or script to create initial admin
  const existing = await db.query.users.findFirst();
  if (existing) return { error: "Users already exist" };

  const hash = await bcrypt.hash("ChangeMe123!", 10);
  
  await db.insert(users).values({
    name: "Super Admin",
    email: process.env.ADMIN_EMAIL || "admin@school.edu",
    passwordHash: hash,
    role: "super_admin",
  });
  
  return { success: true };
}
