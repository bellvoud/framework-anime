import { db } from "./database";
import { users, posts } from "../models/schema";
import { hashPassword } from "../utils/hash";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Menjalankan seed...\n");

  // ──────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────
  console.log("👤 Seeding users...");

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@example.com",
      password: hashPassword("admin123"),
      name: "Admin User",
      role: "admin",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: "Admin User",
        role: "admin",
        updatedAt: new Date(),
      },
    })
    .returning();

  const [author1] = await db
    .insert(users)
    .values({
      email: "budi@example.com",
      password: hashPassword("budi123"),
      name: "Budi Santoso",
      role: "user",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { name: "Budi Santoso", updatedAt: new Date() },
    })
    .returning();

  const [author2] = await db
    .insert(users)
    .values({
      email: "siti@example.com",
      password: hashPassword("siti123"),
      name: "Siti Rahayu",
      role: "user",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { name: "Siti Rahayu", updatedAt: new Date() },
    })
    .returning();

  console.log(`   ✅ Admin: ${admin.email}`);
  console.log(`   ✅ User 1: ${author1.email}`);
  console.log(`   ✅ User 2: ${author2.email}\n`);

  // ──────────────────────────────────────────
  // POSTS
  // ──────────────────────────────────────────
  console.log("📝 Seeding posts...");

  await db.insert(posts).values([
    {
      title: "Memulai dengan Elysia.js",
      content:
        "Elysia.js adalah framework web modern yang berjalan di atas Bun runtime. " +
        "Framework ini dikenal dengan performanya yang sangat cepat dan type-safety yang ketat. " +
        "Dalam artikel ini, kita akan belajar cara membangun REST API sederhana menggunakan Elysia.js.",
      published: true,
      authorId: author1.id,
    },
    {
      title: "Drizzle ORM: Query TypeSafe untuk Database",
      content:
        "Drizzle ORM adalah ORM TypeScript yang ringan dan type-safe. " +
        "Berbeda dengan ORM lain, Drizzle menghasilkan query SQL yang bersih dan efisien. " +
        "Kita akan membahas cara menggunakannya bersama PostgreSQL dan Supabase.",
      published: true,
      authorId: author1.id,
    },
    {
      title: "Menggunakan Supabase sebagai Backend-as-a-Service",
      content:
        "Supabase adalah alternatif open-source untuk Firebase yang menyediakan " +
        "database PostgreSQL, authentication, storage, dan realtime subscriptions. " +
        "Artikel ini membahas cara menghubungkan Supabase dengan aplikasi Elysia.js.",
      published: true,
      authorId: author2.id,
    },
    {
      title: "Draft: Tips Optimasi Performa API",
      content:
        "Artikel ini masih dalam tahap penulisan. Akan membahas berbagai teknik " +
        "untuk mengoptimalkan performa REST API seperti caching, pagination, dan indexing database.",
      published: false,
      authorId: author2.id,
    },
    {
      title: "Autentikasi JWT dengan Elysia.js",
      content:
        "JSON Web Token (JWT) adalah standar industri untuk autentikasi stateless. " +
        "Dalam tutorial ini, kita akan mengimplementasikan sistem login dan register " +
        "lengkap dengan JWT menggunakan @elysiajs/jwt plugin.",
      published: true,
      authorId: admin.id,
    },
  ]);

  console.log("   ✅ 5 posts berhasil ditambahkan (4 published, 1 draft)\n");

  // ──────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Seed berhasil!\n");
  console.log("📋 Akun yang tersedia untuk login:");
  console.log("   Admin  → email: admin@example.com  | password: admin123");
  console.log("   User 1 → email: budi@example.com   | password: budi123");
  console.log("   User 2 → email: siti@example.com   | password: siti123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err.message);
  process.exit(1);
});