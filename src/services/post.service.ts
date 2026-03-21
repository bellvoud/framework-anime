import { eq, ilike, count, and, desc } from "drizzle-orm";
import { db } from "../config/database";
import { posts, users } from "../models/schema";

export const postService = {
  async findAll(query: {
    page: number;
    limit: number;
    search?: string;
    published?: boolean;
    authorId?: number;
  }) {
    const { page, limit, search, published, authorId } = query;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (search) conditions.push(ilike(posts.title, `%${search}%`));
    if (published !== undefined) conditions.push(eq(posts.published, published));
    if (authorId) conditions.push(eq(posts.authorId, authorId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [total] = await db
      .select({ count: count() })
      .from(posts)
      .where(whereClause);

    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(posts.createdAt));

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
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) throw new Error("Post not found");
    return post;
  },

  async create(data: {
    title: string;
    content: string;
    published?: boolean;
    authorId: number;
  }) {
    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        content: data.content,
        published: data.published ?? false,
        authorId: data.authorId,
      })
      .returning();

    return this.findById(post.id);
  },

  async update(
    id: number,
    data: { title?: string; content?: string; published?: boolean },
    requesterId: number,
    requesterRole: string,
  ) {
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existing) throw new Error("Post not found");

    // only the author or admin can update
    if (requesterRole !== "admin" && existing.authorId !== requesterId) {
      throw new Error("Forbidden: You can only edit your own posts");
    }

    const updateData: Partial<typeof posts.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.published !== undefined) updateData.published = data.published;

    await db.update(posts).set(updateData).where(eq(posts.id, id));
    return this.findById(id);
  },

  async delete(id: number, requesterId: number, requesterRole: string) {
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existing) throw new Error("Post not found");

    if (requesterRole !== "admin" && existing.authorId !== requesterId) {
      throw new Error("Forbidden: You can only delete your own posts");
    }

    await db.delete(posts).where(eq(posts.id, id));
    return true;
  },
};
