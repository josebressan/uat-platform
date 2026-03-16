import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const releasesTable = pgTable("releases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("Planning"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  freezeDate: timestamp("freeze_date", { withTimezone: true }),
  goLiveDate: timestamp("go_live_date", { withTimezone: true }),
  ownerId: integer("owner_id").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReleaseSchema = createInsertSchema(releasesTable).omit({ id: true, createdAt: true });
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releasesTable.$inferSelect;
