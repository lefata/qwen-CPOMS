// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

// Force this route to be dynamic (never cached/static)
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // Check if admin already exists to prevent duplicates
    const existingAdmin = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, 'admin@school.edu'),
    });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin user already exists.' });
    }

    const hashedPassword = await bcrypt.hash('ChangeMeImmediately123!', 10);

    await db.insert(users).values({
      name: 'Super Admin',
      email: 'admin@school.edu',
      passwordHash: hashedPassword,
      role: 'super_admin',
    });

    return NextResponse.json({ message: 'Database seeded successfully! Admin created.' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
