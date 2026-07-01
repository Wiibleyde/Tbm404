"use client";

import { LineBadge } from "@/components/LineBadge";
import { GlitchText } from "@/components/glitch/GlitchText";
import type { LineInfo } from "@/lib/line-detail";
import { MODE_LABEL } from "@/lib/lines";
import { motion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";

export function LineHeader({ line, disrupted }: { line: LineInfo; disrupted: boolean }) {
  const style = { "--glitch": disrupted ? "1" : "0" } as CSSProperties;
  const statusColor = disrupted ? "#e50040" : "#00a98b";
  const statusLabel = disrupted ? "PERTURBÉE" : "NOMINALE";

  return (
    <header style={style} className="flex flex-col gap-6">
      <Link
        href="/"
        className="w-fit font-mono text-xs text-ink/40 transition-colors hover:text-ink"
      >
        ← retour au réseau
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-5"
      >
        <LineBadge line={line} size="lg" />
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
            {MODE_LABEL[line.mode]}
          </span>
          <h1
            className="glitch-text font-display text-3xl font-bold sm:text-4xl"
            data-text={line.longName ?? line.shortName}
          >
            {line.longName ?? line.shortName}
          </h1>
        </div>
      </motion.div>

      <span
        className="w-fit rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-white"
        style={{ backgroundColor: statusColor }}
      >
        <GlitchText text={statusLabel} />
      </span>
    </header>
  );
}
