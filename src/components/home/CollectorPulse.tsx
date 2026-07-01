"use client";

import { formatTime } from "@/lib/format";
import { motion } from "motion/react";

export function CollectorPulse({
  healthy,
  lastPollAt,
}: { healthy: boolean; lastPollAt: string | null }) {
  const color = healthy ? "#00a98b" : "#e50040";
  const label = healthy && lastPollAt ? `sync ${formatTime(new Date(lastPollAt))}` : "hors ligne";

  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-ink/60">
      <span className="relative flex h-2.5 w-2.5">
        {healthy && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
        )}
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
      {label}
    </span>
  );
}
