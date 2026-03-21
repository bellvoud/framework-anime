<div align="center">

# 🦊 Elysia-API

**REST API modern yang dibangun dengan ElysiaJS, Drizzle ORM, dan PostgreSQL (Supabase)**

[![Bun](https://img.shields.io/badge/Bun-1.x-black?style=for-the-badge&logo=bun)](https://bun.sh)
[![ElysiaJS](https://img.shields.io/badge/ElysiaJS-1.4-purple?style=for-the-badge)](https://elysiajs.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green?style=for-the-badge)](https://orm.drizzle.team)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)

</div>

---

## 📖 Deskripsi

**Elysia-API** adalah REST API untuk platform blog yang dibangun di atas [Bun](https://bun.sh) runtime menggunakan framework [ElysiaJS](https://elysiajs.com). API ini mendukung manajemen pengguna dan artikel dengan sistem autentikasi berbasis JWT, kontrol akses berbasis peran (RBAC), serta rate limiting untuk keamanan.

### ✨ Fitur Utama

- 🔐 **Autentikasi JWT** — Register, Login, dan profil terproteksi
- 👥 **Manajemen User** — CRUD lengkap dengan kontrol berbasis role (`user` / `admin`)
- 📝 **Manajemen Post** — Buat, edit, publikasikan, dan hapus artikel
- 🛡️ **Rate Limiting** — Proteksi dari request berlebihan (100 req/menit)
- 🌐 **CORS Support** — Konfigurasi CORS fleksibel untuk dev dan production
- ⚡ **Type-Safe** — Validasi request body & query params menggunakan skema Elysia `t`
- 🗄️ **Drizzle ORM** — Query SQL yang bersih dan type-safe
- 📊 **Health Check** — Endpoint pemantauan status server dan database

---

## 🗂️ Struktur Proyek

```
elysia-api/
├── src/
│   ├── config/
│   │   ├── database.ts       # Koneksi database PostgreSQL
│   │   └── seed.ts           # Script seed data awal
│   ├── middleware/
│   │   ├── auth.ts           # JWT plugin, authMiddleware, adminMiddleware
│   │   └── rateLimit.ts      # Rate limiter berbasis IP
│   ├── models/
│   │   └── schema.ts         # Skema tabel Drizzle ORM (users & posts)
│   ├── routes/
│   │   ├── auth.route.ts     # Endpoint /auth
│   │   ├── user.route.ts     # Endpoint /users
│   │   └── post.route.ts     # Endpoint /posts
│   ├── services/
│   │   ├── auth.service.ts   # Logika bisnis autentikasi
│   │   ├── user.service.ts   # Logika bisnis user
│   │   └── post.service.ts   # Logika bisnis post
│   ├── utils/
│   │   ├── hash.ts           # Fungsi hash & verifikasi password
│   │   └── response.ts       # Format respons JSON standar
│   └── index.ts              # Entry point aplikasi
├── drizzle/                  # Folder output migrasi database
├── drizzle.config.ts         # Konfigurasi Drizzle Kit
├── .env.example              # Template environment variable
├── package.json
└── tsconfig.json
```

---

## 🚀 Memulai (Quick Start)

### Prasyarat

Pastikan kamu sudah menginstal:

- **[Bun](https://bun.sh)** `>= 1.0` — Runtime JavaScript
- **PostgreSQL** — Database lokal atau gunakan **[Supabase](https://supabase.com)** (cloud)

### 1. Clone & Install Dependensi

```bash
git clone <url-repository>
cd elysia-api
bun install
```

### 2. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` lalu sesuaikan nilainya:

```bash
cp .env.example .env
```

```env
# Database Lokal
DATABASE_URL=postgresql://username:password@localhost:5432/elysia_db

# Database Online (Supabase)
# DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

> **⚠️ Penting:** Ganti `JWT_SECRET` dengan string acak yang kuat (minimal 32 karakter) sebelum deploy ke production.

### 3. Setup Database

Jalankan migrasi untuk membuat tabel di database:

```bash
# Buat file migrasi
bun run db:generate

# Terapkan migrasi ke database
bun run db:migrate
```

### 4. (Opsional) Seed Data Awal

Isi database dengan data contoh (3 user + 5 post):

```bash
bun run seed
```

Data yang akan dibuat:

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | `admin@example.com`    | `admin123` |
| User  | `budi@example.com`     | `budi123`  |
| User  | `siti@example.com`     | `siti123`  |

### 5. Jalankan Server

```bash
bun run dev
```

Server berjalan di `http://localhost:3000` 🎉

---

## 📡 API Reference

### Base URL

```
http://localhost:3000
```

### Format Respons

Semua endpoint mengembalikan format JSON yang konsisten:

**Success:**
```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": { ... },
  "timestamp": "2026-03-21T14:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Pesan error",
  "code": 400,
  "timestamp": "2026-03-21T14:00:00.000Z"
}
```

---

### 🔍 Health Check

| Method | Endpoint  | Auth | Deskripsi                       |
|--------|-----------|------|---------------------------------|
| `GET`  | `/health` | ❌   | Cek status server dan database  |

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-21T14:00:00.000Z",
  "uptime": 123.45
}
```

---

### 🔐 Auth

| Method | Endpoint         | Auth | Deskripsi                       |
|--------|------------------|------|---------------------------------|
| `POST` | `/auth/register` | ❌   | Daftarkan akun baru             |
| `POST` | `/auth/login`    | ❌   | Login dan dapatkan JWT token    |
| `GET`  | `/auth/me`       | ✅   | Lihat profil pengguna aktif     |

#### POST `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "rahasia123",
  "name": "Nama Lengkap"
}
```

| Field      | Tipe     | Wajib | Keterangan                   |
|------------|----------|-------|------------------------------|
| `email`    | `string` | ✅    | Format email yang valid      |
| `password` | `string` | ✅    | Minimal 6 karakter           |
| `name`     | `string` | ✅    | Minimal 2 karakter           |

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nama Lengkap",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-03-21T14:00:00.000Z"
  }
}
```

---

#### POST `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "rahasia123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nama Lengkap",
      "role": "user"
    }
  }
}
```

> Simpan nilai `token` dan sertakan di header `Authorization: Bearer <token>` untuk mengakses endpoint yang dilindungi.

---

#### GET `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nama Lengkap",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-03-21T14:00:00.000Z",
    "updatedAt": "2026-03-21T14:00:00.000Z"
  }
}
```

---

### 👥 Users

> Semua endpoint `/users` memerlukan autentikasi.

| Method   | Endpoint                    | Role       | Deskripsi                          |
|----------|-----------------------------|------------|------------------------------------|
| `GET`    | `/users`                    | Admin      | Daftar semua pengguna (paginasi)   |
| `GET`    | `/users/:id`                | Any        | Detail pengguna berdasarkan ID     |
| `PATCH`  | `/users/:id`                | Owner/Admin| Update data pengguna               |
| `PATCH`  | `/users/:id/toggle-active`  | Admin      | Aktifkan / nonaktifkan akun        |
| `DELETE` | `/users/:id`                | Admin      | Hapus pengguna                     |

#### GET `/users`

**Query Params:**

| Parameter | Tipe     | Default | Keterangan                      |
|-----------|----------|---------|---------------------------------|
| `page`    | `number` | `1`     | Halaman yang ditampilkan        |
| `limit`   | `number` | `10`    | Jumlah data per halaman (max 100)|
| `search`  | `string` | -       | Cari berdasarkan nama atau email |

**Contoh:** `GET /users?page=1&limit=5&search=budi`

---

#### PATCH `/users/:id`

**Request Body** (semua opsional):
```json
{
  "name": "Nama Baru",
  "email": "emailbaru@example.com",
  "password": "passwordBaru123",
  "role": "admin"
}
```

> **Catatan:** Pengguna biasa hanya bisa mengubah data miliknya sendiri. Admin bisa mengubah siapa saja dan mengubah `role`.

---

### 📝 Posts

| Method   | Endpoint     | Auth | Deskripsi                                         |
|----------|--------------|------|---------------------------------------------------|
| `GET`    | `/posts`     | ❌   | Daftar post yang sudah dipublikasikan (publik)    |
| `GET`    | `/posts/:id` | ❌   | Detail post yang sudah dipublikasikan             |
| `GET`    | `/posts/my`  | ✅   | Semua post milik user aktif (termasuk draft)      |
| `POST`   | `/posts`     | ✅   | Buat post baru                                    |
| `PATCH`  | `/posts/:id` | ✅   | Update post (penulis atau admin)                  |
| `DELETE` | `/posts/:id` | ✅   | Hapus post (penulis atau admin)                   |

#### GET `/posts`

**Query Params:**

| Parameter  | Tipe      | Default | Keterangan                                  |
|------------|-----------|---------|---------------------------------------------|
| `page`     | `number`  | `1`     | Halaman yang ditampilkan                    |
| `limit`    | `number`  | `10`    | Jumlah post per halaman (max 100)           |
| `search`   | `string`  | -       | Cari berdasarkan judul                      |
| `all`      | `"true"`  | -       | Tampilkan semua post termasuk draft (admin) |
| `authorId` | `number`  | -       | Filter post berdasarkan ID penulis          |

---

#### POST `/posts`

**Request Body:**
```json
{
  "title": "Judul Artikel Saya",
  "content": "Isi konten artikel yang panjang...",
  "published": true
}
```

| Field       | Tipe      | Wajib | Keterangan                         |
|-------------|-----------|-------|------------------------------------|
| `title`     | `string`  | ✅    | Minimal 3 karakter                 |
| `content`   | `string`  | ✅    | Minimal 1 karakter                 |
| `published` | `boolean` | ❌    | Default `false` (tersimpan sebagai draft) |

---

#### PATCH `/posts/:id`

**Request Body** (semua opsional):
```json
{
  "title": "Judul Baru",
  "content": "Konten yang diperbarui...",
  "published": true
}
```

> **Catatan:** Hanya penulis post atau admin yang dapat mengubah dan menghapus post.

---

## 🗄️ Database Schema

### Tabel `users`

| Kolom        | Tipe          | Keterangan                        |
|--------------|---------------|-----------------------------------|
| `id`         | `serial`      | Primary key, auto-increment       |
| `email`      | `varchar(255)`| Unik, wajib diisi                 |
| `password`   | `varchar(255)`| Hash SHA-256 dengan salt          |
| `name`       | `varchar(100)`| Nama lengkap                      |
| `role`       | `varchar(20)` | `user` (default) atau `admin`     |
| `is_active`  | `boolean`     | Status akun, default `true`       |
| `created_at` | `timestamp`   | Waktu pembuatan, auto-generated   |
| `updated_at` | `timestamp`   | Waktu terakhir diubah             |

### Tabel `posts`

| Kolom        | Tipe          | Keterangan                        |
|--------------|---------------|-----------------------------------|
| `id`         | `serial`      | Primary key, auto-increment       |
| `title`      | `varchar(255)`| Judul artikel                     |
| `content`    | `text`        | Isi artikel                       |
| `published`  | `boolean`     | Status publikasi, default `false` |
| `author_id`  | `integer`     | Foreign key ke `users.id`         |
| `created_at` | `timestamp`   | Waktu pembuatan                   |
| `updated_at` | `timestamp`   | Waktu terakhir diubah             |

---

## 🛠️ Scripts

| Perintah              | Deskripsi                                         |
|-----------------------|---------------------------------------------------|
| `bun run dev`         | Jalankan server development (hot-reload)          |
| `bun run db:generate` | Generate file migrasi dari perubahan schema       |
| `bun run db:migrate`  | Terapkan migrasi ke database                      |
| `bun run db:push`     | Push schema langsung ke database (tanpa migrasi)  |
| `bun run db:studio`   | Buka Drizzle Studio (GUI database browser)        |
| `bun run seed`        | Isi database dengan data contoh                   |

---

## 🔒 Keamanan

### Autentikasi (JWT)

- Token JWT dikirim melalui header `Authorization: Bearer <token>`
- Masa berlaku token dikonfigurasi via `JWT_EXPIRES_IN` (default: `7d`)
- Token memuat: `id`, `email`, `name`, `role`

### Password Hashing

Password di-hash menggunakan SHA-256 dengan **random salt** (16 byte) sebelum disimpan ke database. Format penyimpanan: `salt:hash`.

### Rate Limiting

- Batas: **100 request per menit** per IP address
- Response `429 Too Many Requests` jika melebihi batas
- > **Catatan untuk Production:** Gunakan Redis sebagai penyimpanan rate limit agar stateless dan dapat di-scale.

### CORS

- **Development:** Mengizinkan semua origin (`*`)
- **Production:** Hanya mengizinkan origin yang terdaftar (konfigurasi di `src/index.ts`)

---

## ⚠️ Kode Status HTTP

| Kode | Keterangan                                    |
|------|-----------------------------------------------|
| 200  | OK — Request berhasil                         |
| 201  | Created — Resource berhasil dibuat            |
| 400  | Bad Request — Input tidak valid               |
| 401  | Unauthorized — Token tidak ada atau tidak valid |
| 403  | Forbidden — Tidak punya izin                  |
| 404  | Not Found — Resource tidak ditemukan          |
| 429  | Too Many Requests — Rate limit terlampaui     |
| 500  | Internal Server Error — Kesalahan server      |

---

## 🧰 Tech Stack

| Teknologi     | Versi   | Kegunaan                            |
|---------------|---------|-------------------------------------|
| **Bun**       | 1.x     | Runtime JavaScript & package manager |
| **ElysiaJS**  | 1.4.x   | Web framework                        |
| **Drizzle ORM** | 0.45.x | ORM & query builder type-safe      |
| **PostgreSQL** | -      | Database relasional                  |
| **Supabase**  | -       | PostgreSQL cloud (opsional)          |
| **TypeScript** | 5.x    | Bahasa pemrograman                   |
| `@elysiajs/jwt` | 1.4.x | Plugin JWT                          |
| `@elysiajs/bearer` | 1.4.x | Plugin Bearer token              |
| `@elysiajs/cors` | 1.4.x | Plugin CORS                       |

---

## 📄 Lisensi

Project ini bersifat **private**. Seluruh hak cipta dilindungi.

---

<div align="center">
  Dibuat dengan ❤️ menggunakan <a href="https://elysiajs.com">ElysiaJS</a> & <a href="https://bun.sh">Bun</a>
</div>