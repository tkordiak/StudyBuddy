import { type User, type InsertUser, type Generation, type InsertGeneration, type Upload, type InsertUpload, type MagicLink } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
  
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  getGeneration(id: string): Promise<Generation | undefined>;
  getGenerationsByUserId(userId: string, limit?: number): Promise<Generation[]>;
  
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUploadsByUserId(userId: string): Promise<Upload[]>;
  
  createMagicLink(email: string, token: string, expiresAt: Date): Promise<MagicLink>;
  getMagicLinkByToken(token: string): Promise<MagicLink | undefined>;
  markMagicLinkUsed(token: string): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private generations: Map<string, Generation>;
  private uploads: Map<string, Upload>;
  private magicLinks: Map<string, MagicLink>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.generations = new Map();
    this.uploads = new Map();
    this.magicLinks = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      credits: 10,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, credits };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { 
      ...user, 
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || user.stripeSubscriptionId,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createGeneration(generation: InsertGeneration): Promise<Generation> {
    const id = randomUUID();
    const newGeneration: Generation = {
      ...generation,
      id,
      createdAt: new Date(),
    };
    this.generations.set(id, newGeneration);
    return newGeneration;
  }

  async getGeneration(id: string): Promise<Generation | undefined> {
    return this.generations.get(id);
  }

  async getGenerationsByUserId(userId: string, limit = 20): Promise<Generation[]> {
    return Array.from(this.generations.values())
      .filter((gen) => gen.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const id = randomUUID();
    const newUpload: Upload = {
      ...upload,
      id,
      createdAt: new Date(),
    };
    this.uploads.set(id, newUpload);
    return newUpload;
  }

  async getUploadsByUserId(userId: string): Promise<Upload[]> {
    return Array.from(this.uploads.values())
      .filter((upload) => upload.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createMagicLink(email: string, token: string, expiresAt: Date): Promise<MagicLink> {
    const id = randomUUID();
    const magicLink: MagicLink = {
      id,
      email,
      token,
      expiresAt,
      used: false,
      createdAt: new Date(),
    };
    this.magicLinks.set(token, magicLink);
    return magicLink;
  }

  async getMagicLinkByToken(token: string): Promise<MagicLink | undefined> {
    return this.magicLinks.get(token);
  }

  async markMagicLinkUsed(token: string): Promise<void> {
    const magicLink = this.magicLinks.get(token);
    if (magicLink) {
      this.magicLinks.set(token, { ...magicLink, used: true });
    }
  }
}

export const storage = new MemStorage();
