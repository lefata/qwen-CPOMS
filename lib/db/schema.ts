// lib/db/schema.ts
import { pgTable, text, timestamp, uuid, varchar, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define Roles
export const roleEnum = pgEnum('user_role', ['super_admin', 'principal', 'counsellor', 'staff']);
export const statusEnum = pgEnum('incident_status', ['open', 'investigating', 'resolved', 'closed']);
export const severityEnum = pgEnum('incident_severity', ['low', 'medium', 'high', 'critical']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Students Table (Missing in previous build)
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  grade: varchar('grade', { length: 50 }),
  house: varchar('house', { length: 50 }),
  guardians: text('guardians'), // JSON string or simple text for now
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Incidents Table
export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  reportedById: uuid('reported_by_id').references(() => users.id).notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // e.g., Bullying, Safeguarding
  severity: severityEnum('severity').default('medium'),
  status: statusEnum('status').default('open'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 255 }).notNull(),
  entity: varchar('entity', { length: 255 }), // e.g., 'incident', 'user'
  entityId: uuid('entity_id'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations (Optional but good for drizzle)
export const userRelations = relations(users, ({ many }) => ({
  incidentsReported: many(incidents, { relationName: 'reportedBy' }),
  incidentsAssigned: many(incidents, { relationName: 'assignedTo' }),
}));

export const studentRelations = relations(students, ({ many }) => ({
  incidents: many(incidents),
}));

export const incidentRelations = relations(incidents, ({ one }) => ({
  student: one(students, {
    fields: [incidents.studentId],
    references: [students.id],
  }),
  reporter: one(users, {
    fields: [incidents.reportedById],
    references: [users.id],
    relationName: 'reportedBy',
  }),
  assignee: one(users, {
    fields: [incidents.assignedToId],
    references: [users.id],
    relationName: 'assignedTo',
  }),
}));
