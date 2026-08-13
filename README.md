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

Featuring a high-performance monorepo structure, global command palette (`⌘K` / `Ctrl+K`), cloud workspace synchronization via Neon PostgreSQL, AI-powered developer assistance via Groq, Tool Chaining Pipelines, and seamless OAuth authentication, DevKit brings together 18 modern developer utilities into a unified, dark-first user interface.

---

## ✨ Key Features & Capability Matrix

### 🔐 1. Privacy-First Client Utility Architecture
* **Zero Payloads to Cloud**: All core transformations (formatting, minification, encoding, hashing, regex matching, and JWT inspection) run 100% locally in browser memory.
* **Sensitive Token Redaction**: Secrets, private keys, and JWT bearer tokens are automatically sanitized before any optional persistence.
* **SSRF Security Proxy**: API Tester requests are routed through a controlled backend proxy to prevent Server-Side Request Forgery attacks.

### 🧰 2. Complete Tool Suite (18 Tools)

| Tool Name | Category | Primary Capability |
| :--- | :--- | :--- |
| **JSON Formatter / Validator / Minifier** | `JSON` | Prettify, minify, validate syntax, and sort JSON keys |
| **JSON → TypeScript / Zod / Struct** | `JSON` | Convert JSON to TypeScript Interfaces, Zod Schemas, Go Structs, or Python Dataclasses |
| **JWT Decoder & Inspector** | `JWT / Security` | Decode header/payload claims and verify expiration client-side |
| **Hash Generator** | `JWT / Security` | Compute MD5, SHA-1, SHA-256, and SHA-512 digests client-side |
| **UUID Generator** | `Generators` | Generate cryptographically secure bulk UUID v4 and time-ordered v7 IDs |
| **Cron Expression Builder** | `Generators` | Build, decode, and explain cron schedule expressions with human-readable output |
| **QR Code Generator** | `Generators` | Generate customizable vector QR codes from URLs or text with SVG/PNG download |
| **Base64 Encoder / Decoder** | `Utilities` | Fast standard and URL-safe Base64 conversion |
| **URL Encoder / Decoder** | `Utilities` | URL component encoding, decoding, and query param parsing |
| **Code & JSON Diff Viewer** | `Utilities` | Compare two text or JSON documents side-by-side with diff highlighting |
| **Unix Timestamp Converter** | `Date & Color` | Instant conversion between epoch seconds/milliseconds and ISO 8601 strings |
| **Color Converter & WCAG Checker** | `Date & Color` | Convert HEX, RGB, HSL, HSV, OKLCH with palette generation and contrast checking |
| **Regex Tester** | `Regex` | Real-time regular expression testing with flags and group highlights |
| **SQL Formatter & Minifier** | `SQL` | Format and beautify raw SQL queries across multiple database dialects |
| **API Tester & HTTP Client** | `API` | Test HTTP endpoints with headers, body payloads, auth, and SSRF security proxy |
| **cURL Parser & Code Generator** | `API` | Parse raw cURL commands to JS Fetch, Axios, Python Requests, Go, or PHP |
| **AI Developer Assistant** | `AI` | Contextual AI assistant for Error Explainer, Code Explainer, Regex & SQL Generator (powered by Groq) |
| **Tool Chaining & Pipeline Builder** | `Workflows` | Chain multiple tools together into automated, reusable data processing pipelines |

### ⚡ 3. Productivity & Cloud Synchronization
* **Keyboard-Driven UX**: Open the global **Command Palette** from anywhere using `⌘K` or `Ctrl+K` for instant tool switching.
* **Smart Context Detection**: Paste any content and DevKit intelligently detects the data type (JSON, JWT, URL, SQL, etc.) and recommends the relevant tools.
* **Post-Execution Recommendations**: After running a tool, DevKit suggests the next logical tool in your workflow.
* **Starred Favorites**: Bookmark your most-used tools; authenticated user favorites are synchronized across devices via Neon DB.
* **Tool History**: Execution history is persisted per user for quick access to recent tool outputs.
* **Share Tool Outputs**: Generate shareable links for tool results to collaborate with teammates.
* **Personal Workspaces**: Group curated tool sets for specific backend, frontend, or DevOps projects.
* **Secure Authentication**: Supports Email & Encrypted Password login (`bcrypt`), alongside **GitHub** and **Google OAuth** authorization.

