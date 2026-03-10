"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { date: string; portfolio: number; nifty: number };

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function ComparisonChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No comparison data available
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
          stroke="rgba(255,255,255,0.1)"
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
          tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
          stroke="rgba(255,255,255,0.1)"
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(167, 139, 250, 0.2)",
            borderRadius: "12px",
            color: "#fafafa",
          }}
          formatter={(value, name) => [
            formatCurrency(Number(value)),
            name === "portfolio" ? "Your Portfolio" : "Nifty 50 Equivalent",
          ]}
          labelFormatter={(label) => formatDate(String(label))}
        />
        <Legend
          formatter={(value) =>
            value === "portfolio" ? "Your Portfolio" : "Nifty 50 Equivalent"
          }
          wrapperStyle={{ color: "rgba(161, 161, 170)" }}
        />
        <Line
          type="monotone"
          dataKey="portfolio"
          stroke="#a78bfa"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="nifty"
          stroke="#fbbf24"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
