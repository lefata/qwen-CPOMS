// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm'; // Add this import
import bcrypt from 'bcryptjs';

// Force dynamic rendering to prevent static generation at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('ChangeMeImmediately123!', 10);
    
    // Check if admin already exists to avoid errors on repeated visits
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@school.edu')).limit(1);
    
    if (existingAdmin.length > 0) {
      return NextResponse.json({ message: 'Admin user already exists. Login with admin@school.edu' });
    }

    await db.insert(users).values({
      name: 'Super Admin',
      email: 'admin@school.edu',
      passwordHash: hashedPassword,
      role: 'super_admin',
    });

    return NextResponse.json({ message: 'Database seeded successfully! Login with admin@school.edu / ChangeMeImmediately123!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database. Did you run drizzle-kit push?', status: 500 });
  }
}
