import { GlitchText } from "@/components/glitch/GlitchText";
import { CollectorPulse } from "@/components/home/CollectorPulse";
import { IncidentList } from "@/components/home/IncidentList";
import { NetworkBreakdown } from "@/components/home/NetworkBreakdown";
import { StatusHero } from "@/components/home/StatusHero";
import { getNetworkStatus } from "@/lib/status";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const status = await getNetworkStatus();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span
            className="glitch-text font-display text-xl font-bold tracking-tight"
            data-text="TBM·404"
          >
            TBM<span className="text-cyan">·</span>404
          </span>
          <span className="hidden font-mono text-xs text-ink/40 sm:inline">état du réseau</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/lignes"
            className="font-mono text-xs text-ink/50 transition-colors hover:text-ink"
          >
            lignes →
          </Link>
          <CollectorPulse healthy={status.collectorHealthy} lastPollAt={status.lastPollAt} />
        </div>
      </header>

      <StatusHero status={status} />

      <NetworkBreakdown byMode={status.byMode} bySeverity={status.bySeverity} />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold">
            <GlitchText text="Incidents en cours" as="span" />
          </h2>
          <span className="font-mono text-sm text-ink/40">{status.incidents.length}</span>
        </div>
        <IncidentList incidents={status.incidents} />
      </section>

      {status.upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold text-ink/70">À venir</h2>
            <span className="font-mono text-sm text-ink/40">{status.upcoming.length}</span>
          </div>
          <IncidentList incidents={status.upcoming} upcoming />
        </section>
      )}

      {status.works.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold text-ink/70">Travaux programmés</h2>
            <span className="font-mono text-sm text-ink/40">{status.works.length}</span>
          </div>
          <IncidentList incidents={status.works} />
        </section>
      )}

      <footer className="mt-auto border-t border-paper-2 pt-6 font-mono text-xs text-ink/40">
        <p>
          Données collectées en continu depuis le flux SIRI-Lite officiel TBM. Sévérité et catégorie
          estimées automatiquement. Projet indépendant, non affilié à TBM / Keolis.
        </p>
      </footer>
    </main>
  );
}
