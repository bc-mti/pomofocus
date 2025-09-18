import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPomodoroSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Pomodoro session routes
  
  // Save a completed session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertPomodoroSessionSchema.parse(req.body);
      const session = await storage.createPomodoroSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Get sessions for today
  app.get("/api/sessions/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessions = await storage.getPomodoroSessionsByDate(today);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching today's sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get sessions for this week
  app.get("/api/sessions/week", async (req, res) => {
    try {
      const sessions = await storage.getPomodoroSessionsThisWeek();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching week sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get sessions for last 30 days
  app.get("/api/sessions/month", async (req, res) => {
    try {
      const sessions = await storage.getPomodoroSessionsLast30Days();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching month sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get sessions by date range
  app.get("/api/sessions/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "startDate and endDate are required" });
      }
      const sessions = await storage.getPomodoroSessionsByDateRange(
        String(startDate), 
        String(endDate)
      );
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions by range:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
