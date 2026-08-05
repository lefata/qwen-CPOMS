// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

// Force this route to be dynamic (never static/prerendered)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('ChangeMeImmediately123!', 10);
    
    // Try to insert the admin user
    await db.insert(users).values({
      name: 'Super Admin',
      email: 'admin@school.edu',
      passwordHash: hashedPassword,
      role: 'super_admin',
    }).onConflictDoNothing();

    return NextResponse.json({ 
      message: 'Database seeded successfully! Login with admin@school.edu / ChangeMeImmediately123!',
      note: 'If you see this, the tables likely already exist or were just created.'
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    // Check if it's the "relation does not exist" error
    if (error.message?.includes('relation "users" does not exist')) {
      return NextResponse.json({ 
        error: 'Database tables do not exist yet.',
        instruction: 'Please run "npx drizzle-kit push" locally first to create the tables in Neon.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
  }
}
