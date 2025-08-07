import { type User, type InsertUser, type Poem, type InsertPoem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPoem(poem: InsertPoem): Promise<Poem>;
  getPoems(): Promise<Poem[]>;
  getPoemById(id: string): Promise<Poem | undefined>;
  updatePoemFavorite(id: string, isFavorite: boolean): Promise<Poem | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private poems: Map<string, Poem>;

  constructor() {
    this.users = new Map();
    this.poems = new Map();
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

  async createPoem(insertPoem: InsertPoem): Promise<Poem> {
    const id = randomUUID();
    const poem: Poem = { 
      ...insertPoem, 
      id, 
      createdAt: new Date(),
      isFavorite: insertPoem.isFavorite || false
    };
    this.poems.set(id, poem);
    return poem;
  }

  async getPoems(): Promise<Poem[]> {
    return Array.from(this.poems.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPoemById(id: string): Promise<Poem | undefined> {
    return this.poems.get(id);
  }

  async updatePoemFavorite(id: string, isFavorite: boolean): Promise<Poem | undefined> {
    const poem = this.poems.get(id);
    if (poem) {
      poem.isFavorite = isFavorite;
      this.poems.set(id, poem);
      return poem;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
