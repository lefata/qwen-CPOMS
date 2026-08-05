import { pgTable, text, timestamp, uuid, varchar, integer, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'PRINCIPAL', 'COUNSELOR', 'STAFF']);
export const statusEnum = pgEnum('incident_status', ['OPEN', 'INVESTIGATING', 'RESOLVED', 'ARCHIVED']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('STAFF'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentName: text('student_name').notNull(),
  description: text('description').notNull(),
  severity: integer('severity').default(1), // 1-5 scale
  status: statusEnum('status').default('OPEN'),
  reporterId: uuid('reporter_id').references(() => users.id),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').defaultNow(),
});
