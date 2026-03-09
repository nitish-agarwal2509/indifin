import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ParsedCAS } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolioId, parsed }: { portfolioId: string; parsed: ParsedCAS } =
      await request.json();

    if (!portfolioId || !parsed) {
      return NextResponse.json(
        { error: "Missing portfolioId or parsed data" },
        { status: 400 }
      );
    }

    // Update portfolio with investor info
    const { error: updateError } = await supabase
      .from("portfolios")
      .update({
        investor_name: parsed.investor_name,
        pan: parsed.pan,
        email: parsed.email,
        cas_period_from: parsed.statement_from,
        cas_period_to: parsed.statement_to,
        total_invested: parsed.total_invested,
        total_current_value: parsed.total_current_value,
        total_gain_loss: parsed.total_gain_loss,
        portfolio_xirr: parsed.portfolio_xirr,
        is_parsed: true,
      })
      .eq("id", portfolioId);

    if (updateError) {
      console.error("Portfolio update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update portfolio" },
        { status: 500 }
      );
    }

    // Insert schemes and their transactions
    for (const scheme of parsed.schemes) {
      const { data: schemeData, error: schemeError } = await supabase
        .from("schemes")
        .insert({
          portfolio_id: portfolioId,
          scheme_name: scheme.scheme_name,
          folio_number: scheme.folio_number,
          amc: scheme.amc,
          category: scheme.category,
          registrar: scheme.registrar,
          closing_units: scheme.closing_units,
          closing_nav: scheme.closing_nav,
          closing_value: scheme.closing_value,
          cost_value: scheme.cost_value,
          gain_loss: scheme.gain_loss,
          xirr: scheme.xirr,
        })
        .select("id")
        .single();

      if (schemeError || !schemeData) {
        console.error("Scheme insert error:", schemeError);
        continue;
      }

      // Insert transactions for this scheme
      if (scheme.transactions.length > 0) {
        const txRows = scheme.transactions.map((tx) => ({
          scheme_id: schemeData.id,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          units: tx.units,
          nav: tx.nav,
        }));

        const { error: txError } = await supabase
          .from("transactions")
          .insert(txRows);

        if (txError) {
          console.error("Transaction insert error:", txError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Confirm error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
