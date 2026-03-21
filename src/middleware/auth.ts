import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { errorResponse } from "../utils/response";

export const jwtPlugin = new Elysia({ name: "jwt" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
    exp: (process.env.JWT_EXPIRES_IN as any) || "7d",
  }),
);

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .use(jwtPlugin)
  .use(bearer())
  .derive({ as: "scoped" }, async ({ jwt, bearer, set }) => {
    if (!bearer) {
      set.status = 401;
      throw errorResponse("Unauthorized: No token provided", 401);
    }

    const payload = await jwt.verify(bearer);

    if (!payload) {
      set.status = 401;
      throw errorResponse("Unauthorized: Invalid or expired token", 401);
    }

    return {
      user: {
        id: Number(payload.id),
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as string,
      },
    };
  });

export const adminMiddleware = new Elysia({ name: "admin-middleware" })
  .use(authMiddleware)
  .derive({ as: "scoped" }, ({ user, set }) => {
    if (user.role !== "admin") {
      set.status = 403;
      throw errorResponse("Forbidden: Admin access required", 403);
    }
    return {};
  });
