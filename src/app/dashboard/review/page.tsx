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
          <h1 className="text-3xl font-bold">AI Parsing</h1>
          <p className="text-muted-foreground mt-1">
            Gemini is analyzing your CAS statement...
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Extracting portfolio data with AI...</p>
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
          <h1 className="text-3xl font-bold">Parsing Error</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
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
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium text-green-600">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Parsed Data</h1>
          <p className="text-muted-foreground mt-1">
            Verify the AI-extracted data before saving.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/upload")}
            disabled={state === "confirming"}
          >
            Re-upload
          </Button>
          <Button onClick={handleConfirm} disabled={state === "confirming"}>
            {state === "confirming" ? "Saving..." : "Confirm & Save"}
          </Button>
        </div>
      </div>

      {/* Investor Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{parsed.investor_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">PAN</p>
              <p className="font-medium">{parsed.pan}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Period</p>
              <p className="font-medium">
                {parsed.statement_from} to {parsed.statement_to}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{parsed.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-xl font-bold">{formatCurrency(parsed.total_invested)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-xl font-bold">{formatCurrency(parsed.total_current_value)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gain/Loss</p>
            <p className={`text-xl font-bold ${parsed.total_gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(parsed.total_gain_loss)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Portfolio XIRR</p>
            <p className="text-xl font-bold">
              {parsed.portfolio_xirr != null ? `${parsed.portfolio_xirr}%` : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schemes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Schemes ({parsed.schemes.length})
          </CardTitle>
          <CardDescription>Click a scheme to see its transactions</CardDescription>
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
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedScheme(expandedScheme === scheme.folio_number ? null : scheme.folio_number)
                    }
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{scheme.scheme_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {scheme.amc} &middot; Folio: {scheme.folio_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{scheme.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(scheme.cost_value)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(scheme.closing_value)}</TableCell>
                    <TableCell className={`text-right ${scheme.gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(scheme.gain_loss)}
                    </TableCell>
                    <TableCell className="text-right">
                      {scheme.xirr != null ? `${scheme.xirr}%` : "—"}
                    </TableCell>
                  </TableRow>
                  {expandedScheme === scheme.folio_number && (
                    <TableRow key={`${i}-txns`}>
                      <TableCell colSpan={6} className="bg-muted/30 p-4">
                        <p className="text-sm font-medium mb-2">
                          Transactions ({scheme.transactions.length})
                        </p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Units</TableHead>
                              <TableHead className="text-right">NAV</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scheme.transactions.map((tx, j) => (
                              <TableRow key={j}>
                                <TableCell className="text-xs">{tx.date}</TableCell>
                                <TableCell className="text-xs">{tx.description}</TableCell>
                                <TableCell className={`text-xs text-right ${tx.amount >= 0 ? "" : "text-red-600"}`}>
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
      <div className="flex justify-end gap-2 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/upload")}
          disabled={state === "confirming"}
        >
          Re-upload
        </Button>
        <Button onClick={handleConfirm} disabled={state === "confirming"}>
          {state === "confirming" ? "Saving..." : "Confirm & Save"}
        </Button>
      </div>
    </div>
  );
}
