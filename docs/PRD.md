# IndiFin — Product Requirements Document

> Indian Personal Finance Portfolio Tracker

## Context

Indian mutual fund investors lack a simple way to see how their portfolio performs against the market (Nifty 50). Currently, they must manually track returns across multiple AMCs. IndiFin solves this by letting users upload their CAS (Consolidated Account Statement) PDF, using AI to parse it, and showing a clear comparison of their portfolio performance vs Nifty 50 — with AI-powered insights.

---

## 1. Problem Statement

- Mutual fund investors in India receive CAS PDFs from CAMS/KFintech but have no easy way to analyze portfolio performance holistically
- Comparing personal returns against a benchmark (Nifty 50) requires manual effort and financial knowledge
- Existing tools are either paid, cluttered, or require manual data entry

## 2. Target Users

- Indian retail mutual fund investors
- Users who receive CAS statements from CAMS or KFintech
- Multi-user public product with authentication

## 3. Core Features

### 3.1 PDF Upload & AI Parsing

- **Upload**: User uploads CAS PDF (from CAMS/KFintech)
- **AI Extraction**: Parse the PDF to extract:
  - Investor name, PAN (masked), email
  - List of mutual fund schemes with folio numbers
  - Transaction history (purchase, redemption, SIP, switch)
  - Current NAV and units held per scheme
  - Scheme categories (equity, debt, hybrid, etc.)
- **Validation**: Show parsed data to user for confirmation before saving
- **Storage**: Persist parsed portfolio data in database

### 3.2 Portfolio Dashboard

- **Holdings Overview**: Table of all schemes with current value, invested amount, returns (absolute & %)
- **Asset Allocation**: Pie chart showing equity/debt/hybrid/other split
- **Fund-level Details**: Individual fund performance, XIRR, invested vs current value

### 3.3 Portfolio vs Nifty 50 Comparison

- **Time-series Chart**: Portfolio value over time vs equivalent investment in Nifty 50
- **XIRR Comparison**: Portfolio XIRR vs Nifty 50 XIRR over same period
- **SIP Simulation**: "If you had invested the same SIPs in Nifty 50 index fund, you'd have ₹X"
- **Rolling Returns**: Compare rolling 1Y, 3Y, 5Y returns

### 3.4 AI-Powered Insights

- **Performance Summary**: Natural language summary of portfolio health
- **Underperformer Alerts**: Funds consistently underperforming their category benchmark
- **Overlap Analysis**: Identify overlapping stocks across funds
- **Rebalancing Suggestions**: Recommend allocation changes based on goals/risk
- **Expense Ratio Analysis**: Flag high-expense-ratio funds with cheaper alternatives

## 4. Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Next.js 14+ (App Router) | Free |
| Deployment | Vercel (free tier) | Free |
| UI | Tailwind CSS + shadcn/ui | Free |
| Database + Auth | Supabase (free tier — 500MB DB, 50K MAU auth) | Free |
| PDF Parsing | pdf-parse (npm) + AI structured extraction | Free |
| AI | Google Gemini 1.5 Flash (free tier: 15 RPM, 1M tokens/day) | Free |
| Charts | Recharts | Free |
| Nifty 50 Data | Yahoo Finance API (yfinance) / mfapi.in | Free |
| MF NAV Data | AMFI NAV API (amfiindia.com) | Free |

### Key API Sources (Free)

- **AMFI India** (`https://www.amfiindia.com/spages/NAVAll.txt`) — daily NAV for all MF schemes
- **mfapi.in** — historical NAV data per scheme (REST API, no auth needed)
- **Yahoo Finance** (`^NSEI` ticker) — Nifty 50 historical data

## 5. User Flow

```
1. Land on homepage → Sign up / Log in (Supabase Auth - Google/Email)
2. Upload CAS PDF
3. AI parses PDF → Shows extracted data for review
4. User confirms → Data saved to DB
5. Dashboard loads:
   a. Holdings overview
   b. Asset allocation chart
   c. Portfolio vs Nifty 50 performance chart
   d. AI insights panel
6. User can re-upload newer CAS to update portfolio
```

## 6. Data Model (Supabase/PostgreSQL)

### users (managed by Supabase Auth)

### portfolios
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| uploaded_at | timestamp | Upload timestamp |
| cas_period_from | date | CAS statement start date |
| cas_period_to | date | CAS statement end date |
| raw_text | text | Extracted PDF text |

### schemes
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| portfolio_id | uuid | FK to portfolios |
| scheme_name | text | Full scheme name |
| scheme_code | text | AMFI scheme code |
| folio_number | text | Folio number |
| category | text | equity/debt/hybrid/other |
| current_units | decimal | Units held |
| current_nav | decimal | Latest NAV |
| current_value | decimal | Current market value |

### transactions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| scheme_id | uuid | FK to schemes |
| date | date | Transaction date |
| type | text | purchase/redeem/switch |
| amount | decimal | Transaction amount (₹) |
| units | decimal | Units transacted |
| nav | decimal | NAV at transaction |

### ai_insights
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| portfolio_id | uuid | FK to portfolios |
| generated_at | timestamp | When insight was generated |
| insight_type | text | summary/underperformer/overlap/rebalance |
| content_json | jsonb | Structured insight data |

## 7. AI Integration Details

### PDF Parsing Prompt Strategy
1. Extract raw text from PDF using `pdf-parse`
2. Send to Gemini 1.5 Flash with structured prompt:
   - "Extract all mutual fund holdings and transactions from this CAS statement"
   - Request JSON output with defined schema
   - Include few-shot examples for CAS format
3. Gemini free tier limits: 15 requests/min, 1M tokens/day — sufficient for moderate usage

### Insights Generation
- After parsing, fetch historical NAV data for each scheme
- Calculate XIRR, returns, allocation
- Send portfolio summary + Nifty 50 comparison to Gemini
- Request insights in structured JSON format

## 8. Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with product info + CTA |
| `/login` | Auth page (Google + Email/Password) |
| `/dashboard` | Main portfolio dashboard |
| `/dashboard/upload` | PDF upload + parsing flow |
| `/dashboard/compare` | Portfolio vs Nifty 50 detailed comparison |
| `/dashboard/insights` | AI insights and recommendations |

## 9. MVP Scope

**In scope (v1):**
- CAS PDF upload and AI parsing
- Holdings overview with current values
- Basic portfolio vs Nifty 50 chart (total value over time)
- XIRR calculation (portfolio-level)
- AI summary + top 3 insights
- Google auth

**Out of scope (v2+):**
- Multiple portfolio support
- Goal-based planning
- Tax harvesting suggestions
- Real-time NAV updates
- Mobile app
- PDF auto-fetch from email

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Vercel free tier 10s function timeout | Use streaming for AI calls; break parsing into chunks |
| CAS PDF format varies | Build robust prompt with multiple CAS format examples |
| AI parsing errors | Show parsed data for user confirmation; allow manual edits |
| Gemini free tier rate limits | Cache insights; batch requests; queue during peak usage |
| AMFI scheme code matching | Use fuzzy matching on scheme names + AMFI code lookup |
