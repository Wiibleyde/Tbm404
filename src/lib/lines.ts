import type { IncidentCategory, Severity, TransportMode } from "@/generated/prisma/client";

// Type-only Prisma imports + string-literal keys keep this module free of the
// Prisma runtime, so client components can import it. Prisma string enums have
// value === name, so "TRAM" etc. satisfy the Record key types.
export const MODE_COLOR: Record<TransportMode, string> = {
  TRAM: "#00b1eb",
  BUS: "#164194",
  BOAT: "#006bb5",
  OTHER: "#5b6b7a",
};

export const MODE_LABEL: Record<TransportMode, string> = {
  TRAM: "Tramway",
  BUS: "Bus",
  BOAT: "Bateau",
  OTHER: "Ligne",
};

export interface LineColors {
  bg: string;
  fg: string;
}

export function lineColors(line: {
  color: string | null;
  textColor: string | null;
  mode: TransportMode;
}): LineColors {
  return {
    bg: line.color ?? MODE_COLOR[line.mode] ?? MODE_COLOR.OTHER,
    fg: line.textColor ?? "#ffffff",
  };
}

export const CATEGORY_LABEL: Record<IncidentCategory, string> = {
  UNPLANNED: "Incident",
  PLANNED_WORKS: "Travaux",
  RECURRING: "Récurrent",
  INFORMATION: "Info",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  MINOR: "Mineur",
  MAJOR: "Majeur",
  CRITICAL: "Critique",
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  MINOR: "#f08700",
  MAJOR: "#e50040",
  CRITICAL: "#a1002d",
};
