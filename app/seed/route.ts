import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

export async function GET() {
  const hash = await bcrypt.hash("ChangeMe123!", 10);
  await db.insert(users).values({
    name: "super_admin",
    email: "admin@school.edu",
    passwordHash: hash,
    role: "super_admin",
  });
  return NextResponse.json({ message: "Admin created" });
}
