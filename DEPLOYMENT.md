# 🚀 Panduan Step-by-Step Deploy DevKit Monorepo ke Vercel

Dokumen ini memuat panduan lengkap untuk mendeply proyek **DevKit Monorepo** ke **Vercel** dengan konfigurasi **2 Project Terpisah (Frontend & Backend)**.

---

## 📑 Solusi Permanen Error Serverless Monorepo Bundling

Error seperti:
`Cannot find module '/var/task/database/drizzle/node_modules/drizzle-orm/pg-core/index.cjs'`
terjadi karena Vercel Serverless Function mencoba mencari modul fisik dari subpath symlink monorepo pnpm saat runtime.

**Solusi Standalone Bundling yang Telah Diterapkan:**
Kami menggunakan **`@vercel/ncc`** untuk menggabungkan (*bundle*) NestJS Backend beserta seluruh kode dari `@devkit/database`, `@devkit/tool-core`, dan `@devkit/shared` menjadi **1 single-file JavaScript mandiri** (`apps/api/api/dist/index.js`).

Dengan cara ini:
- 100% dependency lokal dan ORM ter-bundle inline ke dalam 1 file.
- Bebas dari error pembacaan symlink `node_modules` di server Vercel.
- Waktu cold start Vercel Serverless Function menjadi sangat cepat (< 100ms).

---

## 📋 Langkah-Langkah Deployment (Step-by-Step)

### 📌 LANGKAH 1: Commit & Push Code Terbaru ke GitHub
Jalankan di terminal lokal Anda:
```bash
git add .
git commit -m "fix: bundle serverless function using ncc into single standalone file"
git push origin main
```

---

### 📌 LANGKAH 2: Deploy Backend API NestJS (`apps/api`) ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan pilih Project **`devkit-api`**.
2. Masuk ke **Settings** ➔ **General**:
   - **Root Directory**: Set ke **`apps/api`**
3. Buka **Environment Variables** dan pastikan variabel backend telah terisi:
   - `DATABASE_URL` = Connection string database Neon PostgreSQL Anda.
   - `JWT_SECRET` = Secret key rahasia untuk token JWT session.
4. Masuk ke menu **Deployments** ➔ Klik **`...`** di kanan atas deployment terbaru ➔ pilih **Redeploy** (centang *"Clear Cache and Deploy"*).
5. Vercel akan otomatis menjalankan script `"vercel-build"` dan mendeply file bundel standalone (`api/dist/index.js`).
6. Catat URL Vercel Backend Anda (contoh: `https://devkit-api.vercel.app`).

---

### 📌 LANGKAH 3: Deploy Frontend Next.js (`apps/web`) ke Vercel

1. Buka Project **`devkit-web`** di Vercel Dashboard.
2. Masuk ke **Settings** ➔ **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://devkit-api.vercel.app/api` *(Salin URL Backend dari Langkah 2 + akhiran `/api`)*
3. Klik **Redeploy**.
