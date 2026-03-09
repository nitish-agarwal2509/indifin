# IndiFin — Implementation Roadmap

Each chunk is independently testable and deployable. Chunks are ordered by dependency — later chunks build on earlier ones.

---

## Chunk 1: Project Setup & Landing Page ✅

**Status:** Complete

| Story | Description |
|-------|-------------|
| US-1.1 | Initialize Next.js 14 project with App Router, Tailwind CSS, shadcn/ui |
| US-1.2 | Set up Supabase project (database + auth) |
| US-1.3 | Build landing page (`/`) with product description and "Get Started" CTA |
| US-1.4 | Deploy to Vercel, verify it loads |

**Test:** Visit deployed URL → see landing page

---

## Chunk 2: Authentication ✅

**Status:** Complete

| Story | Description |
|-------|-------------|
| US-2.1 | Integrate Supabase Auth with Google OAuth provider |
| US-2.2 | Build login/signup page (`/login`) |
| US-2.3 | Add auth middleware — protect `/dashboard/*` routes |
| US-2.4 | Add user avatar + logout in navbar |

**Test:** Sign in with Google → redirected to `/dashboard` → sign out works

---

## Chunk 3: PDF Upload & Text Extraction ✅

**Status:** Complete

| Story | Description |
|-------|-------------|
| US-3.1 | Build PDF upload UI (`/dashboard/upload`) with drag-and-drop |
| US-3.2 | Extract raw text from CAS PDF using `pdf-parse` on server |
| US-3.3 | Display extracted raw text for debugging/verification |
| US-3.4 | Store raw text in `portfolios` table |

**Test:** Upload a CAS PDF → see extracted text on screen

---

## Chunk 4: AI Parsing (Gemini)

**Status:** Not started

| Story | Description |
|-------|-------------|
| US-4.1 | Integrate Google Gemini 1.5 Flash API |
| US-4.2 | Build prompt to extract holdings + transactions from CAS text → structured JSON |
| US-4.3 | Show parsed data (schemes, units, transactions) in a review table |
| US-4.4 | User confirms → save parsed data to `schemes` + `transactions` tables |

**Test:** Upload CAS → AI parses → review table shows correct schemes and transactions → confirm saves to DB

---

## Chunk 5: Portfolio Dashboard (Holdings Overview)

**Status:** Not started

| Story | Description |
|-------|-------------|
| US-5.1 | Fetch current NAV for each scheme from AMFI API |
| US-5.2 | Build holdings table: scheme name, units, NAV, current value, invested amount, returns % |
| US-5.3 | Show portfolio summary card: total invested, current value, overall gain/loss |
| US-5.4 | Asset allocation pie chart (equity/debt/hybrid) |

**Test:** After upload → dashboard shows holdings with live NAV values and correct returns

---

## Chunk 6: XIRR Calculation

**Status:** Not started

| Story | Description |
|-------|-------------|
| US-6.1 | Implement XIRR calculation from transaction history |
| US-6.2 | Show portfolio-level XIRR on dashboard |
| US-6.3 | Show fund-level XIRR in holdings table |

**Test:** Compare calculated XIRR with known values from Kuvera/Value Research

---

## Chunk 7: Nifty 50 Comparison

**Status:** Not started

| Story | Description |
|-------|-------------|
| US-7.1 | Fetch Nifty 50 historical data (Yahoo Finance / free API) |
| US-7.2 | Simulate "same cashflows invested in Nifty 50" — calculate hypothetical portfolio value |
| US-7.3 | Build time-series line chart: Your Portfolio vs Nifty 50 equivalent |
| US-7.4 | Show side-by-side: Your XIRR vs Nifty 50 XIRR |

**Test:** Chart shows two lines diverging over time → Nifty values match publicly available data

---

## Chunk 8: AI Insights

**Status:** Not started

| Story | Description |
|-------|-------------|
| US-8.1 | Send portfolio summary + comparison data to Gemini |
| US-8.2 | Generate insights: performance summary, underperformers, rebalancing suggestions |
| US-8.3 | Build insights panel UI (`/dashboard/insights`) with cards per insight |
| US-8.4 | Cache insights in `ai_insights` table — regenerate only on new upload |

**Test:** After upload → insights page shows relevant, accurate recommendations

---

## Chunk 9: Polish & Edge Cases

**Status:** Not started

| Story | Description |
|-------|-------------|
| US-9.1 | Handle re-upload (update existing portfolio vs create new) |
| US-9.2 | Loading states, error handling, empty states |
| US-9.3 | Responsive design (mobile-friendly) |
| US-9.4 | Rate limit handling for Gemini free tier (queue + retry) |

**Test:** Full end-to-end flow works smoothly on desktop and mobile

---

## Verification Checklist

- [ ] Upload sample CAS PDFs and verify parsing accuracy
- [ ] Compare calculated XIRR against known tools (e.g., Value Research, Kuvera)
- [ ] Verify Nifty 50 data accuracy against NSE historical data
- [ ] Test auth flow end-to-end
- [ ] Test on Vercel free tier deployment limits (10s serverless function timeout)
