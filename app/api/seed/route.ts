import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

// Force dynamic rendering to avoid build-time DB errors
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('ChangeMeImmediately123!', 10);
    
    await db.insert(users).values({
      name: 'Super Admin',
      email: 'admin@school.edu',
      passwordHash: hashedPassword,
      role: 'super_admin',
    }).onConflictDoNothing();

    return NextResponse.json({ message: 'Database seeded successfully! Login with admin@school.edu / ChangeMeImmediately123!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
