import { IncidentTimeline } from "@/components/lines/IncidentTimeline";
import { LineHeader } from "@/components/lines/LineHeader";
import { LineStats } from "@/components/lines/LineStats";
import { getLineDetail } from "@/lib/line-detail";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const detail = await getLineDetail(decodeURIComponent(code));
  if (!detail) return { title: "Ligne introuvable — TBM·404" };

  const name = detail.line.longName ?? detail.line.shortName;
  return {
    title: `${name} — TBM·404`,
    description: `Historique des incidents de la ligne ${name}.`,
  };
}

export default async function LinePage({ params }: PageProps) {
  const { code } = await params;
  const detail = await getLineDetail(decodeURIComponent(code));
  if (!detail) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <LineHeader line={detail.line} disrupted={detail.disrupted} />

      <LineStats stats={detail.stats} />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Incidents</h2>
        <IncidentTimeline incidents={detail.incidents} />
      </section>

      {detail.upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-ink/70">À venir</h2>
          <IncidentTimeline incidents={detail.upcoming} />
        </section>
      )}

      {detail.works.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-ink/70">Travaux en cours</h2>
          <IncidentTimeline incidents={detail.works} />
        </section>
      )}
    </main>
  );
}
