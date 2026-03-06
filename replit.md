# QuantPro — replit.md

## Overview

QuantPro is a LeetCode-style quantitative finance practice platform. Users solve real-world trading and investment challenges (backtesting strategies, building risk models, designing execution algorithms) and are scored on financial performance metrics like Sharpe ratio, max drawdown, and turnover — not just code correctness.

Target users: Alpha Researchers, Quant Developers, Portfolio Managers, Risk Managers, and Execution/Microstructure specialists.

Key features:
- 60-challenge library (20 Beginner, 20 Practitioner, 20 Expert) across tracks: Alpha, Portfolio, Risk, Execution, Data
- In-browser Python code editor with syntax highlighting
- AI-powered code grading engine (GPT-4o-mini evaluates correctness, quality, efficiency)
- AI Quant Assistant (chat interface powered by OpenAI)
- User dashboard with performance tracking
- Global leaderboard

---

## User Preferences

Preferred communication style: Simple, everyday language.
Deployment: Only deploy to quantpro.us (custom domain). Do NOT deploy to any Replit subdomain (e.g. alpha-arena--npatnaik.replit.app). All URLs in the codebase must reference quantpro.us only.

---

## System Architecture

### Full-Stack Structure

The app uses a monorepo layout with three main directories:
- `client/` — React frontend (Vite, TypeScript)
- `server/` — Express backend (Node.js, TypeScript)
- `shared/` — Shared types, schemas, and route definitions used by both client and server

This shared layer is critical: route definitions, Zod validation schemas, and database types all live in `shared/` so both sides stay in sync without duplication.

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Routing**: `wouter` (lightweight client-side routing)
- **State & Data Fetching**: TanStack Query (React Query v5) — all API calls go through custom hooks in `client/src/hooks/`
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS) with a dark, finance-themed design system
- **Animations**: Framer Motion for page transitions and UI effects
- **Charts**: Recharts for financial performance visualizations (area charts, etc.)
- **Code Editor**: `react-simple-code-editor` + PrismJS for the in-browser Python editor
- **Markdown**: `react-markdown` for rendering challenge descriptions
- **Styling**: Tailwind CSS with CSS variables for theming; dark mode only; financial green (`hsl(142 76% 36%)`) as the primary color
- **Fonts**: DM Sans (body), Outfit (headings/display), JetBrains Mono (code)

**Pages**:
- `Landing.tsx` — public marketing page with sign-in method badges (Google, GitHub, Apple, Email)
- `Dashboard.tsx` — user performance overview
- `ChallengeLibrary.tsx` — searchable/filterable list of challenges
- `ChallengeWorkspace.tsx` — resizable split-pane editor + problem description
- `Leaderboard.tsx` — global rankings (currently mock data)
- `UserTraffic.tsx` — admin-only page showing all registered users, login times, challenges attempted, scores, and rankings
- `AdminFeedback.tsx` — admin-only page showing all user feedback with search and delete

Route protection: unauthenticated users can only see Landing; all other routes redirect to `/api/login`. The `/admin/traffic` and `/admin/feedback` routes are restricted to `npatnaik@gmail.com` on both frontend (redirect) and backend (403).

### Backend Architecture

- **Framework**: Express.js on Node.js, served via `tsx` in dev or compiled with esbuild for production
- **Architecture**: Storage pattern — `server/storage.ts` defines an `IStorage` interface and `DatabaseStorage` class that wraps all DB calls. Routes in `server/routes.ts` call `storage.*` methods only.
- **Validation**: Zod schemas defined in `shared/routes.ts` and `shared/schema.ts`; route handlers parse input and return typed errors
- **Session Management**: `express-session` with PostgreSQL session store (`connect-pg-simple`), sessions stored in the `sessions` table
- **Build**: esbuild bundles the server to `dist/index.cjs`; Vite builds the client to `dist/public/`

**Route groups** (in `server/routes.ts`):
- `GET/POST /api/challenges` — challenge CRUD
- `GET/POST /api/submissions` — submission handling
- `GET /api/admin/users` — admin-only: all users with traffic stats (protected by `isAdmin` middleware)
- `GET /api/admin/stats` — admin-only: aggregate stats (total users, users this week)
- `POST /api/feedback` — submit user feedback (authenticated)
- `GET /api/admin/feedback` — admin-only: all feedback entries
- `DELETE /api/admin/feedback/:id` — admin-only: delete a feedback entry
- Auth, chat, and image routes registered via Replit integration modules

### Replit Integrations (Modular)

Located in `server/replit_integrations/`, each integration is self-contained:

1. **Auth** (`/auth/`) — Replit OIDC via `openid-client` + Passport.js. Handles login/logout/session. Users upserted into the `users` table on login. `isAuthenticated` middleware guards protected routes.

