# CLAUDE.md

We're building the app described in @SPEC.MD. Reat that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run ESLint
```

## Environment Setup

Copy `.env.example` to `.env.local` and set:

- `BETTER_AUTH_SECRET` – must be 32+ chars
- `DB_PATH` – SQLite file path (e.g. `data/app.db`)

## Architecture

This is a Next.js App Router application for a note-taking app with rich-text editing. **The spec is in `SPEC.MD`** – it defines the full feature set, DB schema, API contracts, and component structure.

**Stack:** Next.js 16 + Bun runtime + TypeScript + TailwindCSS 4 + TipTap 3 + better-auth + SQLite (via Bun's native SQLite client)

**Layers:**

- `app/` – Next.js pages, layouts, and route handlers (`app/api/.../route.ts`)
- `lib/db.ts` – Singleton SQLite connection with query helpers (`query<T>`, `get<T>`, `run`)
- `lib/notes.ts` – Note repository functions; all queries scope to `user_id`
- `components/` – React components (NoteEditor, NoteList, ShareToggle, etc.)

**Auth:** better-auth handles session management. All `/dashboard` and `/notes/[id]` routes must check auth server-side. All `/api/notes` handlers return 401 if unauthenticated.

**Data flow:** Route Handlers → `lib/notes.ts` repository → `lib/db.ts` → SQLite file

**TipTap content** is stored as `JSON.stringify(editor.getJSON())` in `content_json` column; parsed with `JSON.parse` on load. Never use `dangerouslySetInnerHTML` with unsanitized data.

**Public sharing:** When a note is made public, generate a 16+ char random slug (nanoid). Public URL: `/p/[slug]`. Slug is set to NULL when sharing is disabled.

## Key Constraints

- Every note SQL query in authenticated context must include `WHERE user_id = ?` to prevent cross-user access
- TipTap editor must be a Client Component (`"use client"`)
- Server Components handle data fetching for dashboard and note pages
