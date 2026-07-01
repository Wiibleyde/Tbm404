import Link from "next/link";

const LINKS: [string, string][] = [
  ["/", "Accueil"],
  ["/lignes", "Lignes"],
  ["/historique", "Historique"],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-paper-2">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-xl font-mono text-xs text-ink/40">
          Données collectées en continu depuis le flux SIRI-Lite officiel TBM. Sévérité et catégorie
          estimées automatiquement. Projet indépendant, non affilié à TBM / Keolis.
        </p>
        <nav className="flex gap-4 font-mono text-xs text-ink/50">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="transition-colors hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
