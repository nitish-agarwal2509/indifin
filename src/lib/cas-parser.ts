import { geminiModel } from "./gemini";
import { withRetry } from "./retry";
import type { ParsedCAS } from "./types";

const CAS_PARSE_PROMPT = `You are a financial document parser specialized in Indian Mutual Fund CAS statements.

You will receive extracted text from a Consolidated Account Statement (CAS) PDF. The CAS may come from:
- CAMS / KFintech (traditional SoA Holdings with folio-based MF data)
- MF Central (may have both "SoA Holdings" and "Demat Holdings" tabs)
- CDSL Demat CAS (securities held in demat form)

IMPORTANT: The text may contain repeated page headers, Hindi translations, and navigation labels — ignore all of these. Focus ONLY on the actual financial data.

Return ONLY a valid JSON object (no markdown, no code fences) matching this exact schema:

{
  "investor_name": "string",
  "pan": "string (masked, e.g. ABCPS****K)",
  "email": "string or empty string if not found",
  "statement_from": "YYYY-MM-DD",
  "statement_to": "YYYY-MM-DD",
  "schemes": [
    {
      "scheme_name": "string (clean fund name, e.g. 'Parag Parikh Flexi Cap Fund - Direct Plan Growth')",
      "folio_number": "string",
      "amc": "string (e.g. 'PPFAS Mutual Fund', 'ICICI Prudential Mutual Fund', 'Axis Mutual Fund')",
      "category": "equity | debt | hybrid | other",
      "registrar": "CAMS | KFintech | other",
      "closing_units": number,
      "closing_nav": number,
      "closing_value": number,
      "cost_value": number (sum of all purchase amounts minus absolute value of all redemption amounts),
      "gain_loss": number (closing_value minus cost_value),
      "xirr": number or null,
      "transactions": [
        {
          "date": "YYYY-MM-DD",
          "description": "string",
          "amount": number (positive for purchase, negative for redemption),
          "units": number (positive for purchase, negative for redemption),
          "nav": number
        }
      ]
    }
  ],
  "total_invested": number (sum of all schemes' cost_value),
  "total_current_value": number (sum of all schemes' closing_value),
  "total_gain_loss": number (total_current_value minus total_invested),
  "portfolio_xirr": null
}

Rules:
- Parse ALL mutual fund schemes found. Each scheme starts with AMC name, FOLIO NO, and scheme name.
- Look for "Closing Unit Balance:", "Nav as on", and "Valuation on" lines — these give you closing_units, closing_nav, and closing_value for each scheme.
- Look for "Opening Unit Balance:" to identify where a scheme's transaction section begins. Do NOT include Opening Balance as a transaction.
- For dates, convert DD-MON-YYYY (e.g. 02-MAR-2023) to YYYY-MM-DD (e.g. 2023-03-02)
- For amounts in parentheses like (421.90), these are negative (redemptions). Units in parentheses like (6.742) are also negative.
- Parse Indian number format: 9,99,950.00 → 999950.00, 7,85,726.92 → 785726.92, 1,13,06,796.87 → 11306796.87
- cost_value = sum of all purchase transaction amounts for that scheme (do NOT subtract redemptions from cost; treat cost as total money put in minus money taken out)
- Categorize: Flexi Cap/Small Cap/Mid Cap/Large Cap/Multi Cap/Index/Nifty 50 = "equity", ELSS = "equity", Corporate Bond/Liquid/Short Duration/Gilt/Money Market = "debt", Balanced/Hybrid/Dynamic Asset = "hybrid"
- If the CAS says "No Folios Found" for SoA Holdings, look in the Demat Holdings section instead
- Mask PAN: show first 4 and last character, replace middle with **** (e.g. AQTP****D)
- Return ONLY the JSON object, nothing else

CAS Text:
`;

/**
 * Preprocess raw CAS text to reduce noise before sending to AI.
 * Removes repeated headers, Hindi text, and page footers.
 */
