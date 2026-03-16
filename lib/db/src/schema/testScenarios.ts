import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testPlansTable } from "./testPlans";

export const testScenariosTable = pgTable("test_scenarios", {
  id: serial("id").primaryKey(),
  testPlanId: integer("test_plan_id").notNull().references(() => testPlansTable.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  businessProcess: text("business_process").notNull().default(""),
  priority: text("priority").notNull().default("Medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestScenarioSchema = createInsertSchema(testScenariosTable).omit({ id: true, createdAt: true });
export type InsertTestScenario = z.infer<typeof insertTestScenarioSchema>;
export type TestScenario = typeof testScenariosTable.$inferSelect;
