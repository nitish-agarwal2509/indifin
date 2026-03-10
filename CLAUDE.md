# IndiFin — Claude Code Guide

## Project Overview

IndiFin is an Indian personal finance web app that lets users upload their mutual fund CAS (Consolidated Account Statement) PDF, uses AI to parse it, and shows portfolio performance against the Nifty 50 index with AI-powered insights.

- **Docs:** See `docs/PRD.md` for full product requirements, `docs/ROADMAP.md` for implementation chunks
- **Current status:** All chunks (1-10) complete. Deployed to production at https://indifin.vercel.app

## Tech Stack

- **Framework:** Next.js 16 with App Router, TypeScript
- **UI:** Tailwind CSS v4 + shadcn/ui (v4) + Lucide icons
- **Database + Auth:** Supabase (free tier) — PostgreSQL + Google OAuth
- **AI:** Google Gemini 2.5 Flash Lite (free tier)
- **Charts:** Recharts
- **PDF Parsing:** unpdf (server-side text extraction)
- **Deployment:** Vercel (free tier)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── page.tsx            # Landing page (auth-aware, shows dashboard link if logged in)
│   ├── globals.css         # Tailwind + shadcn theme variables
│   ├── login/page.tsx      # Auth page (Google OAuth only)
│   ├── auth/
│   │   ├── callback/route.ts  # OAuth callback handler
│   │   └── signout/route.ts   # Sign out handler
│   └── dashboard/
│       ├── layout.tsx      # Dashboard shell (navbar + user avatar)
│       ├── page.tsx        # Portfolio overview
│       ├── upload/page.tsx # PDF upload flow
│       ├── review/page.tsx # AI-parsed data review + confirm
│       ├── compare/page.tsx# Portfolio vs Nifty 50
│       └── insights/page.tsx # AI insights
├── components/
│   ├── ui/                 # shadcn/ui components (auto-generated)
│   ├── user-nav.tsx        # User avatar + logout (client component)
│   ├── mobile-nav.tsx      # Mobile hamburger menu (client component)
│   └── spinner.tsx         # Loading spinner component
├── lib/
│   ├── utils.ts            # cn() utility for className merging
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client (cookies-based)
│   │   └── middleware.ts    # Auth session refresh + route protection
│   ├── gemini.ts           # Gemini AI client initialization
│   ├── cas-parser.ts       # CAS text → structured JSON via Gemini
│   ├── xirr.ts             # XIRR calculation (Newton-Raphson method)
│   ├── nifty.ts            # Nifty 50 data fetch + portfolio simulation
│   ├── retry.ts            # Exponential backoff retry utility for Gemini API
│   └── types.ts            # Shared TypeScript interfaces (ParsedCAS, etc.)
├── middleware.ts            # Next.js middleware (routes to supabase/middleware)
docs/
├── PRD.md                  # Product requirements document
└── ROADMAP.md              # Implementation roadmap with user stories
```

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm start` — Start production server

## Conventions

- **Import alias:** Use `@/*` which maps to `./src/*`
- **Components:** Use shadcn/ui components from `@/components/ui/`. Add new ones via `npx shadcn@latest add <component>`
- **Styling:** Tailwind utility classes only. Use `cn()` from `@/lib/utils` to merge classNames conditionally
- **Pages:** Each route is a directory under `src/app/` with a `page.tsx` file (Next.js App Router convention)
- **Server vs Client:** Default to Server Components. Add `"use client"` only when needed (event handlers, hooks, browser APIs)
- **Data fetching:** Use Server Components for data fetching where possible. Use API routes (`src/app/api/`) for mutations and external API calls
- **TypeScript:** Strict mode enabled. Define types/interfaces in the same file or in a shared `types.ts` when reused across 3+ files
- **Environment variables:** Use `.env.local` for secrets (Supabase keys, Gemini API key). Prefix with `NEXT_PUBLIC_` only for client-side vars

## Key Design Decisions

- **CAS PDF support:** CAMS/KFintech traditional CAS, MF Central CAS (SoA + Demat Holdings), and CDSL Demat CAS
- **AI for parsing:** Raw text extracted via unpdf, preprocessed to remove noise (headers, Hindi, footers), then structured by Gemini. Post-processing validates and recalculates totals from transaction data.
- **Free tier everything:** All services must work within free tiers. No paid dependencies
- **User confirmation:** AI-parsed data is always shown to the user for review before saving to DB
- **Vercel 10s limit:** Long AI calls must use streaming or be broken into chunks to stay within serverless function timeout

## Design System — Bold Premium Fintech

- **Theme:** Dark-first with deep navy backgrounds, no light mode
- **Primary accent:** Emerald green (`emerald-400`/`emerald-500`) — brand, CTAs, positive values
- **Negative values:** Rose (`rose-400`) for losses/errors
- **Secondary accents:** Cyan for portfolio, amber for Nifty/warnings, violet for suggestions
- **Surfaces:** Cards use `bg-card/50` or `bg-card/80` with `backdrop-blur-xl` for glassmorphism
- **Borders:** `border-border/50` (semi-transparent), hover to `border-emerald-500/30`
- **Buttons:** Primary CTAs use `bg-emerald-500 text-black font-semibold` with glow shadows
- **Typography:** Gradient text for brand name (`from-emerald-400 to-teal-300 bg-clip-text text-transparent`)
- **Charts:** Emerald (#34d399) for portfolio, amber (#fbbf24) for Nifty; dark tooltips with slate bg
- **Pie chart palette:** emerald, cyan, violet, amber, orange, pink

## External APIs

- **AMFI NAV data:** `https://www.amfiindia.com/spages/NAVAll.txt` (daily NAV for all schemes)
- **Historical NAV:** mfapi.in REST API (no auth, per-scheme historical data)
- **Nifty 50:** Yahoo Finance `^NSEI` ticker
- **AI:** Google Gemini 2.5 Flash Lite via `@google/generative-ai` npm package
