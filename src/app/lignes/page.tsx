import { GlitchText } from "@/components/glitch/GlitchText";
import { LinesGrid } from "@/components/lines/LinesGrid";
import { getLinesIndex } from "@/lib/line-detail";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Lignes — TBM·404",
  description: "État par ligne du réseau TBM.",
};

export default async function LinesPage() {
  const lines = await getLinesIndex();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="w-fit font-mono text-xs text-ink/40 transition-colors hover:text-ink"
        >
          ← retour au réseau
        </Link>
        <h1 className="font-display text-3xl font-bold">
          <GlitchText text="Toutes les lignes" as="span" />
        </h1>
      </header>

      <LinesGrid lines={lines} />
    </main>
  );
}
