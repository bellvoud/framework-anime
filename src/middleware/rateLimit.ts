import { Elysia } from "elysia";
import { errorResponse } from "../utils/response";

//! reminder : production use redis
const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return new Elysia().onBeforeHandle(({ request, set }) => {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    const record = requests.get(ip);

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (record.count >= maxRequests) {
      set.status = 429;
      return errorResponse("Too many requests, please try again later", 429);
    }

    record.count++;
  });
};
