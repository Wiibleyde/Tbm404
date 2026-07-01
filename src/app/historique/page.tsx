import { GlitchText } from "@/components/glitch/GlitchText";
import { GrainTabs } from "@/components/history/GrainTabs";
import { HistoryCharts } from "@/components/history/HistoryCharts";
import { TopLines } from "@/components/history/TopLines";
import { getHistory, isHistoryGrain } from "@/lib/history";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Historique — TBM·404",
  description: "Historique des perturbations du réseau TBM par jour, mois et année.",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ grain?: string }>;
}) {
  const { grain: raw } = await searchParams;
  const grain = raw && isHistoryGrain(raw) ? raw : "month";
  const history = await getHistory(grain);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="w-fit font-mono text-xs text-ink/40 transition-colors hover:text-ink"
        >
          ← retour au réseau
        </Link>
        <h1 className="font-display text-3xl font-bold">
          <GlitchText text="Historique" as="span" />
        </h1>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <GrainTabs grain={grain} />
        <div className="flex gap-6 font-mono text-xs text-ink/50">
          <span>
            <span className="font-semibold text-ink">{history.totalIncidents}</span> incidents
          </span>
          <span>
            <span className="font-semibold text-ink">
              {Math.round(history.totalDisruptionHours)}
            </span>{" "}
            h de perturbation
          </span>
        </div>
      </div>

      <HistoryCharts buckets={history.buckets} />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Lignes les plus touchées</h2>
        <TopLines lines={history.topLines} />
      </section>

      <p className="font-mono text-xs text-ink/40">
        Agrégations calculées sur les incidents ponctuels collectés. La durée est comptée sur la
        période de début de chaque incident. Travaux programmés exclus.
      </p>
    </main>
  );
}
