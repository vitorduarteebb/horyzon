"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { name: string; count: number };

export function ReportsCharts({ payload }: { payload: Row[] }) {
  if (payload.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sem dados para esta visão.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={payload} margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal className="opacity-35" vertical={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={payload.some((r) => r.name.length > 18) ? 140 : 100} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [`${value ?? ""}`, "quantidade"]} />
        <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 8, 8]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
