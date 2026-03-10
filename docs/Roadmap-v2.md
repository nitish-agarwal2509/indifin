# IndiFin V2 — Enhanced Experience Roadmap

Each chunk is independently testable and deployable. Chunks are ordered by dependency.

---

## Chunk 1: DigiLocker Integration & Extensible Data Sources

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-1.1 | Build an extensible data source abstraction (`src/lib/data-sources/`) with a common interface for pulling portfolio data |
| US-1.2 | Integrate DigiLocker API to pull CAS PDF directly (no manual upload needed) |
| US-1.3 | Create `/dashboard/connect` page — choose data source: Upload PDF (existing) or Connect DigiLocker |
| US-1.4 | Store source type in `portfolios` table for tracking origin of data |
| US-1.5 | Design the abstraction to be extensible for future broker integrations (Zerodha, Groww, etc.) |

**Test:** Connect DigiLocker account → CAS pulled automatically → parsed and shown in review page

---

## Chunk 2: Persist Insights & Portfolio Snapshots

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-2.1 | Modify `/api/portfolio/insights/route.ts` to save generated insights to the `ai_insights` table after generation |
| US-2.2 | On insights page, load cached insights from DB first. Show "Generate" if none exist, "Regenerate" if they do |
| US-2.3 | Add `portfolio_snapshots` table: `id`, `portfolio_id`, `snapshot_date`, `total_invested`, `total_current_value`, `total_gain_loss`, `portfolio_xirr`, `scheme_values_json` (jsonb) |
| US-2.4 | On each portfolio confirm, auto-create a snapshot row with current values |
| US-2.5 | Add a "Portfolio History" card on dashboard showing value at each upload date (sparkline or table) |

**Test:** Generate insights → navigate away → come back → cached insights load instantly. Upload new CAS → previous snapshot preserved in history.

---

## Chunk 3: Scheme Detail Page

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-3.1 | Create `/dashboard/scheme/[id]/page.tsx` — detail page for a single scheme |
| US-3.2 | Show scheme header: name, AMC, folio, category, registrar |
| US-3.3 | Show key metrics: invested amount, current value, gain/loss, XIRR, units, NAV |
| US-3.4 | Show full transaction history table (date, description, amount, units, NAV) with sorting |
| US-3.5 | Fetch historical NAV from mfapi.in using `scheme_code` and show NAV trend chart (Recharts line chart) |
| US-3.6 | Make scheme names in the holdings table on dashboard clickable, linking to detail page |
| US-3.7 | Add "Back to Dashboard" breadcrumb navigation |

**Test:** Click a scheme name on dashboard → navigate to detail page showing full transaction history and NAV chart.

---

## Chunk 4: Flexible Comparison Period & Improved Chart

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-4.1 | Add period selector to compare page: 1Y, 3Y, 5Y, Max (based on transaction history) |
| US-4.2 | Improve `buildComparisonTimeSeries` to calculate actual portfolio value at each date (cumulative units × NAV) instead of proportional approximation |
| US-4.3 | Add `src/lib/mfapi.ts` utility for fetching historical NAV per scheme from mfapi.in |
| US-4.4 | Add `nav_history` table to cache fetched historical NAV data (scheme_code, date, nav) |
| US-4.5 | Improve chart tooltip showing exact values and date on hover |
| US-4.6 | Add "Download chart as PNG" button |

**Dependencies:** Chunk 3 (shares mfapi.in integration pattern)

**Test:** Select "3Y" period → chart redraws with accurate portfolio values. Hover shows exact values. PNG downloads correctly.

---

## Chunk 5: SIP Detection & Tracking

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-5.1 | Add `src/lib/sip-detector.ts` — analyze transaction history to detect recurring investments (same scheme, similar amount, monthly frequency) |
| US-5.2 | Add "SIP Summary" card on dashboard: detected SIPs with scheme name, monthly amount, start date, total months, current status (active/stopped) |
| US-5.3 | Add SIP details to scheme detail page (Chunk 3): detected SIP pattern, average monthly amount, streak |
| US-5.4 | Include SIP data in AI insights prompt so Gemini can comment on SIP consistency and adequacy |

**Dependencies:** Chunk 3 (scheme detail page)

**Test:** Dashboard shows "Active SIPs" card with detected monthly SIPs. SIP stopped >2 months ago shows as "Stopped".

---

## Chunk 6: Portfolio PDF Download

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-6.1 | Add "Download PDF Report" button on dashboard |
| US-6.2 | Server-side HTML-to-PDF generation with styled portfolio summary |
| US-6.3 | Include in PDF: holdings table, allocation chart, XIRR, comparison summary, key insights |
| US-6.4 | Style the PDF to match the app's dark premium aesthetic |

**Test:** Click "Download PDF Report" → downloads a styled PDF with complete portfolio summary.

---

## Chunk 7: Smart AI Chat

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-7.1 | Create `/dashboard/chat` page with conversational UI (message input, chat history) |
| US-7.2 | Build chat API route that sends portfolio context + user question to Gemini with streaming response |
| US-7.3 | Pre-populate system prompt with portfolio context: holdings, XIRR, allocation, SIPs |
| US-7.4 | Add suggested questions: "How is my portfolio diversified?", "Should I increase my SIP?", "Which funds should I exit?" |
| US-7.5 | Save chat history per portfolio in `chat_messages` table |
| US-7.6 | Rate-limit to 20 messages/day per user (Gemini free tier protection) |

**Test:** Ask "How is my portfolio doing?" → contextual response referencing actual scheme names and numbers. Chat history persists across sessions.

---

## Chunk 8: UI Polish & Performance

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-8.1 | Add skeleton loading states (shimmer placeholders) for dashboard cards, holdings table, and charts |
| US-8.2 | Add animated number transitions for summary cards (count-up animation) |
| US-8.3 | Add dashboard tour/onboarding for first-time users (tooltip walkthrough) |
| US-8.4 | Add proper error boundaries (`error.tsx`) for each dashboard route |
| US-8.5 | Add `loading.tsx` files for dashboard routes (Next.js streaming SSR) |
| US-8.6 | Add proper SEO metadata, Open Graph tags, and favicon to landing page |

**Dependencies:** After all other V2 chunks (polish applies across features)

**Test:** Dashboard loads with skeleton shimmer. First-time user sees onboarding tour. Error boundary catches and displays errors gracefully.

---

## Dependency Graph

```
1 (DigiLocker) ─────────┐
2 (Persist/Snapshots) ──┤── Parallel start
3 (Scheme Detail) ──────┘
4 (Flexible Compare) ── after 3
5 (SIP Detection) ───── after 3
6 (PDF Download) ─────── independent
7 (AI Chat) ──────────── after 2
8 (UI Polish) ────────── after all V2
```

---

## Free Tier Feasibility

- **DigiLocker API:** Free for individual users
- **Supabase (500MB):** New tables (snapshots, nav_history, chat_messages) fit easily
- **Gemini free tier:** Chat needs rate limiting at 20 msgs/day/user
- **mfapi.in:** Free, no auth required
- **No new paid services required**
