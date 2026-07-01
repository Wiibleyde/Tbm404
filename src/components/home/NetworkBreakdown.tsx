"use client";

import { MODE_COLOR, MODE_LABEL, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/lines";
import type { ModeBreakdown, SeverityBreakdown } from "@/lib/status";
import { motion } from "motion/react";

interface NetworkBreakdownProps {
  byMode: ModeBreakdown[];
  bySeverity: SeverityBreakdown[];
}

export function NetworkBreakdown({ byMode, bySeverity }: NetworkBreakdownProps) {
  if (byMode.length === 0) return null;

  const incidentTotal = bySeverity.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Panel title="Par type de transport">
        {byMode.map((entry) => (
          <Row
            key={entry.mode}
            label={MODE_LABEL[entry.mode]}
            color={MODE_COLOR[entry.mode]}
            fraction={entry.ratio}
            value={`${Math.round(entry.ratio * 100)}%`}
            hint={`${entry.disruptedLines}/${entry.totalLines}`}
          />
        ))}
      </Panel>

      <Panel title="Par gravité">
        {incidentTotal === 0 ? (
          <p className="py-2 text-sm text-ink/40">Aucun incident en cours.</p>
        ) : (
          bySeverity.map((entry) => (
            <Row
              key={entry.severity}
              label={SEVERITY_LABEL[entry.severity]}
              color={SEVERITY_COLOR[entry.severity]}
              fraction={incidentTotal > 0 ? entry.count / incidentTotal : 0}
              value={String(entry.count)}
            />
          ))
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-paper-2 bg-white p-5">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/40">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Row({
  label,
  color,
  fraction,
  value,
  hint,
}: {
  label: string;
  color: string;
  fraction: number;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium text-ink">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="font-mono tabular-nums text-ink/60">
          <span className="font-semibold text-ink">{value}</span>
          {hint && <span className="ml-1.5 text-xs text-ink/40">{hint}</span>}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-2">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.round(fraction * 100))}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
