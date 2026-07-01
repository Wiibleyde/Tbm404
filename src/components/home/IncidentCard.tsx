"use client";

import { LineBadge } from "@/components/LineBadge";
import { formatDate, formatSince } from "@/lib/format";
import { CATEGORY_LABEL, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/lines";
import type { StatusIncident } from "@/lib/status";
import { motion } from "motion/react";

interface IncidentCardProps {
  incident: StatusIncident;
  index: number;
  upcoming?: boolean;
}

export function IncidentCard({ incident, index, upcoming = false }: IncidentCardProps) {
  const timing =
    upcoming && incident.startsAt
      ? `à partir du ${formatDate(new Date(incident.startsAt))}`
      : `depuis ${formatSince(new Date(incident.startedAt))}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: "easeOut" }}
      className="group relative flex flex-col gap-3 rounded-2xl border border-paper-2 bg-white p-5 transition-colors hover:border-ink/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {incident.lines.map((line) => (
            <LineBadge
              key={line.id}
              line={line}
              size="sm"
              href={`/lignes/${encodeURIComponent(line.shortName)}`}
            />
          ))}
        </div>
        {incident.severity && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: SEVERITY_COLOR[incident.severity] }}
          >
            {SEVERITY_LABEL[incident.severity]}
          </span>
        )}
      </div>

      <h3 className="text-balance font-display text-lg font-semibold leading-snug text-ink group-hover:text-alert">
        {incident.title}
      </h3>

      <div className="mt-auto flex items-center gap-3 font-mono text-xs text-ink/45">
        <span className="rounded bg-paper px-1.5 py-0.5 uppercase tracking-wider">
          {CATEGORY_LABEL[incident.category]}
        </span>
        <span>{timing}</span>
      </div>
    </motion.article>
  );
}
