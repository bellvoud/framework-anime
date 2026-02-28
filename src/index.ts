import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { db, checkConnection } from "./config/database";
import { rateLimit } from "./middleware/rateLimit";
import { errorResponse } from "./utils/response";

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

  // 404 handler
  .all("*", () => errorResponse("Route not found", 404))

  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