2. **Chat** (`/chat/`) — OpenAI-backed conversational AI (the "AI Quant Assistant"). Conversations and messages persisted to the database. Uses `AI_INTEGRATIONS_OPENAI_API_KEY` env var routed through Replit's AI proxy.

### AI Grading Engine

Located in `server/grading-engine.ts`. Replaces the former mock grading engine.

- **Model**: GPT-4o-mini via OpenAI API (same credentials as chat)
- **Flow**: User submits code → backend fetches challenge details → sends code + challenge description to GPT → GPT returns structured JSON with scores → backend computes weighted score and stores result
- **Scoring**: Weighted average of Correctness (50%), Code Quality (30%), Efficiency (20%). Score is scaled to challenge point value.
- **Pass threshold**: ≥60% correctness required to pass
- **Quant metrics**: Sharpe ratio, max drawdown, stability — generated proportional to code quality
- **Feedback**: 3-6 specific, actionable feedback lines referencing the actual code
- **Retry**: Single retry on model parse failure for robustness
- **Console output**: Formatted grading report shown in the workspace console panel

3. **Image** (`/image/`) — OpenAI image generation (`gpt-image-1` model) exposed via `/api/generate-image`.

4. **Batch** (`/batch/`) — Generic batch processing utility with concurrency limiting (`p-limit`) and exponential backoff retries (`p-retry`). Used for bulk LLM calls.

### Data Storage

- **Database**: PostgreSQL via `drizzle-orm/node-postgres`
- **ORM**: Drizzle ORM with schema-first approach; all tables defined in `shared/schema.ts` and `shared/models/`
- **Migrations**: Drizzle Kit (`drizzle-kit push` for schema sync; migrations output to `./migrations/`)

**Database Tables**:
| Table | Purpose |
|---|---|
| `sessions` | Express session storage (required for Replit Auth) |
| `users` | Authenticated user profiles |
| `challenges` | Problem definitions (title, slug, difficulty, track, starter code, test cases, points) |
| `submissions` | User code submissions with status, score (decimal), and financial metrics (JSONB) |
| `feedback` | User feedback entries with userId, email, name, pageUrl, message, createdAt |
| `conversations` | AI chat conversation threads |
| `messages` | Individual chat messages per conversation |

**Key schema decisions**:
- `challenges.testCases` stored as JSONB array for flexibility
- `submissions.metrics` stored as typed JSONB: `{ sharpe?, drawdown?, turnover?, stability? }`
- `submissions.score` is `decimal` to preserve precision for financial scores
- `users.id` uses `gen_random_uuid()` default (not serial), matching Replit's OIDC `sub` claim

### Authentication

- **Provider**: Google OAuth 2.0 (via `passport-google-oauth20`)
- **Flow**: `/api/login` → Google OAuth consent → `/api/auth/google/callback` → upsert user → session cookie → redirect to `/dashboard`
- **Session**: Stored in PostgreSQL (`sessions` table), 7-day TTL, secure HTTP-only cookies. User serialized by ID.
- **Client-side**: `useAuth()` hook queries `/api/auth/user`; returns `null` for unauthenticated users. Login links use `<a href="/api/login">` (full page navigation, NOT wouter `<Link>`)
- **User object**: Stored in `users` table with Google profile ID as primary key. Available on `req.user` (with `.id`, `.email`, `.firstName`, `.lastName`, `.profileImageUrl`)

### Shared Routes Contract

`shared/routes.ts` defines a typed API contract object (`api`) that both the client hooks and server handlers reference. Each route entry includes method, path, input schema (Zod), and response schemas. This prevents client/server drift and enables type-safe API calls without a separate codegen step.

---

## External Dependencies

### Required Environment Variables
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key (routed via Replit AI proxy) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI base URL (Replit AI proxy endpoint) |

### Third-Party Services
- **Google OAuth 2.0** — user authentication via Gmail; no Replit account required
- **OpenAI API** — AI Quant Assistant chat + image generation; accessed via Replit AI Integrations proxy
- **Google Fonts** — DM Sans, Outfit, JetBrains Mono, Fira Code loaded via CDN in `client/index.html`

### Key NPM Dependencies
- `drizzle-orm` + `pg` — database access
- `drizzle-zod` — auto-generate Zod schemas from Drizzle tables
- `openid-client` + `passport` + `passport-local` — Replit OIDC auth
- `express-session` + `connect-pg-simple` — session management
- `@tanstack/react-query` — client-side data fetching and caching
- `wouter` — client-side routing
- `framer-motion` — animations
- `recharts` — financial charts
- `react-simple-code-editor` + `prismjs` — in-browser code editor
- `react-markdown` — challenge description rendering
- `openai` — OpenAI SDK for chat and image generation
- `p-limit` + `p-retry` — batch processing concurrency/retry utilities
- `zod` — runtime validation across client and server
- `nanoid` — ID generation
- All `@radix-ui/*` packages — accessible UI primitives via shadcn/ui