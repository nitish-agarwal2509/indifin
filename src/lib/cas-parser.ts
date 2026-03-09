import { geminiModel } from "./gemini";
import { withRetry } from "./retry";
import type { ParsedCAS } from "./types";

const CAS_PARSE_PROMPT = `You are a financial document parser. Extract structured data from the following Indian Mutual Fund Consolidated Account Statement (CAS) text.

Return ONLY a valid JSON object (no markdown, no code fences) matching this exact schema:

{
  "investor_name": "string",
  "pan": "string (masked, e.g. ABCPS****K)",
  "email": "string",
  "statement_from": "YYYY-MM-DD",
  "statement_to": "YYYY-MM-DD",
  "schemes": [
    {
      "scheme_name": "string (full scheme name)",
      "folio_number": "string",
      "amc": "string (e.g. HDFC Mutual Fund)",
      "category": "equity | debt | hybrid | other",
      "registrar": "CAMS | KFintech | other",
      "closing_units": number,
      "closing_nav": number,
      "closing_value": number,
      "cost_value": number,
      "gain_loss": number,
      "xirr": number or null (as percentage, e.g. 18.42 for 18.42%),
      "transactions": [
        {
          "date": "YYYY-MM-DD",
          "description": "string (e.g. Systematic Investment, Purchase, Redemption)",
          "amount": number (positive for purchase, negative for redemption),
          "units": number (positive for purchase, negative for redemption),
          "nav": number
        }
      ]
    }
  ],
  "total_invested": number,
  "total_current_value": number,
  "total_gain_loss": number,
  "portfolio_xirr": number or null
}

Rules:
- Parse ALL schemes and ALL transactions found in the statement
- For dates, convert from DD-Mon-YYYY (e.g. 15-Apr-2023) to YYYY-MM-DD (e.g. 2023-04-15)
- For amounts, parse Indian number format (e.g. 2,56,284.50 → 256284.50)
- Opening Balance entries should NOT be included as transactions
- Categorize schemes: Large Cap/Mid Cap/Small Cap/Flexi Cap/Multi Cap/Index = equity, ELSS = equity, Liquid/Short Duration/Gilt = debt, Balanced/Hybrid = hybrid
- If XIRR is not mentioned, set it to null
- Mask PAN: show first 4 and last character, replace middle with ****
- Return ONLY the JSON object, nothing else

CAS Text:
`;

export async function parseCASText(rawText: string): Promise<ParsedCAS> {
  const result = await withRetry(
    () => geminiModel.generateContent(CAS_PARSE_PROMPT + rawText),
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
  return parsed;
}
