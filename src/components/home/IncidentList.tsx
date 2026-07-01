import type { StatusIncident } from "@/lib/status";
import { IncidentCard } from "./IncidentCard";

interface IncidentListProps {
  incidents: StatusIncident[];
  upcoming?: boolean;
}

export function IncidentList({ incidents, upcoming = false }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-paper-2 bg-white/60 p-10 text-center">
        <p className="font-display text-xl font-semibold text-ok">Aucun incident en cours</p>
        <p className="mt-1 text-sm text-ink/50">
          Le réseau circule normalement sur l'ensemble des lignes en service.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {incidents.map((incident, index) => (
        <IncidentCard key={incident.id} incident={incident} index={index} upcoming={upcoming} />
      ))}
    </div>
  );
}
