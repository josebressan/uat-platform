import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testCasesTable, testStepsTable } from "./testCases";
import { testCyclesTable } from "./testCycles";
import { usersTable } from "./users";

export const testExecutionsTable = pgTable("test_executions", {
  id: serial("id").primaryKey(),
  testCaseId: integer("test_case_id").notNull().references(() => testCasesTable.id),
  testCycleId: integer("test_cycle_id").notNull().references(() => testCyclesTable.id),
  executorId: integer("executor_id").references(() => usersTable.id),
  status: text("status").notNull().default("Not Started"),
  result: text("result").notNull().default("Pending"),
  notes: text("notes").notNull().default(""),
  executedAt: timestamp("executed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestExecutionSchema = createInsertSchema(testExecutionsTable).omit({ id: true, createdAt: true });
export type InsertTestExecution = z.infer<typeof insertTestExecutionSchema>;
export type TestExecution = typeof testExecutionsTable.$inferSelect;

export const testExecutionStepsTable = pgTable("test_execution_steps", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").notNull().references(() => testExecutionsTable.id),
  testStepId: integer("test_step_id").notNull().references(() => testStepsTable.id),
  stepNumber: integer("step_number").notNull(),
  action: text("action").notNull(),
  expectedResult: text("expected_result").notNull(),
  actualResult: text("actual_result").notNull().default(""),
  status: text("status").notNull().default("Not Executed"),
  notes: text("notes").notNull().default(""),
});

export const insertTestExecutionStepSchema = createInsertSchema(testExecutionStepsTable).omit({ id: true });
export type InsertTestExecutionStep = z.infer<typeof insertTestExecutionStepSchema>;
export type TestExecutionStep = typeof testExecutionStepsTable.$inferSelect;
