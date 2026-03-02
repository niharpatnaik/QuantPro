export * from "./models/auth";
export * from "./models/chat";

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'Beginner', 'Practitioner', 'Expert'
  track: text("track").notNull(), // 'Alpha', 'Risk', 'Execution', 'Portfolio'
  starterCode: text("starter_code").notNull(),
  testCases: jsonb("test_cases").$type<any[]>().notNull(),
  points: integer("points").notNull().default(100),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Reference to auth.users.id
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  code: text("code").notNull(),
  status: text("status").notNull(), // 'pending', 'passed', 'failed'
  score: decimal("score").default("0"),
  metrics: jsonb("metrics").$type<{sharpe?: number, drawdown?: number, turnover?: number, stability?: number}>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const challengesRelations = relations(challenges, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  challenge: one(challenges, {
    fields: [submissions.challengeId],
    references: [challenges.id],
  }),
}));

// Schemas
export const insertChallengeSchema = createInsertSchema(challenges);
export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  status: true,
  score: true,
  metrics: true
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

// API Types
export type ChallengeResponse = Challenge;
export type SubmissionResponse = Submission;
