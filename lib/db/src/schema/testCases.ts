import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testScenariosTable } from "./testScenarios";
import { usersTable } from "./users";

export const testCasesTable = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull().references(() => testScenariosTable.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  preconditions: text("preconditions").notNull().default(""),
  postconditions: text("postconditions").notNull().default(""),
  priority: text("priority").notNull().default("Medium"),
  complexity: text("complexity").notNull().default("Medium"),
  status: text("status").notNull().default("Draft"),
  assigneeId: integer("assignee_id").references(() => usersTable.id),
  estimatedMinutes: integer("estimated_minutes"),
  lastExecutionStatus: text("last_execution_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestCaseSchema = createInsertSchema(testCasesTable).omit({ id: true, createdAt: true });
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCasesTable.$inferSelect;

export const testStepsTable = pgTable("test_steps", {
  id: serial("id").primaryKey(),
  testCaseId: integer("test_case_id").notNull().references(() => testCasesTable.id),
  stepNumber: integer("step_number").notNull(),
  action: text("action").notNull(),
  expectedResult: text("expected_result").notNull(),
  testData: text("test_data").notNull().default(""),
});

export const insertTestStepSchema = createInsertSchema(testStepsTable).omit({ id: true });
export type InsertTestStep = z.infer<typeof insertTestStepSchema>;
export type TestStep = typeof testStepsTable.$inferSelect;
