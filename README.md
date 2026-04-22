# Notes

A rich-text note-taking app with public sharing. Built with Next.js, TipTap, and SQLite.

## Features

- Email/password authentication
- Rich-text editor (bold, italic, headings, lists, code blocks)
- Public note sharing via unique URL (`/p/[slug]`)
- Auto-saving with optimistic UI

## Stack

- **Runtime:** Bun
- **Framework:** Next.js 16 (App Router)
- **Editor:** TipTap 3
- **Auth:** better-auth
- **DB:** SQLite (Bun native client)
- **Styling:** TailwindCSS 4

## Getting Started

```bash
cp .env.example .env.local
# Edit .env.local — set BETTER_AUTH_SECRET and DB_PATH

bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable            | Description                        |
| ------------------- | ---------------------------------- |
| `BETTER_AUTH_SECRET` | Random secret, 32+ chars          |
| `DB_PATH`           | Path to SQLite file (e.g. `data/app.db`) |

## Commands

```bash
bun run dev      # Development server
bun run build    # Production build
bun run start    # Production server
bun run lint     # ESLint
```

## Built with Claude Code

This project was built using Claude Code with agents, commands, and skills:

- **Agents** — DocsExplorer for live documentation lookup and Explore for codebase navigation
- **Commands** — `/init` to generate `CLAUDE.md`, `/review` for PR review, `/security-review` for security audits
- **Skills** — `simplify` to reduce code complexity, `fewer-permission-prompts` to tune the permission allowlist

## Project Structure

```
app/
  api/notes/         # REST endpoints (CRUD + sharing)
  dashboard/         # Authenticated note list
  notes/[id]/        # Note editor page
  p/[slug]/          # Public read-only note page
lib/
  db.ts              # SQLite singleton + query helpers
  notes.ts           # Note repository (all queries scoped to user_id)
components/
  NoteEditor.tsx     # TipTap editor (client component)
  NoteList.tsx       # Note list with links
  ShareToggle.tsx    # Public sharing toggle
  DeleteNoteButton.tsx
```
