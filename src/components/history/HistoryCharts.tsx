"use client";

import type { HistoryBucket } from "@/lib/history";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS_TICK = { fontSize: 11, fill: "#6b7885" };
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #e7ebef",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(10,24,38,0.08)",
};

export function HistoryCharts({ buckets }: { buckets: HistoryBucket[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartCard title="Incidents">
        <BarChart data={buckets} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke="#e7ebef" />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={18}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip cursor={{ fill: "#00b1eb14" }} contentStyle={TOOLTIP_STYLE} />
          <Bar
            dataKey="incidentCount"
            name="incidents"
            fill="#00b1eb"
            radius={[4, 4, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ChartCard>

      <ChartCard title="Durée de perturbation cumulée (h)">
        <AreaChart data={buckets} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="durationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e50040" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#e50040" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e7ebef" />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={18}
          />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="disruptionHours"
            name="heures"
            stroke="#e50040"
            strokeWidth={2}
            fill="url(#durationFill)"
          />
        </AreaChart>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-paper-2 bg-white p-4">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/40">{title}</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
