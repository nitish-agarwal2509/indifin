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

## Design System — Dark Premium Fintech (Violet/Indigo)

- **Theme:** Dark-first with zinc-950 (`#09090b`) base, no light mode
- **Primary accent:** Violet (`violet-400` / `#a78bfa`) — brand, CTAs, gradient text
- **Negative values:** Red (`red-400`/`red-500`) for losses/errors
- **Secondary accents:** Indigo for gradients, purple for step highlights
- **Surfaces:** Cards use `bg-zinc-900/50` with `backdrop-blur-xl`, `glow-card` class for hover border glow
- **Borders:** `border-zinc-800` or `border-zinc-800/50` (semi-transparent)
- **Buttons:** Primary CTAs use `shimmer-button` class (animated violet gradient, dark text)
- **Icons:** Lucide icons with `strokeWidth={1.5}`, muted `text-zinc-400` color
- **Typography:** Gradient text via `.gradient-text` class (violet → indigo → purple)
- **Responsive:** Mobile-first with `sm:` breakpoints — smaller padding/text/icons on mobile, full desktop layout at `sm:` (640px+)
- **Animations:** `.scroll-reveal` (scroll-triggered fade-up), `.animate-marquee` (trust bar), `.shimmer-button` (CTA glow)
- **Charts:** Violet (#a78bfa) for portfolio, indigo (#6366f1) for Nifty; dark tooltips
- **Pie chart palette:** violet, indigo, cyan, pink, amber

## External APIs

- **AMFI NAV data:** `https://www.amfiindia.com/spages/NAVAll.txt` (daily NAV for all schemes)
- **Historical NAV:** mfapi.in REST API (no auth, per-scheme historical data)
- **Nifty 50:** Yahoo Finance `^NSEI` ticker
- **AI:** Google Gemini 2.5 Flash Lite via `@google/generative-ai` npm package
