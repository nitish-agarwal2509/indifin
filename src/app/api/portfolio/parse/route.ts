import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCASText } from "@/lib/cas-parser";

export const maxDuration = 60;

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

    // Fetch the portfolio's raw text
    const { data: portfolio, error: fetchError } = await supabase
      .from("portfolios")
      .select("raw_text")
      .eq("id", portfolioId)
      .single();

    if (fetchError || !portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Parse with Gemini
    const parsed = await parseCASText(portfolio.raw_text);

    return NextResponse.json({ parsed });
  } catch (err) {
    console.error("AI parsing error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to parse CAS with AI",
      },
      { status: 500 }
    );
  }
}
