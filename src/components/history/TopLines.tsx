import { LineBadge } from "@/components/LineBadge";
import type { AffectedLine } from "@/lib/history";
import { lineColors } from "@/lib/lines";
import Link from "next/link";

export function TopLines({ lines }: { lines: AffectedLine[] }) {
  if (lines.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-paper-2 bg-white/60 p-8 text-center text-sm text-ink/50">
        Pas encore de données sur cette période.
      </p>
    );
  }

  const max = Math.max(...lines.map((line) => line.incidentCount), 1);

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line) => {
        const { bg } = lineColors(line);
        return (
          <Link
            key={line.code}
            href={`/lignes/${encodeURIComponent(line.shortName)}`}
            className="flex items-center gap-3 rounded-xl border border-paper-2 bg-white p-3 transition-colors hover:border-ink/20"
          >
            <LineBadge line={line} size="sm" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${(line.incidentCount / max) * 100}%`, backgroundColor: bg }}
              />
            </div>
            <span className="w-24 shrink-0 text-right font-mono text-xs text-ink/50">
              <span className="font-semibold text-ink">{line.incidentCount}</span> inc. ·{" "}
              {line.disruptionHours} h
            </span>
          </Link>
        );
      })}
    </div>
  );
}
