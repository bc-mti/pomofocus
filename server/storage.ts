import { type User, type InsertUser, type PomodoroSession, type InsertPomodoroSession } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pomodoroSessions: Map<string, PomodoroSession>;

  constructor() {
    this.users = new Map();
    this.pomodoroSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPomodoroSession(insertSession: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = randomUUID();
    const session: PomodoroSession = {
      ...insertSession,
      id,
      completedAt: new Date(),
      wasCompleted: insertSession.wasCompleted ?? true,
    };
    this.pomodoroSessions.set(id, session);
    return session;
  }

  async getPomodoroSessionsByDateRange(startDate: string, endDate: string): Promise<PomodoroSession[]> {
    return Array.from(this.pomodoroSessions.values())
      .filter(session => session.date >= startDate && session.date <= endDate)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  async getPomodoroSessionsByDate(date: string): Promise<PomodoroSession[]> {
    return Array.from(this.pomodoroSessions.values())
      .filter(session => session.date === date)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
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

export const storage = new MemStorage();
