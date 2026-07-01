import { IncidentCategory, type Severity, type TransportMode } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export interface LineInfo {
  id: string;
  code: string;
  shortName: string;
  longName: string | null;
  mode: TransportMode;
  color: string | null;
  textColor: string | null;
}

export interface LineIncident {
  id: string;
  title: string;
  description: string | null;
  category: IncidentCategory;
  severity: Severity | null;
  startedAt: string;
  startsAt: string | null;
  endedAt: string | null;
  active: boolean;
  upcoming: boolean;
  durationMinutes: number;
}

export interface LineStats {
  totalIncidents: number;
  activeIncidents: number;
  activeWorks: number;
  cumulativeDisruptionMinutes: number;
  since: string | null;
}

export interface LineDetail {
  line: LineInfo;
  disrupted: boolean;
  stats: LineStats;
  incidents: LineIncident[];
  works: LineIncident[];
  upcoming: LineIncident[];
}

export interface LineSummary extends LineInfo {
  disrupted: boolean;
  activeIncidents: number;
  activeWorks: number;
}

const MINUTE_MS = 60_000;

// `slug` is the public identifier: a line's shortName (e.g. "A", "5"), with the
// GTFS route_id (code) accepted as a fallback.
export async function getLineDetail(slug: string, now = new Date()): Promise<LineDetail | null> {
  try {
    return await loadLineDetail(slug, now);
  } catch (err) {
    console.error("[lines] getLineDetail failed:", err);
    return null;
  }
}

async function loadLineDetail(slug: string, now: Date): Promise<LineDetail | null> {
  const line =
    (await prisma.line.findFirst({
      where: { shortName: { equals: slug, mode: "insensitive" } },
    })) ?? (await prisma.line.findUnique({ where: { code: slug } }));
  if (!line) return null;

  const links = await prisma.incidentLine.findMany({
    where: { lineId: line.id },
    include: { incident: true },
    orderBy: { incident: { startedAt: "desc" } },
  });

  const all = links.map((link) => toLineIncident(link.incident, now));
  const unplanned = all.filter((i) => i.category === IncidentCategory.UNPLANNED);
  const incidents = unplanned.filter((i) => !i.upcoming).sort(byActiveThenRecent);
  const upcoming = unplanned.filter((i) => i.upcoming).sort(byStartsAt);
  const works = all.filter(
    (i) => i.category === IncidentCategory.PLANNED_WORKS && i.active && !i.upcoming,
  );

  const cumulativeDisruptionMinutes = incidents.reduce((sum, i) => sum + i.durationMinutes, 0);
  const since = all.reduce<string | null>((min, i) => {
    if (!min || i.startedAt < min) return i.startedAt;
    return min;
  }, null);

  return {
    line: toLineInfo(line),
    disrupted: incidents.some((i) => i.active),
    stats: {
      totalIncidents: incidents.length,
      activeIncidents: incidents.filter((i) => i.active).length,
      activeWorks: works.length,
      cumulativeDisruptionMinutes,
      since,
    },
    incidents,
    works,
    upcoming,
  };
}

export async function getLinesIndex(now = new Date()): Promise<LineSummary[]> {
  let lines: Awaited<ReturnType<typeof fetchLinesForIndex>>;
  try {
    lines = await fetchLinesForIndex();
  } catch (err) {
    console.error("[lines] getLinesIndex failed:", err);
    return [];
  }

  return lines
    .map((line) => {
      // Exclude future-dated events: they're active in the flux but not disrupting yet.
      const current = line.incidents
        .map((link) => link.incident)
        .filter((i) => i.startsAt === null || i.startsAt <= now);
      return {
        ...toLineInfo(line),
        activeIncidents: current.filter((i) => i.category === IncidentCategory.UNPLANNED).length,
        activeWorks: current.filter((i) => i.category === IncidentCategory.PLANNED_WORKS).length,
        disrupted: current.some((i) => i.category === IncidentCategory.UNPLANNED),
      };
    })
    .sort((a, b) => a.shortName.localeCompare(b.shortName, "fr", { numeric: true }));
}

function fetchLinesForIndex() {
  return prisma.line.findMany({
    where: { active: true },
    orderBy: { code: "asc" },
    include: {
      incidents: {
        where: { incident: { active: true } },
        select: { incident: { select: { category: true, startsAt: true } } },
      },
    },
  });
}

function toLineInfo(line: LineInfo): LineInfo {
  return {
    id: line.id,
    code: line.code,
    shortName: line.shortName,
    longName: line.longName,
    mode: line.mode,
    color: line.color,
    textColor: line.textColor,
  };
}

function toLineIncident(
  incident: {
    id: string;
    title: string;
    description: string | null;
    category: IncidentCategory;
    severity: Severity | null;
    startsAt: Date | null;
    startedAt: Date;
    endedAt: Date | null;
    active: boolean;
  },
  now: Date,
): LineIncident {
  const end = incident.endedAt ?? now;
  return {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    category: incident.category,
    severity: incident.severity,
    startedAt: incident.startedAt.toISOString(),
    startsAt: incident.startsAt?.toISOString() ?? null,
    endedAt: incident.endedAt?.toISOString() ?? null,
    active: incident.active,
    upcoming: incident.active && incident.startsAt !== null && incident.startsAt > now,
    durationMinutes: Math.max(0, (end.getTime() - incident.startedAt.getTime()) / MINUTE_MS),
  };
}

function byActiveThenRecent(a: LineIncident, b: LineIncident): number {
  if (a.active !== b.active) return a.active ? -1 : 1;
  return b.startedAt.localeCompare(a.startedAt);
}

function byStartsAt(a: LineIncident, b: LineIncident): number {
  return (a.startsAt ?? "").localeCompare(b.startsAt ?? "");
}
