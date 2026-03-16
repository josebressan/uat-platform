import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testCyclesTable } from "./testCycles";
import { usersTable } from "./users";

export const testPlansTable = pgTable("test_plans", {
  id: serial("id").primaryKey(),
  testCycleId: integer("test_cycle_id").notNull().references(() => testCyclesTable.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  module: text("module").notNull(),
  status: text("status").notNull().default("Draft"),
  entryCriteria: text("entry_criteria").notNull().default(""),
  exitCriteria: text("exit_criteria").notNull().default(""),
  ownerId: integer("owner_id").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestPlanSchema = createInsertSchema(testPlansTable).omit({ id: true, createdAt: true });
export type InsertTestPlan = z.infer<typeof insertTestPlanSchema>;
export type TestPlan = typeof testPlansTable.$inferSelect;
