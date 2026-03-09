import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { ComparisonChart } from "@/components/comparison-chart";
import {
  fetchNiftyHistory,
  simulateNiftyPortfolio,
  buildComparisonTimeSeries,
} from "@/lib/nifty";
import { calculateXIRR, buildCashFlows } from "@/lib/xirr";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

type TransactionRow = { date: string; amount: number };
type SchemeRow = {
  id: string;
  closing_value: number;
  transactions: TransactionRow[];
};
type PortfolioRow = {
  id: string;
  total_invested: number;
  total_current_value: number;
  cas_period_from: string;
  cas_period_to: string;
  schemes: SchemeRow[];
};

export default async function ComparePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select(
      `
      id, total_invested, total_current_value, cas_period_from, cas_period_to,
      schemes (
        id, closing_value,
        transactions ( date, amount )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("is_parsed", true)
    .order("uploaded_at", { ascending: false })
    .limit(1);

  const portfolio = (portfolios?.[0] ?? null) as unknown as PortfolioRow | null;

  if (!portfolio) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Portfolio vs Nifty 50</h1>
          <p className="text-muted-foreground mt-1">
            Upload a CAS statement first to compare your portfolio.
          </p>
        </div>
      </div>
    );
  }

  // Gather all transactions
  const allTxs = portfolio.schemes.flatMap((s) => s.transactions || []);
  if (allTxs.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Portfolio vs Nifty 50</h1>
          <p className="text-muted-foreground mt-1">No transaction data found.</p>
        </div>
      </div>
    );
  }

  const sortedTxs = [...allTxs].sort((a, b) => a.date.localeCompare(b.date));
  const earliestDate = new Date(sortedTxs[0].date);
  const latestDate = new Date();

  // Fetch Nifty 50 historical data
  let niftyData;
  let error = "";
  try {
    niftyData = await fetchNiftyHistory(earliestDate, latestDate);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch Nifty data";
  }

  if (!niftyData || niftyData.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Portfolio vs Nifty 50</h1>
          <p className="text-destructive mt-1">
            {error || "Could not fetch Nifty 50 data. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  // Simulate Nifty portfolio
  const niftyResult = simulateNiftyPortfolio(sortedTxs, niftyData);

  // Calculate portfolio XIRR
  const portfolioFlows = buildCashFlows(allTxs, portfolio.total_current_value);
  const portfolioXirr = calculateXIRR(portfolioFlows);
  const portfolioXirrPct =
    portfolioXirr != null ? Math.round(portfolioXirr * 10000) / 100 : null;

  // Calculate Nifty XIRR
  const niftyFlows = buildCashFlows(
    niftyResult.niftyXirrFlows,
    niftyResult.currentValue
  );
  const niftyXirr = calculateXIRR(niftyFlows);
  const niftyXirrPct =
    niftyXirr != null ? Math.round(niftyXirr * 10000) / 100 : null;

  // Build comparison time series
  const chartData = buildComparisonTimeSeries(
    sortedTxs,
    niftyData,
    portfolio.total_current_value,
    portfolio.cas_period_from,
    portfolio.cas_period_to
  );

  const portfolioBetter =
    portfolio.total_current_value > niftyResult.currentValue;
  const diff = Math.abs(
    portfolio.total_current_value - niftyResult.currentValue
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio vs Nifty 50</h1>
        <p className="text-muted-foreground mt-1">
          What if you had invested the same amounts in a Nifty 50 index fund?
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Your Portfolio</p>
            <p className="text-2xl font-bold text-cyan-400">
              {formatCurrency(portfolio.total_current_value)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              XIRR:{" "}
              <span
                className={
                  portfolioXirrPct != null && portfolioXirrPct >= 0
                    ? "text-emerald-400 font-medium"
                    : "text-rose-400 font-medium"
                }
              >
                {portfolioXirrPct != null ? `${portfolioXirrPct}%` : "N/A"}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Nifty 50 Equivalent
            </p>
            <p className="text-2xl font-bold text-amber-400">
              {formatCurrency(niftyResult.currentValue)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              XIRR:{" "}
              <span
                className={
                  niftyXirrPct != null && niftyXirrPct >= 0
                    ? "text-emerald-400 font-medium"
                    : "text-rose-400 font-medium"
                }
              >
                {niftyXirrPct != null ? `${niftyXirrPct}%` : "N/A"}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Difference</p>
            <p
              className={`text-2xl font-bold ${portfolioBetter ? "text-emerald-400" : "text-rose-400"}`}
            >
              {portfolioBetter ? "+" : "-"}
              {formatCurrency(diff)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {portfolioBetter
                ? "Your portfolio is ahead"
                : "Nifty 50 would have done better"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Comparison</CardTitle>
          <CardDescription>
            Your portfolio value vs same investments in Nifty 50 over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonChart data={chartData} />
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How this works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            For each of your mutual fund transactions (SIPs, lump sums,
            redemptions), we simulate making the same investment in a Nifty 50
            index fund on the same date.
          </p>
          <p>
            The Nifty 50 equivalent value shows what your portfolio would be
            worth today if all your investments had gone into a Nifty 50 index
            fund instead.
          </p>
          <p>
            XIRR (Extended Internal Rate of Return) accounts for the timing and
            size of each cash flow, giving you a true annualized return
            comparison.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
