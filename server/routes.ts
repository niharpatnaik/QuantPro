import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { challengesSeed } from "./seed-challenges";
import { setupAuth, registerAuthRoutes, isAuthenticated, authStorage } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

const ADMIN_EMAIL = "npatnaik@gmail.com";

const isAdmin: RequestHandler = (req: any, res, next) => {
  if (!req.isAuthenticated() || !req.user || req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === Challenges ===
  app.get(api.challenges.list.path, async (req, res) => {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  });

  app.get(api.challenges.get.path, async (req, res) => {
    const challenge = await storage.getChallenge(Number(req.params.id));
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  });

  app.post(api.challenges.create.path, async (req, res) => {
    try {
      const input = api.challenges.create.input.parse(req.body);
      const challenge = await storage.createChallenge(input);
      res.status(201).json(challenge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Submissions ===
  app.get(api.submissions.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.id;
    const submissions = await storage.getSubmissions(userId);
    res.json(submissions);
  });

  app.post(api.submissions.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.submissions.create.input.parse({
        ...req.body,
        userId: req.user.id
      });

      // MOCK GRADING ENGINE for MVP
      // In a real app, this would run code in a sandbox
      const isSuccess = Math.random() > 0.3;
      const status = isSuccess ? 'passed' : 'failed';
      const sharpe = (Math.random() * 3).toFixed(2); // 0.00 to 3.00
      const drawdown = (Math.random() * -20).toFixed(2); // 0.00 to -20.00
      const score = isSuccess ? (Math.random() * 40 + 60).toFixed(0) : "0";

      const submission = await storage.createSubmission({
        ...input,
        status,
        score,
        metrics: {
          sharpe: Number(sharpe),
          drawdown: Number(drawdown),
          stability: Number((Math.random() * 100).toFixed(1))
        }
      });
      
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.submissions.get.path, isAuthenticated, async (req, res) => {
    const submission = await storage.getSubmission(Number(req.params.id));
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  });

  // === Admin: User Traffic (owner only) ===
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const allUsers = await authStorage.getAllUsers();
    const allSubmissions = await storage.getSubmissions();

    const userStats = allUsers.map((user) => {
      const userSubs = allSubmissions.filter((s) => s.userId === user.id);
      const totalScore = userSubs.reduce(
        (sum, s) => sum + Number(s.score || 0),
        0
      );
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        challengesAttempted: userSubs.length,
        totalScore,
      };
    });

    userStats.sort((a, b) => b.totalScore - a.totalScore);
    userStats.forEach((u, i) => (u as any).rank = i + 1);

    res.json(userStats);
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    const stats = await authStorage.getUserTrafficStats();
    res.json(stats);
  });

  // === Feedback ===
  app.post("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const { message, pageUrl } = req.body;
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ message: "Feedback message is required" });
      }
      const fb = await storage.createFeedback({
        userId: req.user.id,
        userEmail: req.user.email,
        userName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || null,
        pageUrl: pageUrl || "/",
        message: message.trim(),
      });
      res.status(201).json(fb);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/feedback", isAdmin, async (req, res) => {
    const allFeedback = await storage.getAllFeedback();
    res.json(allFeedback);
  });

  app.delete("/api/admin/feedback/:id", isAdmin, async (req, res) => {
    await storage.deleteFeedback(Number(req.params.id));
    res.json({ success: true });
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getChallenges();
  if (existing.length < 60) {
    if (existing.length > 0) {
      await storage.deleteAllChallenges();
    }
    for (const challenge of challengesSeed) {
      await storage.createChallenge(challenge);
    }
    console.log(`Seeded ${challengesSeed.length} challenges`);
  }
}
