import {
  IncidentCategory,
  type Prisma,
  type Severity,
  type TransportMode,
} from "@/generated/prisma/client";
import { isHiddenLine } from "./line-filter";
import { prisma } from "./prisma";

export interface StatusLine {
  id: string;
  code: string;
  shortName: string;
  mode: TransportMode;
  color: string | null;
  textColor: string | null;
}

export interface StatusIncident {
  id: string;
  title: string;
  description: string | null;
  category: IncidentCategory;
  severity: Severity | null;
  startedAt: string;
  startsAt: string | null;
  lines: StatusLine[];
}

export interface ModeBreakdown {
  mode: TransportMode;
  totalLines: number;
  disruptedLines: number;
  ratio: number;
}

export interface SeverityBreakdown {
  severity: Severity;
  count: number;
}

export interface NetworkStatus {
  generatedAt: string;
  activeLineCount: number;
  disruptedLineCount: number;
  disruptionRatio: number;
  worksLineCount: number;
  byMode: ModeBreakdown[];
  bySeverity: SeverityBreakdown[];
  incidents: StatusIncident[];
  works: StatusIncident[];
  upcoming: StatusIncident[];
  lastPollAt: string | null;
  collectorHealthy: boolean;
}

const MODE_ORDER: TransportMode[] = ["TRAM", "BUS", "BOAT", "OTHER"];
const SEVERITY_ORDER: Severity[] = ["CRITICAL", "MAJOR", "MINOR"];

// The headline % counts only UNPLANNED incidents (real-time trouble). PLANNED_WORKS are
// standing deviations that would otherwise keep the ratio permanently high, so they're
// reported separately and never fold into the disruption ratio.
export async function getNetworkStatus(now = new Date()): Promise<NetworkStatus> {
  let lineRows: Array<{ mode: TransportMode; shortName: string; longName: string | null }>;
  let active: IncidentWithLines[];
  let lastPoll: { startedAt: Date } | null;
  try {
    [lineRows, active, lastPoll] = await Promise.all([
      // Group in JS (not a DB groupBy) so hidden lines are dropped from the denominator.
      prisma.line.findMany({
        where: { active: true },
        select: { mode: true, shortName: true, longName: true },
      }),
      prisma.incident.findMany({
        where: {
          active: true,
          category: { in: [IncidentCategory.UNPLANNED, IncidentCategory.PLANNED_WORKS] },
        },
        orderBy: [{ severity: "desc" }, { startedAt: "desc" }],
        include: { lines: { include: { line: true } } },
      }),
      prisma.pollLog.findFirst({ where: { ok: true }, orderBy: { startedAt: "desc" } }),
    ]);
  } catch (err) {
    // DB not migrated / unreachable (e.g. before the collector's first run):
    // degrade to the empty "collecte en cours" state instead of a 500.
    console.error("[status] getNetworkStatus failed:", err);
    return emptyStatus(now);
  }

  const modeGroups = countVisibleByMode(lineRows);
  const activeLineCount = modeGroups.reduce((sum, group) => sum + group._count._all, 0);

  // A future-dated event (startsAt > now, parsed from the title) is announced but not
  // disrupting yet, so it must NOT inflate the live %. It's surfaced under `upcoming`.
  const hasStarted = (i: IncidentWithLines) => i.startsAt === null || i.startsAt <= now;

  // toStatusIncident strips hidden lines; an incident left with no visible line is one
  // that only touched hidden lines (a navette, a SCODI…) so it's dropped entirely.
  const hasVisibleLine = (i: StatusIncident) => i.lines.length > 0;
  const unplanned = active.filter((i) => i.category === IncidentCategory.UNPLANNED);
  const incidents = unplanned.filter(hasStarted).map(toStatusIncident).filter(hasVisibleLine);
  const upcoming = unplanned
    .filter((i) => !hasStarted(i))
    .map(toStatusIncident)
    .filter(hasVisibleLine);
  const works = active
    .filter((i) => i.category === IncidentCategory.PLANNED_WORKS && hasStarted(i))
    .map(toStatusIncident)
    .filter(hasVisibleLine);

  const disruptedLineIds = collectLineIds(incidents);
  const worksLineIds = collectLineIds(works);
  const disruptionRatio = activeLineCount > 0 ? disruptedLineIds.size / activeLineCount : 0;
  const byMode = buildModeBreakdown(modeGroups, incidents);
  const bySeverity = buildSeverityBreakdown(incidents);

  const lastPollAt = lastPoll?.startedAt ?? null;
  const collectorHealthy =
    lastPollAt !== null && now.getTime() - lastPollAt.getTime() < 15 * 60_000;

  return {
    generatedAt: now.toISOString(),
    activeLineCount,
    disruptedLineCount: disruptedLineIds.size,
    disruptionRatio,
    worksLineCount: worksLineIds.size,
    byMode,
    bySeverity,
    incidents,
    works,
    upcoming,
    lastPollAt: lastPollAt?.toISOString() ?? null,
    collectorHealthy,
  };
}

