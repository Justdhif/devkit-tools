# 🚀 Panduan Step-by-Step Deploy DevKit Monorepo ke Vercel

Dokumen ini memuat panduan lengkap untuk mendeply proyek **DevKit Monorepo** ke **Vercel** dengan konfigurasi **2 Project Terpisah (Frontend & Backend)**.

---

## 📑 Jawaban Struktur Project Vercel

> **Apakah di Vercel jadinya ada 2 project (FE dan BE)?**
> **YA!** Untuk Turborepo monorepo Next.js + NestJS, praktik terbaik (*best practice*) yang paling stabil adalah membuat **2 Project Terpisah** di Vercel Dashboard:
> 1. **`devkit-web`** (Frontend Next.js 14)
> 2. **`devkit-api`** (Backend NestJS Serverless)
> 
> **Keuntungan 2 Project:**
> - Isolation URL rapi (`https://devkit-web.vercel.app` & `https://devkit-api.vercel.app`).
> - Pengaturan Environment Variables backend (seperti database secret) terisolasi aman dari frontend.
> - Monitoring dan build log terpisah sehingga pemantauan kesalahan sangat mudah.

---

## 🛠️ Ringkasan File Konfigurasi Vercel yang Telah Disiapkan

1. `apps/api/api/index.ts` — Adapter Serverless Function NestJS untuk Vercel.
2. `apps/api/vercel.json` — Konfigurasi routing serverless backend NestJS.
3. `apps/web/vercel.json` — Konfigurasi build monorepo frontend Next.js.
4. `.vercelignore` — Pengabaian file lokal agar proses pengunggahan ringan.

---

## 📋 Langkah-Langkah Deployment (Step-by-Step)

### 📌 LANGKAH 1: Commit & Push Code ke GitHub
Pastikan seluruh perubahan file telah di-commit ke repository Git Anda:
```bash
git add .
git commit -m "feat: setup vercel deployment configuration for monorepo"
git push origin main
```

---

### 📌 LANGKAH 2: Siapkan Database Neon (Serverless PostgreSQL)
1. Buka [Neon Console](https://neon.tech) dan buat Database baru.
2. Salin string koneksi database (connection string), contoh:
   `postgresql://user:password@ep-example.pooler.aws.neon.tech/neondb?sslmode=require`
3. Push schema database dari komputer lokal Anda:
   ```bash
   # Masukkan DATABASE_URL di file .env lokal Anda terlebih dahulu, lalu jalankan:
   pnpm --filter @devkit/database db:push
   ```

---

### 📌 LANGKAH 3: Deploy Backend API NestJS (`apps/api`) ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **Add New...** ➔ **Project**.
2. Hubungkan akun GitHub Anda dan pilih repository **`devkit-tools`**.
3. Pada halaman **Configure Project**:
   - **Project Name**: `devkit-api` (atau nama pilihan Anda)
   - **Framework Preset**: Pilih **`Other`**
   - **Root Directory**: Klik *Edit*, pilih folder **`apps/api`**
4. Buka bagian **Environment Variables** dan tambahkan variabel berikut:
   | Key | Value | Contoh / Keterangan |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | URL PostgreSQL Neon Anda | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
   | `JWT_SECRET` | Secret key rahasia untuk token | `devkit_jwt_secret_key_prod_2026` |
   | `PORT` | `4000` | Optional |
   | `GITHUB_CLIENT_ID` | Client ID GitHub OAuth | Optional (jika pakai OAuth) |
   | `GITHUB_CLIENT_SECRET` | Client Secret GitHub OAuth | Optional |
   | `GOOGLE_CLIENT_ID` | Client ID Google OAuth | Optional |
   | `GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth | Optional |
5. Klik **Deploy**.
6. Setelah deployment selesai, **catat URL Vercel Backend Anda**, contoh:
   `https://devkit-api.vercel.app`

---

### 📌 LANGKAH 4: Deploy Frontend Next.js (`apps/web`) ke Vercel

1. Kembali ke [Vercel Dashboard](https://vercel.com/dashboard), klik **Add New...** ➔ **Project**.
2. Pilih kembali repository **`devkit-tools`** (Vercel mengizinkan import repo yang sama untuk project terpisah).
3. Pada halaman **Configure Project**:
   - **Project Name**: `devkit-web` (atau nama pilihan Anda)
   - **Framework Preset**: Pilih **`Next.js`**
   - **Root Directory**: Klik *Edit*, pilih folder **`apps/web`**
4. Buka bagian **Environment Variables** dan tambahkan variabel berikut:
   | Key | Value | Keterangan |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://devkit-api.vercel.app/api` | **Wajib**: Ganti `https://devkit-api.vercel.app` dengan URL Backend dari Langkah 3 |
   | `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub Client ID | Optional |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Client ID | Optional |
5. Klik **Deploy**.

---

### 📌 LANGKAH 5: Pengujian & Verifikasi

1. Buka URL Frontend Anda, contoh: `https://devkit-web.vercel.app`.
2. Tes fitur lokal (JSON Formatter, JWT Inspector, Hash Generator, Regex Tester).
3. Tes membuat akun / Login dan simpan favorit ke Cloud (Neon DB).

---

## 💡 Troubleshooting & Tips

- **Next.js transpilePackages**: `apps/web/next.config.js` sudah disetting dengan `transpilePackages` untuk package lokal (`@devkit/shared`, `@devkit/tool-core`, dll.) sehingga Vercel akan otomatis mengompilasi package monorepo tanpa error.
- **Update Backend URL**: Jika URL Vercel backend berubah, cukup ubah variabel `NEXT_PUBLIC_API_URL` di Project `devkit-web` pada Vercel Dashboard ➔ Settings ➔ Environment Variables, lalu klik *Redeploy*.
