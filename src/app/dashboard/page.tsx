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
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Upload your CAS statement to get started.
          </p>
        </div>
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No portfolio data yet</CardTitle>
            <CardDescription>
              Upload your Consolidated Account Statement (CAS) PDF to see your
              portfolio analysis and Nifty 50 comparison.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard/upload">
              <Button>Upload CAS PDF</Button>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {p.investor_name} &middot; PAN: {p.pan} &middot; Period:{" "}
            {p.cas_period_from} to {p.cas_period_to}
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button variant="outline">Upload New CAS</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-2xl font-bold">
              {formatCurrency(p.total_invested)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-2xl font-bold">
              {formatCurrency(p.total_current_value)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
            <p
              className={`text-2xl font-bold ${p.total_gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(p.total_gain_loss)}
            </p>
            <p
              className={`text-xs ${totalReturnPct >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatPercent(totalReturnPct)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Portfolio XIRR</p>
            <p
              className={`text-2xl font-bold ${portfolioXirr != null && portfolioXirr >= 0 ? "text-green-600" : portfolioXirr != null ? "text-red-600" : ""}`}
            >
              {portfolioXirr != null ? `${portfolioXirr}%` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">Calculated</p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table + Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Holdings ({schemes.length})
            </CardTitle>
            <CardDescription>
              Your mutual fund schemes with calculated XIRR
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(s.gain_loss)}
                        </span>
                        <p
                          className={`text-xs ${returnPct >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatPercent(returnPct)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {s.calculatedXirr != null ? (
                          <span
                            className={
                              s.calculatedXirr >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {s.calculatedXirr}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Asset Allocation Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset Allocation</CardTitle>
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
