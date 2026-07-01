"use client";

import { GlitchNumber } from "@/components/glitch/GlitchNumber";
import { GlitchText } from "@/components/glitch/GlitchText";
import type { NetworkStatus } from "@/lib/status";
import { motion } from "motion/react";
import type { CSSProperties } from "react";

interface StatusLevel {
  label: string;
  color: string;
}

// 25% of lines disrupted saturates the glitch.
const FULL_GLITCH_AT = 0.25;

function statusLevel(ratio: number, hasData: boolean): StatusLevel {
  if (!hasData) return { label: "COLLECTE EN COURS", color: "#5b6b7a" };
  if (ratio === 0) return { label: "RÉSEAU NOMINAL", color: "#00a98b" };
  if (ratio < 0.1) return { label: "PERTURBATIONS LOCALISÉES", color: "#f08700" };
  if (ratio < FULL_GLITCH_AT) return { label: "RÉSEAU PERTURBÉ", color: "#e50040" };
  return { label: "RÉSEAU DÉGRADÉ", color: "#a1002d" };
}

export function StatusHero({ status }: { status: NetworkStatus }) {
  const hasData = status.activeLineCount > 0 && status.collectorHealthy;
  const intensity = Math.min(1, status.disruptionRatio / FULL_GLITCH_AT);
  const percent = Math.round(status.disruptionRatio * 100);
  const level = statusLevel(status.disruptionRatio, hasData);

  const heroStyle = { "--glitch": intensity.toFixed(3) } as CSSProperties;

  return (
    <section
      style={heroStyle}
      className="scanlines datamosh relative overflow-hidden rounded-3xl border border-paper-2 bg-white px-6 py-12 shadow-sm sm:px-12 sm:py-16"
    >
      <div className="paper-grid pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-6 text-center"
      >
        <span
          className="font-mono text-xs font-semibold uppercase tracking-[0.35em]"
          style={{ color: level.color }}
        >
          <GlitchText text={level.label} />
        </span>

        <h1 className="flex items-baseline gap-2 font-display text-[22vw] leading-none font-bold sm:text-[13rem]">
          <GlitchNumber value={percent} suffix="%" />
        </h1>

        <p className="max-w-md text-balance text-lg text-ink/70">
          des lignes en service sont actuellement perturbées —{" "}
          <span className="font-semibold text-ink">
            {status.disruptedLineCount} / {status.activeLineCount}
          </span>{" "}
          lignes touchées par un incident.
        </p>

        {status.worksLineCount > 0 && (
          <p className="font-mono text-sm text-ink/50">
            + {status.worksLineCount} ligne{status.worksLineCount > 1 ? "s" : ""} en travaux
            programmés
          </p>
        )}
      </motion.div>
    </section>
  );
}
