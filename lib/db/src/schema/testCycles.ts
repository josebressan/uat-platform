import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { releasesTable } from "./releases";
import { usersTable } from "./users";

export const testCyclesTable = pgTable("test_cycles", {
  id: serial("id").primaryKey(),
  releaseId: integer("release_id").notNull().references(() => releasesTable.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("UAT"),
  status: text("status").notNull().default("Planning"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  ownerId: integer("owner_id").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestCycleSchema = createInsertSchema(testCyclesTable).omit({ id: true, createdAt: true });
export type InsertTestCycle = z.infer<typeof insertTestCycleSchema>;
export type TestCycle = typeof testCyclesTable.$inferSelect;
