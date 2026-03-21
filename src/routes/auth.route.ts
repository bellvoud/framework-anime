import Elysia, { t } from "elysia";
import { jwtPlugin } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";
import { authService } from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/response";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)

  // POST /auth/register
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await authService.register(body);
        set.status = 201;
        return successResponse(user, "User registered successfully");
      } catch (err: any) {
        set.status = 400;
        return errorResponse(err.message, 400);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        name: t.String({ minLength: 2 }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Register a new user",
      },
    },
  )

  // POST /auth/login
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const user = await authService.login(body);

        const token = await jwt.sign({
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        });

        return successResponse({ token, user }, "Login successful");
      } catch (err: any) {
        set.status = 401;
        return errorResponse(err.message, 401);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Login with email and password",
      },
    },
  )

  // GET /auth/me — protected
  .use(authMiddleware)
  .get(
    "/me",
    async ({ user, set }) => {
      try {
        const profile = await authService.me(user.id);
        return successResponse(profile, "Profile fetched successfully");
      } catch (err: any) {
        set.status = 404;
        return errorResponse(err.message, 404);
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
      },
    },
  );
