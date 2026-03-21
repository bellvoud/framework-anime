import Elysia, { t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { postService } from "../services/post.service";
import { successResponse, errorResponse } from "../utils/response";

export const postRoutes = new Elysia({ prefix: "/posts" })

  // GET /posts — public (only published unless ?all=true for admin)
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 10, 100);
        const result = await postService.findAll({
          page,
          limit,
          search: query.search,
          published: query.all === "true" ? undefined : true,
          authorId: query.authorId ? Number(query.authorId) : undefined,
        });
        return successResponse(result, "Posts fetched successfully");
      } catch (err: any) {
        set.status = 500;
        return errorResponse(err.message, 500);
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        all: t.Optional(t.String()),
        authorId: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Posts"],
        summary: "Get all published posts (public)",
      },
    },
  )

  // GET /posts/:id — public
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const post = await postService.findById(Number(params.id));
        if (!post.published) {
          set.status = 404;
          return errorResponse("Post not found", 404);
        }
        return successResponse(post, "Post fetched successfully");
      } catch (err: any) {
        set.status = 404;
        return errorResponse(err.message, 404);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Posts"],
        summary: "Get post by ID (public)",
      },
    },
  )

  // Below routes require auth
  .use(authMiddleware)

  // POST /posts — create (authenticated)
  .post(
    "/",
    async ({ body, user, set }) => {
      try {
        const post = await postService.create({
          ...body,
          authorId: user.id,
        });
        set.status = 201;
        return successResponse(post, "Post created successfully");
      } catch (err: any) {
        set.status = 400;
        return errorResponse(err.message, 400);
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 3 }),
        content: t.String({ minLength: 1 }),
        published: t.Optional(t.Boolean()),
      }),
      detail: {
        tags: ["Posts"],
        summary: "Create a new post",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // GET /posts/my — get own posts (including drafts)
  .get(
    "/my",
    async ({ user, query, set }) => {
      try {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 10, 100);
        const result = await postService.findAll({
          page,
          limit,
          search: query.search,
          authorId: user.id,
        });
        return successResponse(result, "Your posts fetched successfully");
      } catch (err: any) {
        set.status = 500;
        return errorResponse(err.message, 500);
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Posts"],
        summary: "Get current user's own posts (including drafts)",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // PATCH /posts/:id — update (author or admin)
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      try {
        const post = await postService.update(
          Number(params.id),
          body,
          user.id,
          user.role,
        );
        return successResponse(post, "Post updated successfully");
      } catch (err: any) {
        const status = err.message.startsWith("Forbidden")
          ? 403
          : err.message === "Post not found"
            ? 404
            : 400;
        set.status = status;
        return errorResponse(err.message, status);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 3 })),
        content: t.Optional(t.String({ minLength: 1 })),
        published: t.Optional(t.Boolean()),
      }),
      detail: {
        tags: ["Posts"],
        summary: "Update a post (author or admin)",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // DELETE /posts/:id — delete (author or admin)
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      try {
        await postService.delete(Number(params.id), user.id, user.role);
        return successResponse(null, "Post deleted successfully");
      } catch (err: any) {
        const status = err.message.startsWith("Forbidden")
          ? 403
          : err.message === "Post not found"
            ? 404
            : 400;
        set.status = status;
        return errorResponse(err.message, status);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Posts"],
        summary: "Delete a post (author or admin)",
        security: [{ bearerAuth: [] }],
      },
    },
  );
