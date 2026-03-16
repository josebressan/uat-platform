import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testExecutionsTable } from "./testExecutions";
import { usersTable } from "./users";

export const defectsTable = pgTable("defects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  severity: text("severity").notNull().default("Medium"),
  priority: text("priority").notNull().default("Medium"),
  status: text("status").notNull().default("New"),
  rootCause: text("root_cause").notNull().default(""),
  testExecutionId: integer("test_execution_id").references(() => testExecutionsTable.id),
  assigneeId: integer("assignee_id").references(() => usersTable.id),
  reporterId: integer("reporter_id").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDefectSchema = createInsertSchema(defectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDefect = z.infer<typeof insertDefectSchema>;
export type Defect = typeof defectsTable.$inferSelect;

export const defectCommentsTable = pgTable("defect_comments", {
  id: serial("id").primaryKey(),
  defectId: integer("defect_id").notNull().references(() => defectsTable.id),
  authorId: integer("author_id").references(() => usersTable.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDefectCommentSchema = createInsertSchema(defectCommentsTable).omit({ id: true, createdAt: true });
export type InsertDefectComment = z.infer<typeof insertDefectCommentSchema>;
export type DefectComment = typeof defectCommentsTable.$inferSelect;
