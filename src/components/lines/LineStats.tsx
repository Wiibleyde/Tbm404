import { formatDate, formatDuration } from "@/lib/format";
import type { LineStats as LineStatsData } from "@/lib/line-detail";

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-paper-2 bg-white p-5">
      <span
        className={`font-display text-3xl font-bold tabular-nums ${accent ? "text-alert" : "text-ink"}`}
      >
        {value}
      </span>
      <span className="font-mono text-xs uppercase tracking-wider text-ink/45">{label}</span>
    </div>
  );
}

export function LineStats({ stats }: { stats: LineStatsData }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        value={String(stats.activeIncidents)}
        label="incidents actifs"
        accent={stats.activeIncidents > 0}
      />
      <Stat value={String(stats.totalIncidents)} label="incidents au total" />
      <Stat
        value={formatDuration(stats.cumulativeDisruptionMinutes)}
        label="perturbation cumulée"
      />
      <Stat value={String(stats.activeWorks)} label="travaux en cours" />
      {stats.since && (
        <p className="col-span-2 font-mono text-xs text-ink/40 lg:col-span-4">
          Données collectées depuis le {formatDate(new Date(stats.since))}.
        </p>
      )}
    </div>
  );
}
