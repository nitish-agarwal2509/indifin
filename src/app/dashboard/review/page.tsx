"use client";

import { Fragment, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
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
import type { ParsedCAS } from "@/lib/types";
import { CheckCircle2, AlertCircle, Cpu } from "lucide-react";

type ReviewState = "parsing" | "review" | "confirming" | "confirmed" | "error";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const portfolioId = searchParams.get("id");

  const [state, setState] = useState<ReviewState>("parsing");
  const [parsed, setParsed] = useState<ParsedCAS | null>(null);
  const [error, setError] = useState("");
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId) {
      setError("No portfolio ID provided");
      setState("error");
      return;
    }

    async function parse() {
      try {
        const res = await fetch("/api/portfolio/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "AI parsing failed");
        }

        const data = await res.json();
        setParsed(data.parsed);
        setState("review");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Parsing failed");
        setState("error");
      }
    }

    parse();
  }, [portfolioId]);

  async function handleConfirm() {
    if (!parsed || !portfolioId) return;
    setState("confirming");

    try {
      const res = await fetch("/api/portfolio/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId, parsed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setState("confirmed");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setState("error");
    }
  }

  if (state === "parsing") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">AI Parsing</h1>
          <p className="text-muted-foreground mt-2">
            Gemini is analyzing your CAS statement...
          </p>
        </div>
        <Card className="bg-card/60">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Cpu className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <Spinner className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium text-foreground">
              Extracting portfolio data with AI...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take 10-20 seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Parsing Error
          </h1>
        </div>
        <Card className="bg-card/60">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/upload")}
            >
              Try uploading again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "confirmed") {
    return (
      <Card className="bg-card/60">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-3/10">
            <CheckCircle2 className="h-8 w-8 text-chart-3" />
          </div>
          <p className="text-lg font-medium text-foreground">
            Portfolio data saved successfully!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!parsed) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Review Parsed Data
          </h1>
          <p className="text-muted-foreground mt-2">
            Verify the AI-extracted data before saving.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/upload")}
            disabled={state === "confirming"}
          >
            Re-upload
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={state === "confirming"}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {state === "confirming" ? "Saving..." : "Confirm & Save"}
          </Button>
        </div>
      </div>

      {/* Investor Info */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Investor Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">
                Name
              </p>
              <p className="font-medium text-foreground mt-1">
                {parsed.investor_name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">
                PAN
              </p>
              <p className="font-medium text-foreground mt-1">{parsed.pan}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">
                Period
              </p>
              <p className="font-medium text-foreground mt-1">
                {parsed.statement_from} to {parsed.statement_to}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">
                Email
              </p>
              <p className="font-medium text-foreground mt-1">{parsed.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(parsed.total_invested)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(parsed.total_current_value)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gain/Loss</p>
            <p
              className={`text-xl font-semibold ${parsed.total_gain_loss >= 0 ? "text-chart-3" : "text-destructive"}`}
            >
              {formatCurrency(parsed.total_gain_loss)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Portfolio XIRR</p>
            <p className="text-xl font-semibold text-primary">
              {parsed.portfolio_xirr != null
                ? `${parsed.portfolio_xirr}%`
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schemes Table */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Schemes ({parsed.schemes.length})
          </CardTitle>
          <CardDescription>
            Click a scheme to see its transactions
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
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">XIRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.schemes.map((scheme, i) => (
                  <Fragment key={i}>
                    <TableRow
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() =>
                        setExpandedScheme(
                          expandedScheme === scheme.folio_number
                            ? null
                            : scheme.folio_number
                        )
                      }
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {scheme.scheme_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {scheme.amc} &middot; Folio: {scheme.folio_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{scheme.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(scheme.cost_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(scheme.closing_value)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${scheme.gain_loss >= 0 ? "text-chart-3" : "text-destructive"}`}
                      >
                        {formatCurrency(scheme.gain_loss)}
                      </TableCell>
                      <TableCell className="text-right">
                        {scheme.xirr != null ? (
                          <span className="text-primary">{scheme.xirr}%</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedScheme === scheme.folio_number && (
                      <TableRow key={`${i}-txns`}>
                        <TableCell colSpan={6} className="bg-accent/30 p-4">
                          <p className="text-sm font-medium mb-3 text-foreground">
                            Transactions ({scheme.transactions.length})
                          </p>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                  Amount
                                </TableHead>
                                <TableHead className="text-right">
                                  Units
                                </TableHead>
                                <TableHead className="text-right">NAV</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {scheme.transactions.map((tx, j) => (
                                <TableRow key={j}>
                                  <TableCell className="text-xs">
                                    {tx.date}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {tx.description}
                                  </TableCell>
                                  <TableCell
                                    className={`text-xs text-right ${tx.amount >= 0 ? "" : "text-destructive"}`}
                                  >
                                    {formatCurrency(tx.amount)}
                                  </TableCell>
                                  <TableCell className="text-xs text-right">
                                    {tx.units.toFixed(3)}
                                  </TableCell>
                                  <TableCell className="text-xs text-right">
                                    {tx.nav.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom confirm bar */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/upload")}
          disabled={state === "confirming"}
        >
          Re-upload
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={state === "confirming"}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {state === "confirming" ? "Saving..." : "Confirm & Save"}
        </Button>
      </div>
    </div>
  );
}
