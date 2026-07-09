import { LineBadge } from "@/components/LineBadge";
import type { TransportMode } from "@/generated/prisma/client";
import type { LineSummary } from "@/lib/line-detail";
import { MODE_LABEL } from "@/lib/lines";
import Link from "next/link";

const MODE_ORDER: TransportMode[] = ["TRAM", "BOAT", "BUS", "OTHER"];

export function LinesGrid({ lines }: { lines: LineSummary[] }) {
  const groups = MODE_ORDER.map((mode) => ({
    mode,
    lines: lines.filter((line) => line.mode === mode),
  })).filter((group) => group.lines.length > 0);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.mode} className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
            {MODE_LABEL[group.mode]} · {group.lines.length}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {group.lines.map((line) => (
              <LineCard key={line.id} line={line} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LineCard({ line }: { line: LineSummary }) {
  const dotColor = line.disrupted ? "#e50040" : line.activeWorks > 0 ? "#f08700" : "#00a98b";

  return (
    <Link
      href={`/lignes/${encodeURIComponent(line.shortName)}`}
      prefetch={false}
      className="flex items-center gap-3 rounded-xl border border-paper-2 bg-white p-3 transition-colors hover:border-ink/20"
    >
      <LineBadge line={line} size="md" />
      <span className="min-w-0 flex-1 truncate font-display text-sm font-medium text-ink">
        {line.longName ?? line.shortName}
      </span>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
    </Link>
  );
}