function preprocessCASText(rawText: string): string {
  const lines = rawText.split("\n");
  const cleanedLines: string[] = [];
  const seenHeaders = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Skip page footers like "MFCentralDetailCAS_v1.2_..." or "Page X of Y"
    if (trimmed.startsWith("MFCentralDetailCAS") || /^Page \d+ of \d+$/.test(trimmed)) continue;

    // Skip repeated header lines (CDSL header, CAS title, etc.)
    if (
      trimmed.includes("Central Depository Services") ||
      trimmed.includes("CONSOLIDATED ACCOUNT STATEMENT") ||
      trimmed.includes("समेकित खाता विवरण") ||
      trimmed.includes("डीमैट फॉर्म") ||
      trimmed.includes("A Wing, 25th Floor") ||
      trimmed.includes("CIN : L67120MH1997PLC") ||
      trimmed.includes("Lower Parel")
    ) continue;

    // Skip purely Hindi lines (lines that are mostly Devanagari)
    const devanagariCount = (trimmed.match(/[\u0900-\u097F]/g) || []).length;
    if (devanagariCount > trimmed.length * 0.5 && trimmed.length > 10) continue;

    // Skip repeated navigation tab labels
    if (/^(SoA Holdings|Demat Holdings)\s*$/.test(trimmed)) continue;

    // Skip duplicate "Consolidated Account Statement" headers
    if (trimmed === "Consolidated Account Statement") {
      if (seenHeaders.has("cas_header")) continue;
      seenHeaders.add("cas_header");
    }

    // Skip repeated date range headers
    if (/^\(\s*From Date\s*:/.test(trimmed)) {
      if (seenHeaders.has("date_range")) continue;
      seenHeaders.add("date_range");
    }

    // Skip repeated column headers within the same section
    if (/^(Date\s+Transaction\s+Amount|Transaction\s+Amount\s*\(INR\)\s+Units\s+Price)/.test(trimmed)) {
      if (seenHeaders.has("col_header")) continue;
      seenHeaders.add("col_header");
    }

    cleanedLines.push(trimmed);
  }

  return cleanedLines.join("\n");
}

export async function parseCASText(rawText: string): Promise<ParsedCAS> {
  // Preprocess to reduce text size
  const cleanedText = preprocessCASText(rawText);

  // If text is still very long, truncate smartly — keep first 80K chars
  // (Gemini 2.5 Flash Lite supports up to 1M tokens, but shorter = more accurate)
  const maxChars = 80000;
  const textToSend = cleanedText.length > maxChars
    ? cleanedText.substring(0, maxChars) + "\n\n[TEXT TRUNCATED — parse what is available above]"
    : cleanedText;

  const result = await withRetry(
    () => geminiModel.generateContent(CAS_PARSE_PROMPT + textToSend),
    3,
    2000
  );
  const response = result.response;
  const text = response.text();

  // Clean the response - remove markdown code fences if present
  let jsonText = text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed: ParsedCAS = JSON.parse(jsonText);

  // Post-process: validate and fix common AI mistakes
  for (const scheme of parsed.schemes) {
    // Ensure closing_value is a reasonable number (not in lakhs format by mistake)
    if (scheme.closing_units && scheme.closing_nav && !scheme.closing_value) {
      scheme.closing_value = Math.round(scheme.closing_units * scheme.closing_nav * 100) / 100;
    }

    // Calculate cost_value from transactions if AI didn't compute it correctly
    if (scheme.transactions.length > 0) {
      const computedCost = scheme.transactions.reduce((sum, tx) => sum + tx.amount, 0);
      // Only override if AI gave 0 or a clearly wrong value
      if (!scheme.cost_value || scheme.cost_value === 0) {
        scheme.cost_value = Math.round(computedCost * 100) / 100;
      }
    }

    // Recalculate gain/loss
    if (scheme.closing_value && scheme.cost_value) {
      scheme.gain_loss = Math.round((scheme.closing_value - scheme.cost_value) * 100) / 100;
    }
  }

  // Recalculate totals
  parsed.total_current_value = parsed.schemes.reduce((s, sc) => s + (sc.closing_value || 0), 0);
  parsed.total_invested = parsed.schemes.reduce((s, sc) => s + (sc.cost_value || 0), 0);
  parsed.total_gain_loss = Math.round((parsed.total_current_value - parsed.total_invested) * 100) / 100;
  parsed.total_current_value = Math.round(parsed.total_current_value * 100) / 100;
  parsed.total_invested = Math.round(parsed.total_invested * 100) / 100;

  return parsed;
}
