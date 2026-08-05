import { pgTable, text, timestamp, uuid, varchar, integer, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['super_admin', 'principal', 'counselor', 'staff']);
export const statusEnum = pgEnum('status', ['open', 'investigating', 'resolved', 'archived']);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dob: timestamp('dob').notNull(),
  grade: varchar('grade', { length: 50 }).notNull(),
  upn: varchar('upn', { length: 50 }).unique(), // Unique Pupil Number
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  reporterId: uuid('reporter_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  severity: severityEnum('severity').notNull().default('low'),
  status: statusEnum('status').notNull().default('open'),
  category: varchar('category', { length: 100 }).notNull(), // e.g., Bullying, Welfare
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 255 }).notNull(),
  entity: varchar('entity', { length: 255 }), // e.g., "incident:uuid"
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
