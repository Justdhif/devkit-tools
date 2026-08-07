<div align="center">

# 🛠️ DevKit — Developer Productivity Platform

**An All-in-One, Privacy-First Utility Hub for Modern Software Engineers**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon_DB-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.30-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)

---

</div>

## 📌 Overview

**DevKit** is an enterprise-grade developer productivity platform engineered to eliminate context switching and streamline everyday engineering workflows. Designed with a strict **Privacy-First Architecture**, DevKit processes sensitive code payloads, cryptographic hashes, and JSON Web Tokens directly on the client side—guaranteeing that confidential data never leaves the developer's browser environment.

Featuring a high-performance monorepo structure, global command palette (`⌘K` / `Ctrl+K`), cloud workspace synchronization via Neon PostgreSQL, and seamless OAuth authentication, DevKit brings together modern developer utilities into a unified, dark-first user interface.

---

## ✨ Key Features & Capability Matrix

### 🔐 1. Privacy-First Client Utility Architecture
* **Zero Payloads to Cloud**: All core transformations (formatting, minification, encoding, hashing, regex matching, and JWT inspection) run 100% locally in browser memory.
* **Sensitive Token Redaction**: Secrets, private keys, and JWT bearer tokens are automatically sanitized before any optional persistence.

### 🧰 2. Comprehensive Built-In Tool Suite
| Tool Name | Category | Primary Capability |
| :--- | :--- | :--- |
| **JSON Formatter & Validator** | `JSON` | Prettify, minify, validate syntax, and sort JSON keys |
| **JSON → Code Schema Converter** | `JSON` | Convert JSON payloads to TypeScript Interfaces, Zod Schemas, Go Structs, or Python Dataclasses |
| **JWT Decoder & Inspector** | `JWT / Security` | Decode header/payload claims and verify expiration client-side |
| **Cryptographic Hash Generator** | `JWT / Security` | Calculate MD5, SHA-1, SHA-256, and SHA-512 digests |
| **UUID Generator (v4 & v7)** | `Generators` | Generate cryptographically secure bulk UUID v4 and time-ordered v7 IDs |
| **Base64 Encoder / Decoder** | `Utilities` | Fast standard and URL-safe Base64 conversion |
| **URL Encoder / Decoder** | `Utilities` | URL component encoding, decoding, and query param parsing |
| **Unix Timestamp Converter** | `Date & Color` | Instant conversion between epoch seconds/milliseconds and ISO 8601 strings |
| **Regex Tester & Visualizer** | `Regex` | Real-time regular expression testing with flags and group highlights |
| **SQL Formatter & Beautifier** | `SQL` | Prettify and clean raw SQL queries across multiple database dialects |

### ⚡ 3. Productivity & Cloud Synchronization
* **Keyboard-Driven UX**: Open the global **Command Palette** from anywhere using `⌘K` or `Ctrl+K` for instant tool switching.
* **Starred Favorites**: Bookmark your most used developer utilities; authenticated user favorites are synchronized across devices via Neon DB.
* **Personal Workspaces**: Group curated tool sets for specific backend, frontend, or DevOps projects.
* **Secure Authentication**: Supports Email & Encrypted Password login (`bcrypt`), alongside official **GitHub** and **Google OAuth** authorization integration.

---

## 🏗️ Monorepo Architecture & Technology Stack

DevKit is built as a modular monorepo managed with **`pnpm` Workspaces** and **`Turborepo`**:

```text
devkit-tools/
├── apps/
│   ├── web/                    # Next.js 14 App Router Frontend (React, Tailwind CSS, Zustand)
│   └── api/                    # NestJS Backend API (Auth, Cloud Sync, Sharing, JWT)
├── packages/
│   ├── shared/                 # Common TypeScript Types, Zod Schemas & Domain Interfaces
│   ├── tool-core/              # Core Tool Registry, Metadata Catalog & Search Engine
│   ├── json-tools/             # JSON Formatter, Minifier & Type Generators
│   ├── jwt-tools/              # JWT Decoder & Claim Inspector Logic
│   ├── crypto-tools/           # Base64, UUID v4/v7, Hashing & URL Utilities
│   ├── regex-tools/            # Regular Expression Engine & SQL Formatter
│   └── config/                 # Base TypeScript, ESLint & Prettier Configurations
└── database/
    └── drizzle/                # Neon PostgreSQL Schema, Drizzle ORM Migrations & Connection
```

### 💻 Stack Summary
* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, Zustand State Management.
* **Backend**: NestJS 10, Express, JWT Authentication, `bcryptjs`.
* **Database**: Neon Serverless PostgreSQL, Drizzle ORM, Drizzle Kit.
* **Build System**: Turborepo, TypeScript 5.4, `pnpm`.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.x` or higher
* **pnpm**: `v9.x` or higher (`npm install -g pnpm`)

### 1. Clone the Repository
```bash
git clone https://github.com/Justdhif/devkit-tools.git
cd devkit-tools
```

### 2. Install Workspace Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` at the root directory:
```bash
cp .env.example .env
```

Ensure your `.env` contains your Neon PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@ep-example.pooler.aws.neon.tech/neondb?sslmode=require"
PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
JWT_SECRET="devkit_super_secret_jwt_key"
```

### 4. Push Database Schema to Neon DB
```bash
pnpm --filter @devkit/database db:push
```

### 5. Build Workspace Packages
```bash
pnpm build
```

### 6. Run Local Development Server
```bash
pnpm dev
```

Your applications will be live at:
* **Web Client**: [`http://localhost:3000`](http://localhost:3000)
* **Backend API**: [`http://localhost:4000/api`](http://localhost:4000/api)

---

## 🧪 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development Mode** | `pnpm dev` | Starts Next.js and NestJS dev servers in parallel |
| **Production Build** | `pnpm build` | Compiles all packages and builds production bundles |
| **Typecheck** | `pnpm typecheck` | Runs `tsc --noEmit` across all 10 monorepo packages |
| **Push DB Schema** | `pnpm --filter @devkit/database db:push` | Pushes schema changes directly to Neon PostgreSQL |

---

## 🔒 Security & Privacy Contract

DevKit enforces a strict security contract:
1. **Client Isolation**: User inputs in tools like JSON Formatter, JWT Decoder, or Hash Generator are processed in browser memory and are **never** transmitted to backend logging or external telemetry.
2. **Password Encryption**: User authentication passwords are encrypted using `bcrypt` (10 rounds) before DB insertion.
3. **Session Verification**: Sessions are validated via signed JWT tokens with standard expiration guards.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for developers by developers.**

</div>
