import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { AllocationChart } from "@/components/allocation-chart";
import { calculateXIRR, buildCashFlows } from "@/lib/xirr";
import { Upload, TrendingUp, TrendingDown } from "lucide-react";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPercent(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

type TransactionRow = {
  date: string;
  amount: number;
};

type SchemeRow = {
  id: string;
  scheme_name: string;
  folio_number: string;
  amc: string;
  category: string;
  closing_units: number;
  closing_nav: number;
  closing_value: number;
  cost_value: number;
  gain_loss: number;
  xirr: number | null;
  transactions: TransactionRow[];
};

type PortfolioRow = {
  id: string;
  investor_name: string;
  pan: string;
  total_invested: number;
  total_current_value: number;
  total_gain_loss: number;
  portfolio_xirr: number | null;
  cas_period_from: string;
  cas_period_to: string;
  uploaded_at: string;
  schemes: SchemeRow[];
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch latest parsed portfolio with schemes and transactions
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select(
      `
      id, investor_name, pan, total_invested, total_current_value,
      total_gain_loss, portfolio_xirr, cas_period_from, cas_period_to, uploaded_at,
      schemes (
        id, scheme_name, folio_number, amc, category,
        closing_units, closing_nav, closing_value, cost_value, gain_loss, xirr,
        transactions ( date, amount )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("is_parsed", true)
    .order("uploaded_at", { ascending: false })
    .limit(1);

  const portfolio = portfolios?.[0] ?? null;

  if (!portfolio) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Portfolio Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload your CAS statement to get started.
          </p>
        </div>
        <Card className="border-dashed border-border/50 bg-card/40">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">No portfolio data yet</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Upload your Consolidated Account Statement (CAS) PDF to see your
              portfolio analysis and Nifty 50 comparison.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Link href="/dashboard/upload">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                Upload CAS PDF
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const p = portfolio as unknown as PortfolioRow;
  const schemes = p.schemes || [];
  const totalReturnPct =
    p.total_invested > 0
      ? ((p.total_current_value - p.total_invested) / p.total_invested) * 100
      : 0;

  // Calculate XIRR per scheme from transactions
  const schemesWithXirr = schemes.map((s) => {
    const txs = s.transactions || [];
    if (txs.length === 0 || !s.closing_value) {
      return { ...s, calculatedXirr: s.xirr };
    }
    const cashFlows = buildCashFlows(txs, s.closing_value);
    const xirr = calculateXIRR(cashFlows);
    return {
      ...s,
      calculatedXirr: xirr != null ? Math.round(xirr * 10000) / 100 : s.xirr,
    };
  });

  // Calculate portfolio-level XIRR from all transactions
  const allTxs = schemes.flatMap((s) => s.transactions || []);
  let portfolioXirr = p.portfolio_xirr;
  if (allTxs.length > 0 && p.total_current_value > 0) {
    const allCashFlows = buildCashFlows(allTxs, p.total_current_value);
    const computed = calculateXIRR(allCashFlows);
    if (computed != null) {
      portfolioXirr = Math.round(computed * 10000) / 100;
    }
  }

  // Compute allocation by category
  const allocationMap: Record<string, number> = {};
  for (const s of schemes) {
    const cat = s.category || "other";
    allocationMap[cat] = (allocationMap[cat] || 0) + (s.closing_value || 0);
  }
  const allocation = Object.entries(allocationMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Portfolio Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            {p.investor_name} &middot; PAN: {p.pan} &middot; Period:{" "}
            {p.cas_period_from} to {p.cas_period_to}
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button
            variant="outline"
            className="border-border/50 hover:border-primary/30 hover:bg-primary/5"
          >
            Upload New CAS
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(p.total_invested)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(p.total_current_value)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
            <div className="flex items-center gap-2">
              <p
                className={`text-2xl font-semibold ${p.total_gain_loss >= 0 ? "text-chart-3" : "text-destructive"}`}
              >
                {formatCurrency(p.total_gain_loss)}
              </p>
              {p.total_gain_loss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-chart-3" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p
              className={`text-xs mt-1 ${totalReturnPct >= 0 ? "text-chart-3" : "text-destructive"}`}
            >
              {formatPercent(totalReturnPct)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Portfolio XIRR</p>
            <p
              className={`text-2xl font-semibold ${portfolioXirr != null && portfolioXirr >= 0 ? "text-primary" : portfolioXirr != null ? "text-destructive" : "text-foreground"}`}
            >
              {portfolioXirr != null ? `${portfolioXirr}%` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Time-weighted returns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table + Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <Card className="lg:col-span-2 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Holdings ({schemes.length})
            </CardTitle>
            <CardDescription>
              Your mutual fund schemes with calculated XIRR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheme</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Invested</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Returns</TableHead>
                  <TableHead className="text-right">XIRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemesWithXirr.map((s) => {
                  const returnPct =
                    s.cost_value > 0
                      ? ((s.closing_value - s.cost_value) / s.cost_value) * 100
                      : 0;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {s.scheme_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.amc} &middot; Folio: {s.folio_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(s.cost_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(s.closing_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            s.gain_loss >= 0
                              ? "text-chart-3"
                              : "text-destructive"
                          }
                        >
                          {formatCurrency(s.gain_loss)}
                        </span>
                        <p
                          className={`text-xs ${returnPct >= 0 ? "text-chart-3" : "text-destructive"}`}
                        >
                          {formatPercent(returnPct)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {s.calculatedXirr != null ? (
                          <span
                            className={
                              s.calculatedXirr >= 0
                                ? "text-primary"
                                : "text-destructive"
                            }
                          >
                            {s.calculatedXirr}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation Pie Chart */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Asset Allocation
            </CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            <AllocationChart data={allocation} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
