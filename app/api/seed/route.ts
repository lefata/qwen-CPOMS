import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hash } from 'bcryptjs';

export async function GET() {
  // PROTECT THIS ROUTE IN PRODUCTION!
  const hashedPassword = await hash('ChangeMeImmediately123!', 10);
  
  await db.insert(users).values({
    name: 'Super Admin',
    email: 'admin@school.edu',
    passwordHash: hashedPassword,
    role: 'super_admin',
  }).onConflictDoNothing();

  return NextResponse.json({ message: 'Admin seeded' });
}
