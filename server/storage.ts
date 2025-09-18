import { type User, type InsertUser, type PomodoroSession, type InsertPomodoroSession, users, pomodoroSessions } from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, gte, lte, desc } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pomodoro session methods
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  getPomodoroSessionsByDateRange(startDate: string, endDate: string): Promise<PomodoroSession[]>;
  getPomodoroSessionsByDate(date: string): Promise<PomodoroSession[]>;
  getPomodoroSessionsLast30Days(): Promise<PomodoroSession[]>;
  getPomodoroSessionsThisWeek(): Promise<PomodoroSession[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createPomodoroSession(insertSession: InsertPomodoroSession): Promise<PomodoroSession> {
    const sessionData = {
      ...insertSession,
      wasCompleted: insertSession.wasCompleted ?? true,
    };
    const result = await db.insert(pomodoroSessions).values(sessionData).returning();
    return result[0];
  }

  async getPomodoroSessionsByDateRange(startDate: string, endDate: string): Promise<PomodoroSession[]> {
    return await db.select()
      .from(pomodoroSessions)
      .where(and(
        gte(pomodoroSessions.date, startDate),
        lte(pomodoroSessions.date, endDate)
      ))
      .orderBy(desc(pomodoroSessions.completedAt));
  }

  async getPomodoroSessionsByDate(date: string): Promise<PomodoroSession[]> {
    return await db.select()
      .from(pomodoroSessions)
      .where(eq(pomodoroSessions.date, date))
      .orderBy(desc(pomodoroSessions.completedAt));
  }

  async getPomodoroSessionsLast30Days(): Promise<PomodoroSession[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    return this.getPomodoroSessionsByDateRange(startDate, endDate);
  }

  async getPomodoroSessionsThisWeek(): Promise<PomodoroSession[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    return this.getPomodoroSessionsByDateRange(startDate, endDate);
  }
}

export const storage = new DatabaseStorage();
