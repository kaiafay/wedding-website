# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply migrations to the database
npx drizzle-kit studio     # Drizzle Studio GUI (inspect DB)
```

No test suite is configured.

## Stack

- **Next.js 16** (App Router, React 19) — see `node_modules/next/dist/docs/` for this version's APIs
- **Drizzle ORM** on **Neon serverless Postgres** (HTTP driver, not WebSocket)
- **Tailwind CSS 4** — uses `@tailwindcss/postcss`, no `tailwind.config.js`
- **Framer Motion 12** for envelope animation and transitions
- **Resend** is installed but not yet wired into the RSVP flow

Required env vars: `DATABASE_URL` (Neon connection string), `ADMIN_PASSWORD` (not yet used).

## Architecture

The app is a single-page wedding site (`src/app/page.tsx`) with three vertically stacked sections: Hero, Schedule, and RSVP. All sections are client components rendered from the root page.

### One-time token flow

Every guest gets a unique invitation URL `/?token=<token>`. On load, `page.tsx` calls `GET /api/token?token=<token>` and receives the guest's name, their DB id, and whether the token is still valid. The RSVP section renders differently based on that response:

- No/invalid token → public invitation view (no form)
- Valid token → envelope animation → RSVP form pre-filled with guest name
- Already-used token → "already responded" message

`POST /api/rsvp` re-validates the token and uses a **single database transaction** to insert the RSVP and set `guests.usedAt`, preventing double submission.

### Data model (`src/lib/schema.ts`)

- `guests`: `id`, `token` (unique), `name`, `email`, `usedAt` (null until submitted), `createdAt`
- `rsvps`: `id`, `guestId` (FK → guests), `attending` (boolean), `mealPreference` ("Chicken" | "Salmon" | "Vegetarian" | null), `message`, `createdAt`

Token generation and guest seeding happen outside this app (no admin UI yet).

### Component tree

```
page.tsx (client, owns token/guest state)
  HeroSection
  ScheduleSection
  RsvpSection (receives tokenValid, tokenUsed, guestName, guestId)
    EnvelopeAnimation  ← Framer Motion, opens on click/Enter
    RsvpForm           ← renders after envelope opens; replaces itself with success message
```

State is managed with `useState` in the component that owns it; no global store.

### Styling

Inline styles dominate. CSS custom properties (defined in `globals.css`) carry the color palette and font references. Three Google Fonts loaded in `layout.tsx`: Great Vibes (script), Cormorant Garamond (serif), DM Sans (sans), exposed as CSS variables `.font-script`, `.font-serif`, `.font-sans`. Tailwind is used for utility layout only.

### Hardcoded domain content

Bride: Kaia, Groom: Richard — Date: July 8, 2027 — Location: Bellingham, WA — RSVP deadline: January 1, 2027 — Schedule: 4 pm ceremony, 5 pm cocktails, 6:30 pm reception.
