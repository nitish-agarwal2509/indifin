"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#34d399", "#22d3ee", "#a78bfa", "#fbbf24", "#fb923c", "#f472b6"];

type AllocationData = { name: string; value: number };

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AllocationChart({ data }: { data: AllocationData[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data</p>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="rgba(255,255,255,0.05)"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span>{d.name}</span>
            </div>
            <span className="text-muted-foreground">
              {formatCurrency(d.value)} ({((d.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
