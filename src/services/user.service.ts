import { eq, ilike, count, and, ne } from "drizzle-orm";
import { db } from "../config/database";
import { users, posts } from "../models/schema";
import { hashPassword } from "../utils/hash";

export const userService = {
  async findAll(query: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const conditions = search ? ilike(users.name, `%${search}%`) : undefined;

    const [total] = await db
      .select({ count: count() })
      .from(users)
      .where(conditions);

    const rows = await db
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
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    return {
      data: rows,
      meta: {
        total: Number(total.count),
        page,
        limit,
        totalPages: Math.ceil(Number(total.count) / limit),
      },
    };
  },

  async findById(id: number) {
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
      .where(eq(users.id, id))
      .limit(1);

    if (!user) throw new Error("User not found");
    return user;
  },

  async update(
    id: number,
    data: { name?: string; email?: string; password?: string; role?: string },
    requesterId: number,
    requesterRole: string,
  ) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) throw new Error("User not found");

    // only admin or the user itself can update
    if (requesterRole !== "admin" && requesterId !== id) {
      throw new Error("Forbidden");
    }

    // only admin can change role
    if (data.role && requesterRole !== "admin") {
      throw new Error("Forbidden: Only admin can change role");
    }

    // check email uniqueness if changing email
    if (data.email && data.email !== existing.email) {
      const [conflict] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, data.email), ne(users.id, id)))
        .limit(1);
      if (conflict) throw new Error("Email already in use");
    }

    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = hashPassword(data.password);
    if (data.role && requesterRole === "admin") updateData.role = data.role;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      });

    return updated;
  },

  async toggleActive(id: number) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) throw new Error("User not found");

    const [updated] = await db
      .update(users)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        isActive: users.isActive,
      });

    return updated;
  },

  async delete(id: number) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) throw new Error("User not found");

    await db.delete(posts).where(eq(posts.authorId, id));
    await db.delete(users).where(eq(users.id, id));

    return true;
  },
};
