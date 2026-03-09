"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from "@supabase/ssr";

type Insight = {
  type: "summary" | "warning" | "suggestion" | "positive";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
};

type InsightState = "idle" | "loading" | "done" | "error";

const typeStyles: Record<
  string,
  {
    border: string;
    badge: string;
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  summary: {
    border: "border-l-blue-500",
    badge: "Summary",
    badgeVariant: "default",
  },
  positive: {
    border: "border-l-green-500",
    badge: "Positive",
    badgeVariant: "secondary",
  },
  warning: {
    border: "border-l-yellow-500",
    badge: "Warning",
    badgeVariant: "destructive",
  },
  suggestion: {
    border: "border-l-purple-500",
    badge: "Suggestion",
    badgeVariant: "outline",
  },
};

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function InsightsPage() {
  const [state, setState] = useState<InsightState>("idle");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState("");
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("portfolios")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_parsed", true)
        .order("uploaded_at", { ascending: false })
        .limit(1);

      if (data?.[0]) {
        setPortfolioId(data[0].id);
      }
    }
    fetchPortfolio();
  }, []);

  async function generateInsights() {
    if (!portfolioId) return;
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/portfolio/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate insights");
      }

      const data = await res.json();
      const sorted = (data.insights as Insight[]).sort(
        (a, b) =>
          (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
      );
      setInsights(sorted);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (!portfolioId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            Upload a CAS statement first to get AI-powered insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis and recommendations for your portfolio.
          </p>
        </div>
        <Button onClick={generateInsights} disabled={state === "loading"}>
          {state === "loading"
            ? "Analyzing..."
            : state === "done"
              ? "Regenerate"
              : "Generate Insights"}
        </Button>
      </div>

      {state === "idle" && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium">
              Ready to analyze your portfolio
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Click &quot;Generate Insights&quot; to get AI-powered
              recommendations based on your holdings and transactions.
            </p>
          </CardContent>
        </Card>
      )}

      {state === "loading" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">
              Analyzing your portfolio with AI...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few seconds.
            </p>
          </CardContent>
        </Card>
      )}

      {state === "error" && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={generateInsights}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {state === "done" && insights.length > 0 && (
        <div className="grid gap-4">
          {insights.map((insight, i) => {
            const style = typeStyles[insight.type] || typeStyles.summary;
            return (
              <Card key={i} className={`border-l-4 ${style.border}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {insight.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={style.badgeVariant}>
                        {style.badge}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {insight.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
