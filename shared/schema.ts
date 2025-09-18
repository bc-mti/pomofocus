import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionType: text("session_type").notNull(), // 'work', 'break', 'long_break'
  duration: integer("duration").notNull(), // duration in minutes
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  wasCompleted: boolean("was_completed").notNull().default(true), // true if session finished, false if skipped
  date: text("date").notNull(), // YYYY-MM-DD format for easy daily grouping
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).pick({
  sessionType: true,
  duration: true,
  wasCompleted: true,
  date: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;
