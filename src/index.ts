import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { checkConnection } from "./config/database";
import { rateLimit } from "./middleware/rateLimit";
import { errorResponse } from "./utils/response";
import { authRoutes } from "./routes/auth.route";
import { userRoutes } from "./routes/user.route";
import { postRoutes } from "./routes/post.route";

const app = new Elysia()
  // middleware
  .use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? ["https://127.0.0.1:3000"]
          : "*",
      credentials: true,
    }),
  )
  .use(rateLimit(100, 60000)) // 100 requests per minute

  // health check
  .get("/health", async () => {
    const dbHealthy = await checkConnection();
    return {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  })

  // routes
  .use(authRoutes)
  .use(userRoutes)
  .use(postRoutes)

  // 404 handler
  .all("*", () => errorResponse("Route not found", 404))

  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(`📄 Routes:`);
console.log(`   POST   /auth/register`);
console.log(`   POST   /auth/login`);
console.log(`   GET    /auth/me`);
console.log(`   GET    /users`);
console.log(`   GET    /users/:id`);
console.log(`   PATCH  /users/:id`);
console.log(`   PATCH  /users/:id/toggle-active`);
console.log(`   DELETE /users/:id`);
console.log(`   GET    /posts`);
console.log(`   GET    /posts/my`);
console.log(`   GET    /posts/:id`);
console.log(`   POST   /posts`);
console.log(`   PATCH  /posts/:id`);
console.log(`   DELETE /posts/:id`);

export type App = typeof app;
