import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { releasesTable } from "./releases";
import { usersTable } from "./users";

export const approvalsTable = pgTable("approvals", {
  id: serial("id").primaryKey(),
  releaseId: integer("release_id").notNull().references(() => releasesTable.id),
  module: text("module").notNull(),
  type: text("type").notNull().default("Module"),
  status: text("status").notNull().default("Pending"),
  approverId: integer("approver_id").references(() => usersTable.id),
  comments: text("comments").notNull().default(""),
  conditions: text("conditions").notNull().default(""),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApprovalSchema = createInsertSchema(approvalsTable).omit({ id: true, createdAt: true });
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvalsTable.$inferSelect;
