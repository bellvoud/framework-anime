import Elysia, { t } from "elysia";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { userService } from "../services/user.service";
import { successResponse, errorResponse } from "../utils/response";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authMiddleware)

  // GET /users — admin only
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 10, 100);
        const result = await userService.findAll({
          page,
          limit,
          search: query.search,
        });
        return successResponse(result, "Users fetched successfully");
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
        tags: ["Users"],
        summary: "Get all users (Admin only)",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // GET /users/:id
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const user = await userService.findById(Number(params.id));
        return successResponse(user, "User fetched successfully");
      } catch (err: any) {
        set.status = 404;
        return errorResponse(err.message, 404);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // PATCH /users/:id
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      try {
        const updated = await userService.update(
          Number(params.id),
          body,
          user.id,
          user.role,
        );
        return successResponse(updated, "User updated successfully");
      } catch (err: any) {
        const status =
          err.message === "Forbidden" ||
          err.message.startsWith("Forbidden")
            ? 403
            : err.message === "User not found"
              ? 404
              : 400;
        set.status = status;
        return errorResponse(err.message, status);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
        email: t.Optional(t.String({ format: "email" })),
        password: t.Optional(t.String({ minLength: 6 })),
        role: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Users"],
        summary: "Update user (own or admin)",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // PATCH /users/:id/toggle-active — admin only
  .patch(
    "/:id/toggle-active",
    async ({ params, user, set }) => {
      try {
        if (user.role !== "admin") {
          set.status = 403;
          return errorResponse("Forbidden: Admin only", 403);
        }
        const result = await userService.toggleActive(Number(params.id));
        return successResponse(
          result,
          `User ${result.isActive ? "activated" : "deactivated"} successfully`,
        );
      } catch (err: any) {
        set.status = 404;
        return errorResponse(err.message, 404);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Users"],
        summary: "Toggle user active status (Admin only)",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // DELETE /users/:id — admin only
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      try {
        if (user.role !== "admin") {
          set.status = 403;
          return errorResponse("Forbidden: Admin only", 403);
        }
        await userService.delete(Number(params.id));
        return successResponse(null, "User deleted successfully");
      } catch (err: any) {
        set.status = 404;
        return errorResponse(err.message, 404);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Users"],
        summary: "Delete user (Admin only)",
        security: [{ bearerAuth: [] }],
      },
    },
  );
