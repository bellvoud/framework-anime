import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../models/schema";

// Encode password in URL to handle special characters (e.g. @, #, %)
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  try {
    // Test if URL parses fine as-is
    new URL(url);
    return url;
  } catch {
    // If it fails, try to encode the password portion
    const match = url.match(
      /^(postgresql|postgres):\/\/([^:]+):(.+)@(.+)$/,
    );
    if (!match) throw new Error("Invalid DATABASE_URL format");
    const [, protocol, user, password, rest] = match;
    const encodedPassword = encodeURIComponent(password);
    return `${protocol}://${user}:${encodedPassword}@${rest}`;
  }
};

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

// health check
export const checkConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("db connected 🚀:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("db failed connect:", error);
    return false;
  }
};
