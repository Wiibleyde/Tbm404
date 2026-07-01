import type { HistoryGrain } from "@/lib/history";
import Link from "next/link";

const LABELS: Record<HistoryGrain, string> = {
  day: "Jour",
  month: "Mois",
  year: "Année",
};

const GRAINS: HistoryGrain[] = ["day", "month", "year"];

export function GrainTabs({ grain }: { grain: HistoryGrain }) {
  return (
    <div className="inline-flex rounded-full border border-paper-2 bg-white p-1 font-mono text-xs">
      {GRAINS.map((value) => (
        <Link
          key={value}
          href={`/historique?grain=${value}`}
          scroll={false}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            value === grain ? "bg-ink text-paper" : "text-ink/50 hover:text-ink"
          }`}
        >
          {LABELS[value]}
        </Link>
      ))}
    </div>
  );
}
