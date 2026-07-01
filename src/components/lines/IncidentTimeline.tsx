"use client";

import { formatDate, formatDuration } from "@/lib/format";
import type { LineIncident } from "@/lib/line-detail";
import { CATEGORY_LABEL, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/lines";
import { motion } from "motion/react";

export function IncidentTimeline({ incidents }: { incidents: LineIncident[] }) {
  if (incidents.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-paper-2 bg-white/60 p-8 text-center text-sm text-ink/50">
        Aucun incident enregistré pour cette ligne.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {incidents.map((incident, index) => (
        <TimelineItem key={incident.id} incident={incident} index={index} />
      ))}
    </ol>
  );
}

function TimelineItem({ incident, index }: { incident: LineIncident; index: number }) {
  const accent = incident.upcoming ? "#f08700" : incident.active ? "#e50040" : "#c3ccd4";

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: "easeOut" }}
      className="flex gap-4 rounded-2xl border border-paper-2 bg-white p-4"
      style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink/45">
          {incident.upcoming && incident.startsAt ? (
            <span className="font-semibold text-warn">
              à partir du {formatDate(new Date(incident.startsAt))}
            </span>
          ) : (
            <>
              <span>{formatDate(new Date(incident.startedAt))}</span>
              <span aria-hidden>·</span>
              {incident.active ? (
                <span className="font-semibold text-alert">
                  en cours — {formatDuration(incident.durationMinutes)}
                </span>
              ) : (
                <span>résolu en {formatDuration(incident.durationMinutes)}</span>
              )}
            </>
          )}
        </div>

        <h3 className="text-balance font-display font-semibold leading-snug text-ink">
          {incident.title}
        </h3>

        <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider">
          <span className="rounded bg-paper px-1.5 py-0.5 text-ink/50">
            {CATEGORY_LABEL[incident.category]}
          </span>
          {incident.severity && (
            <span
              className="rounded px-1.5 py-0.5 font-semibold text-white"
              style={{ backgroundColor: SEVERITY_COLOR[incident.severity] }}
            >
              {SEVERITY_LABEL[incident.severity]}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
}
