import { pgTable, text, timestamp, varchar, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['super_admin', 'principal', 'counselor', 'staff']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  studentDOB: varchar('student_dob', { length: 10 }),
  description: text('description').notNull(),
  severity: varchar('severity', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('open'),
  reportedBy: uuid('reported_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