// Count active, non-hidden lines per mode — replaces a DB groupBy so the exclusion
// (SCODI, navettes, Bus Relais, Flex, TBNight, festivals) applies to the denominator.
function countVisibleByMode(
  lines: Array<{ mode: TransportMode; shortName: string; longName: string | null }>,
): Array<{ mode: TransportMode; _count: { _all: number } }> {
  const counts = new Map<TransportMode, number>();
  for (const line of lines) {
    if (isHiddenLine(line)) continue;
    counts.set(line.mode, (counts.get(line.mode) ?? 0) + 1);
  }
  return [...counts.entries()].map(([mode, n]) => ({ mode, _count: { _all: n } }));
}

function buildModeBreakdown(
  groups: Array<{ mode: TransportMode; _count: { _all: number } }>,
  incidents: StatusIncident[],
): ModeBreakdown[] {
  const totals = new Map<TransportMode, number>();
  for (const group of groups) totals.set(group.mode, group._count._all);

  const disrupted = new Map<TransportMode, Set<string>>();
  for (const incident of incidents) {
    for (const line of incident.lines) {
      const set = disrupted.get(line.mode) ?? new Set<string>();
      set.add(line.id);
      disrupted.set(line.mode, set);
    }
  }

  return MODE_ORDER.filter((mode) => (totals.get(mode) ?? 0) > 0).map((mode) => {
    const totalLines = totals.get(mode) ?? 0;
    const disruptedLines = disrupted.get(mode)?.size ?? 0;
    return {
      mode,
      totalLines,
      disruptedLines,
      ratio: totalLines > 0 ? disruptedLines / totalLines : 0,
    };
  });
}

function buildSeverityBreakdown(incidents: StatusIncident[]): SeverityBreakdown[] {
  const counts = new Map<Severity, number>();
  for (const incident of incidents) {
    if (incident.severity) counts.set(incident.severity, (counts.get(incident.severity) ?? 0) + 1);
  }
  return SEVERITY_ORDER.map((severity) => ({ severity, count: counts.get(severity) ?? 0 }));
}

function emptyStatus(now: Date): NetworkStatus {
  return {
    generatedAt: now.toISOString(),
    activeLineCount: 0,
    disruptedLineCount: 0,
    disruptionRatio: 0,
    worksLineCount: 0,
    byMode: [],
    bySeverity: [],
    incidents: [],
    works: [],
    upcoming: [],
    lastPollAt: null,
    collectorHealthy: false,
  };
}

function collectLineIds(incidents: StatusIncident[]): Set<string> {
  const ids = new Set<string>();
  for (const incident of incidents) {
    for (const line of incident.lines) ids.add(line.id);
  }
  return ids;
}

type IncidentWithLines = Prisma.IncidentGetPayload<{
  include: { lines: { include: { line: true } } };
}>;

function toStatusIncident(incident: IncidentWithLines): StatusIncident {
  return {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    category: incident.category,
    severity: incident.severity,
    startedAt: incident.startedAt.toISOString(),
    startsAt: incident.startsAt?.toISOString() ?? null,
    lines: incident.lines
      .filter(({ line }) => !isHiddenLine(line))
      .map(({ line }) => ({
        id: line.id,
        code: line.code,
        shortName: line.shortName,
        mode: line.mode,
        color: line.color,
        textColor: line.textColor,
      }))
      .sort((a, b) => a.code.localeCompare(b.code, "fr", { numeric: true })),
  };
}
