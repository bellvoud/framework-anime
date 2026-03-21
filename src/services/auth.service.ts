import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users } from "../models/schema";
import { hashPassword, verifyPassword } from "../utils/hash";

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    // Check existing email
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Email already registered");
    }

    const hashed = hashPassword(data.password);

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashed,
        name: data.name,
        role: data.role ?? "user",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    return user;
  },

  async login(data: { email: string; password: string }) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isValid = verifyPassword(data.password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },

  async me(userId: number) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
};
