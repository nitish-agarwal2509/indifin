import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiModel } from "@/lib/gemini";
import { withRetry } from "@/lib/retry";

const INSIGHTS_PROMPT = `You are an Indian mutual fund portfolio advisor. Analyze the following portfolio data and provide actionable insights.

Return ONLY a valid JSON array (no markdown, no code fences) of insight objects matching this schema:

[
  {
    "type": "summary" | "warning" | "suggestion" | "positive",
    "title": "Short title (5-10 words)",
    "description": "Detailed explanation (2-4 sentences)",
    "priority": "high" | "medium" | "low"
  }
]

Generate exactly 5-7 insights covering:
1. Overall portfolio health summary
2. Diversification analysis (are they too concentrated in one category?)
3. Any underperforming schemes (negative or very low returns)
4. Any outperforming schemes worth highlighting
5. Rebalancing suggestions if allocation is skewed
6. SIP consistency observations
7. Risk assessment based on category allocation

Rules:
- Be specific — reference actual scheme names and numbers from the data
- Use Indian financial terminology (lakhs, crores, XIRR, SIP, NAV)
- Be constructive and actionable, not generic
- If portfolio is well-diversified and performing well, acknowledge that
- Return ONLY the JSON array, nothing else

Portfolio Data:
`;

type SchemeData = {
  scheme_name: string;
  amc: string;
  category: string;
  cost_value: number;
  closing_value: number;
  gain_loss: number;
  xirr: number | null;
  transactions: { date: string; amount: number }[];
};

type PortfolioData = {
  investor_name: string;
  total_invested: number;
  total_current_value: number;
  total_gain_loss: number;
  portfolio_xirr: number | null;
  schemes: SchemeData[];
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolioId } = await request.json();
    if (!portfolioId) {
      return NextResponse.json(
        { error: "Missing portfolioId" },
        { status: 400 }
      );
    }

    // Fetch portfolio with schemes and transactions
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select(
        `
        investor_name, total_invested, total_current_value, total_gain_loss, portfolio_xirr,
        schemes (
          scheme_name, amc, category, cost_value, closing_value, gain_loss, xirr,
          transactions ( date, amount )
        )
      `
      )
      .eq("id", portfolioId)
      .single();

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const p = portfolio as unknown as PortfolioData;

    // Build a concise summary for the prompt
    const summary = {
      investor_name: p.investor_name,
      total_invested: p.total_invested,
      total_current_value: p.total_current_value,
      total_gain_loss: p.total_gain_loss,
      portfolio_xirr: p.portfolio_xirr,
      schemes: p.schemes.map((s) => ({
        scheme_name: s.scheme_name,
        amc: s.amc,
        category: s.category,
        cost_value: s.cost_value,
        closing_value: s.closing_value,
        gain_loss: s.gain_loss,
        xirr: s.xirr,
        transaction_count: s.transactions?.length || 0,
      })),
    };

    const result = await withRetry(
      () => geminiModel.generateContent(INSIGHTS_PROMPT + JSON.stringify(summary, null, 2)),
      3,
      2000
    );
    const text = result.response.text();

    // Clean response
    let jsonText = text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const insights = JSON.parse(jsonText);

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("Insights error:", err);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
