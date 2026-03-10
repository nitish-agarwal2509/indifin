# IndiFin V3 — Advanced Features Roadmap

V3 introduces features that meaningfully differentiate IndiFin — multi-portfolio support, tax awareness, goal planning, and broker integrations.

---

## Chunk 1: Multiple Portfolio Support

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-1.1 | Remove cascade-delete logic in `/api/portfolio/confirm/route.ts` — stop deleting old portfolios on new upload |
| US-1.2 | Add portfolio name/label field during upload (e.g., "My Portfolio", "Wife's Portfolio", "Parents") |
| US-1.3 | Add portfolio switcher dropdown in dashboard navbar (alongside user avatar) |
| US-1.4 | Add `/dashboard/portfolios` page — list all portfolios with summary cards (name, value, XIRR, last updated) |
| US-1.5 | Add "Delete Portfolio" functionality with confirmation dialog |
| US-1.6 | Add "Combined View" option that aggregates all portfolios into one dashboard view |
| US-1.7 | Update all dashboard pages to read from selected portfolio (via URL param or context) |

**Test:** Upload two CAS PDFs with different names. Switch between them. Combined view shows aggregate. Delete one — other remains.

---

## Chunk 2: Tax Awareness (LTCG/STCG)

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-2.1 | Add `src/lib/tax-calculator.ts` — calculate LTCG and STCG per scheme based on holding period (equity: >12 months = LTCG, debt: per applicable rules) |
| US-2.2 | Add "Tax Summary" card on dashboard: estimated LTCG, STCG, total tax liability |
| US-2.3 | Add `/dashboard/tax` page with per-scheme breakdown: purchase date, units, holding period, gain type, estimated tax |
| US-2.4 | Support FY selection (e.g., FY 2025-26) to show tax for that financial year |
| US-2.5 | Add tax rates: equity LTCG (12.5% above Rs 1.25L), equity STCG (20%), debt (slab rate) |
| US-2.6 | Add "Tax Harvesting Opportunities" — identify schemes where booking losses can offset gains |

**Dependencies:** V2 Chunk 3 (scheme detail page)

**Test:** Tax page shows correct LTCG/STCG classification. Tax harvesting identifies loss-making schemes that could offset gains.

---

## Chunk 3: Goal-Based Planning

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-3.1 | Add `goals` table: `id`, `user_id`, `name`, `target_amount`, `target_date`, `created_at` |
| US-3.2 | Add `goal_scheme_links` table: `id`, `goal_id`, `scheme_id`, `allocation_pct` |
| US-3.3 | Add `/dashboard/goals` page — create and manage financial goals (retirement, house, education, etc.) |
| US-3.4 | Allow users to link schemes to goals (e.g., "PPFAS Flexi Cap → 50% Retirement, 50% House") |
| US-3.5 | Show goal progress: current value vs target, projected completion date based on SIP rate + historical returns |
| US-3.6 | Add goal progress cards to the main dashboard |
| US-3.7 | AI insights should reference goals: "Retirement corpus is on track" or "Increase SIP by Rs 5,000/month to reach house goal by 2030" |

**Dependencies:** V2 Chunk 5 (SIP detection), V3 Chunk 1 (multi-portfolio)

**Test:** Create "Retirement" goal for Rs 5 Cr by 2045. Link equity schemes. See projected trajectory chart and SIP recommendation.

---

## Chunk 4: Real-Time NAV & Portfolio Valuation

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-4.1 | Add `src/lib/amfi-nav.ts` — fetch latest NAV from AMFI's `NAVAll.txt` endpoint and parse it |
| US-4.2 | Add Vercel cron job that fetches and stores latest NAV daily in `latest_navs` table |
| US-4.3 | Add AMFI scheme code matching: fuzzy string matching between parsed scheme names and AMFI scheme list |
| US-4.4 | On dashboard load, recalculate current_value using latest NAV × closing_units for each scheme |
| US-4.5 | Show "NAV as of [date]" indicator and "Refresh NAV" button |
| US-4.6 | Show daily change (today vs yesterday NAV) as green/red delta on each scheme |

**Dependencies:** V2 Chunk 4 (nav_history table and mfapi integration)

**Test:** Dashboard shows today's NAV values. Daily change shows green/red delta. "Last updated: today" visible.

---

## Chunk 5: Broker Integrations (Zerodha, Groww)

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-5.1 | Extend the data source abstraction from V2 Chunk 1 |
| US-5.2 | Add Zerodha Kite Connect API integration for pulling MF holdings |
| US-5.3 | Add Groww API integration for pulling MF holdings |
| US-5.4 | Auto-sync portfolio data periodically (daily or on-demand) |
| US-5.5 | Add sync status indicator and last sync timestamp on dashboard |

**Dependencies:** V2 Chunk 1 (data source abstraction), V3 Chunk 1 (multi-portfolio)

**Test:** Connect Zerodha account → holdings pulled and shown on dashboard. Re-sync updates values.

---

## Chunk 6: Overlap & Concentration Analysis

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-6.1 | Fetch top holdings for each scheme from free API or scraping |
| US-6.2 | Add `/dashboard/overlap` page — matrix view showing overlap % between each pair of schemes |
| US-6.3 | Show "Top Overlapping Stocks" — stocks appearing in 3+ user schemes |
| US-6.4 | Show "Sector Concentration" — identify overexposure to banking, IT, etc. |
| US-6.5 | Integrate overlap data into AI insights: "78% overlap between Fund A and Fund B — consider consolidating" |

**Dependencies:** V3 Chunk 4 (scheme code matching for fund data lookup)

**Test:** Overlap page shows matrix. Two similar large-cap funds show high overlap %. Sector chart shows concentration.

---

## Chunk 7: Notifications & Alerts

**Status:** Not Started

| Story | Description |
|-------|-------------|
| US-7.1 | Add `alerts` table: `id`, `user_id`, `type`, `config_json`, `is_active`, `created_at` |
| US-7.2 | Add `notifications` table: `id`, `user_id`, `alert_id`, `title`, `body`, `is_read`, `created_at` |
| US-7.3 | Add `/dashboard/alerts` page — configure alerts: portfolio value threshold, NAV drop >5%, SIP reminder |
| US-7.4 | Add notification bell icon in navbar with unread count badge |
| US-7.5 | Add notification dropdown showing recent alerts |
| US-7.6 | Daily Vercel cron job to check alert conditions against latest NAV data |
| US-7.7 | (Stretch) Email notifications via Resend free tier (100 emails/day) |

**Dependencies:** V3 Chunk 4 (real-time NAV for alert triggers)

**Test:** Set "notify when portfolio crosses Rs 20L" alert. NAV update pushes past threshold → notification appears in bell dropdown.

---

## Dependency Graph

```
1 (Multi-Portfolio) ──── first V3
2 (Tax) ──────────────── after V2.3
3 (Goals) ────────────── after V2.5, V3.1
4 (Real-Time NAV) ────── after V2.4
5 (Broker Integrations) ── after V2.1, V3.1
6 (Overlap) ──────────── after V3.4
7 (Notifications) ────── after V3.4
```

---

## Free Tier Feasibility

- **Supabase (500MB):** NAV history (~180K rows for 100 schemes over 5 years) fits comfortably
- **Vercel cron (free: 2 jobs):** Combine NAV fetch + alert check into one daily job
- **Zerodha Kite Connect:** Free for personal use (requires developer account)
- **Resend (email):** Free tier: 100 emails/day
- **No new paid services required**
