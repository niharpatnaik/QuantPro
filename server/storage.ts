import { db } from "./db";
import {
  challenges,
  submissions,
  type Challenge,
  type InsertChallenge,
  type Submission,
  type InsertSubmission
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";
import { chatStorage } from "./replit_integrations/chat/storage";

export interface IStorage {
  // Challenges
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  getChallengeBySlug(slug: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // Submissions
  getSubmissions(userId?: string): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission & { 
    status: string, 
    score: string, 
    metrics: any 
  }): Promise<Submission>;
}

export class DatabaseStorage implements IStorage {
  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).orderBy(challenges.id);
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async getChallengeBySlug(slug: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.slug, slug));
    return challenge;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db.insert(challenges).values(insertChallenge).returning();
    return challenge;
  }

  // Submissions
  async getSubmissions(userId?: string): Promise<Submission[]> {
    const query = db.select().from(submissions).orderBy(desc(submissions.createdAt));
    if (userId) {
      query.where(eq(submissions.userId, userId));
    }
    return await query;
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async createSubmission(insertSubmission: InsertSubmission & { 
    status: string, 
    score: string, 
    metrics: any 
  }): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }
}

export const storage = new DatabaseStorage();
// Export these for the integrations to use if needed
export { authStorage, chatStorage };
