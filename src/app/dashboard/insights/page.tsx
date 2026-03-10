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
import { Sparkles, AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react";

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
    bg: string;
    badge: string;
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof Sparkles;
  }
> = {
  summary: {
    border: "border-l-chart-2",
    bg: "bg-chart-2/5",
    badge: "Summary",
    badgeVariant: "default",
    icon: Sparkles,
  },
  positive: {
    border: "border-l-chart-3",
    bg: "bg-chart-3/5",
    badge: "Positive",
    badgeVariant: "secondary",
    icon: CheckCircle2,
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    badge: "Warning",
    badgeVariant: "destructive",
    icon: AlertCircle,
  },
  suggestion: {
    border: "border-l-primary",
    bg: "bg-primary/5",
    badge: "Suggestion",
    badgeVariant: "outline",
    icon: Lightbulb,
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
          <h1 className="text-3xl font-semibold text-foreground">
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload a CAS statement first to get AI-powered insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered analysis and recommendations for your portfolio.
          </p>
        </div>
        <Button
          onClick={generateInsights}
          disabled={state === "loading"}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {state === "loading"
            ? "Analyzing..."
            : state === "done"
              ? "Regenerate"
              : "Generate Insights"}
        </Button>
      </div>

      {state === "idle" && (
        <Card className="border-dashed border-border/50 bg-card/40">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Ready to analyze your portfolio
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Click &quot;Generate Insights&quot; to get AI-powered
              recommendations based on your holdings and transactions.
            </p>
          </CardContent>
        </Card>
      )}

      {state === "loading" && (
        <Card className="bg-card/60">
          <CardContent className="py-16 text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium text-foreground">
              Analyzing your portfolio with AI...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few seconds.
            </p>
          </CardContent>
        </Card>
      )}

      {state === "error" && (
        <Card className="bg-card/60">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
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
            const IconComponent = style.icon;
            return (
              <Card
                key={i}
                className={`border-l-4 ${style.border} ${style.bg} bg-card/60`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-muted-foreground shrink-0" />
                      <CardTitle className="text-base font-medium">
                        {insight.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant={style.badgeVariant}>{style.badge}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {insight.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed ml-8">
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