---

## 🏗️ Monorepo Architecture & Technology Stack

DevKit is built as a modular monorepo managed with **`pnpm` Workspaces** and **`Turborepo`**:

```text
devkit-tools/
├── apps/
│   ├── web/                    # Next.js 14 App Router Frontend (React, Tailwind CSS, Zustand, Framer Motion)
│   └── api/                    # NestJS Backend API (Auth, AI, Pipelines, Sharing, History, Favorites)
├── packages/
│   ├── shared/                 # Common TypeScript Types, Zod Schemas & Domain Interfaces
│   ├── tool-core/              # Core Tool Registry, Smart Context Detection & Pipeline Engine
│   ├── json-tools/             # JSON Formatter, Minifier & Type Generators
│   ├── jwt-tools/              # JWT Decoder & Claim Inspector Logic
│   ├── crypto-tools/           # Base64, UUID v4/v7, Hashing & URL Utilities
│   ├── regex-tools/            # Regular Expression Engine & SQL Formatter
│   └── config/                 # Base TypeScript, ESLint & Prettier Configurations
```

### 💻 Stack Summary

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, Radix UI, Monaco Editor, Zustand, TanStack Query |
| **Backend** | NestJS 10, Express, JWT Authentication, `bcryptjs` |
| **AI** | Groq API (LLM inference for AI Developer Assistant) |
| **Database** | Neon Serverless PostgreSQL, Drizzle ORM |
| **Build System** | Turborepo, TypeScript 5.4, `pnpm` |
| **Deployment** | Vercel (web & API via serverless functions) |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.x` or higher
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

Fill in the required variables:
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-example.pooler.aws.neon.tech/neondb?sslmode=require"

# API Server
PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# JWT
JWT_SECRET="your_jwt_secret_here"

# OAuth (GitHub & Google)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
NEXT_PUBLIC_GITHUB_CLIENT_ID=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""

# AI (Groq)
GROQ_API_KEY=""

# Optional Redis Cache
REDIS_URL="redis://localhost:6379"
```

### 4. Build Workspace Packages
```bash
pnpm build
```

### 5. Run Local Development Server
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
| **Development Mode** | `pnpm dev` | Starts Next.js and NestJS dev servers in parallel via Turborepo |
| **Production Build** | `pnpm build` | Compiles all packages and builds production bundles |
| **Lint** | `pnpm lint` | Runs ESLint across all workspace packages |
| **Typecheck** | `pnpm typecheck` | Runs `tsc --noEmit` across all monorepo packages |
| **Test** | `pnpm test` | Runs test suites across all packages |
| **Clean** | `pnpm clean` | Removes all build artifacts and `node_modules` |

---

## 🔒 Security & Privacy Contract

DevKit enforces a strict security contract:
1. **Client Isolation**: User inputs in tools like JSON Formatter, JWT Decoder, or Hash Generator are processed in browser memory and are **never** transmitted to backend logging or external telemetry.
2. **Password Encryption**: User authentication passwords are encrypted using `bcrypt` (10 rounds) before DB insertion.
3. **Session Verification**: Sessions are validated via signed JWT tokens with standard expiration guards.
4. **SSRF Protection**: API Tester proxies requests through a controlled NestJS endpoint to prevent abuse of the server network.
5. **AI Input Sanitization**: Inputs sent to the AI Assistant are stripped of sensitive tokens (JWTs, API keys) before being forwarded to the Groq API.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for developers by developers.**

</div>
