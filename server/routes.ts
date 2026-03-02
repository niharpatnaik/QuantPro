import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
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

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getChallenges();
  if (existing.length === 0) {
    await storage.createChallenge({
      title: "Rolling Beta Calculation",
      slug: "rolling-beta",
      description: "Calculate the rolling 60-day beta of a stock against the SPY ETF using log returns.",
      difficulty: "Foundation",
      track: "Alpha",
      points: 100,
      starterCode: `import pandas as pd\nimport numpy as np\n\ndef calculate_rolling_beta(returns, benchmark_returns, window=60):\n    # Your code here\n    pass`,
      testCases: []
    });

    await storage.createChallenge({
      title: "VWAP Execution Algorithm",
      slug: "vwap-execution",
      description: "Implement a Volume Weighted Average Price (VWAP) execution algorithm that minimizes slippage.",
      difficulty: "Practitioner",
      track: "Execution",
      points: 200,
      starterCode: `def vwap_schedule(volume_profile, total_shares):\n    # Return a schedule of shares to trade per bin\n    pass`,
      testCases: []
    });

    await storage.createChallenge({
      title: "Portfolio Optimization with Constraints",
      slug: "portfolio-opt",
      description: "Optimize a portfolio of 50 assets to maximize Sharpe Ratio while keeping sector exposure within +/- 5%.",
      difficulty: "Expert",
      track: "Portfolio",
      points: 300,
      starterCode: `def optimize_portfolio(returns, cov_matrix, constraints):\n    # Return weights\n    pass`,
      testCases: []
    });
  }
}
