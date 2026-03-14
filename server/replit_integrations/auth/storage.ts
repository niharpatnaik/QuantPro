import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq, desc, gte, count, sql } from "drizzle-orm";
import { submissions } from "@shared/schema";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<{ user: User; isNew: boolean }>;
  getAllUsers(): Promise<User[]>;
  getUserTrafficStats(): Promise<{ totalUsers: number; usersThisWeek: number }>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<{ user: User; isNew: boolean }> {
    const now = new Date();

    if (userData.email) {
      const [existingByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));

      if (existingByEmail && existingByEmail.id !== userData.id) {
        const [updated] = await db
          .update(users)
          .set({
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: now,
            lastLoginAt: now,
          })
          .where(eq(users.email, userData.email))
          .returning();
        return { user: updated, isNew: false };
      }
    }

    const existing = await db.select().from(users).where(eq(users.id, userData.id));
    const isNew = existing.length === 0;

    const [user] = await db
      .insert(users)
      .values({ ...userData, lastLoginAt: now })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: now,
          lastLoginAt: now,
        },
      })
      .returning();
    return { user, isNew };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.lastLoginAt));
  }

  async getUserTrafficStats(): Promise<{ totalUsers: number; usersThisWeek: number }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalResult] = await db.select({ count: count() }).from(users);
    const [weekResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastLoginAt, oneWeekAgo));

    return {
      totalUsers: totalResult.count,
      usersThisWeek: weekResult.count,
    };
  }
}

export const authStorage = new AuthStorage();
