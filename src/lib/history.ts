import { IncidentCategory, type TransportMode } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export type HistoryGrain = "day" | "month" | "year";

export const HISTORY_GRAINS: HistoryGrain[] = ["day", "month", "year"];

export interface HistoryBucket {
  key: string;
  label: string;
  incidentCount: number;
  disruptionHours: number;
}

export interface AffectedLine {
  code: string;
  shortName: string;
  mode: TransportMode;
  color: string | null;
  textColor: string | null;
  incidentCount: number;
  disruptionHours: number;
}

export interface HistorySummary {
  grain: HistoryGrain;
  totalIncidents: number;
  totalDisruptionHours: number;
  buckets: HistoryBucket[];
  topLines: AffectedLine[];
}

const MINUTE_MS = 60_000;
const WINDOW: Record<HistoryGrain, number> = { day: 30, month: 12, year: 6 };

export function isHistoryGrain(value: string): value is HistoryGrain {
  return (HISTORY_GRAINS as string[]).includes(value);
}

export async function getHistory(grain: HistoryGrain, now = new Date()): Promise<HistorySummary> {
  const from = windowStart(grain, now);

  const incidents = await prisma.incident
    .findMany({
      // Exclude events announced but not started yet (same rule as the live %).
      where: {
        category: IncidentCategory.UNPLANNED,
        startedAt: { gte: from },
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      },
      select: {
        startedAt: true,
        endedAt: true,
        lines: { select: { line: true } },
      },
    })
    .catch((err) => {
      console.error("[history] getHistory failed:", err);
      return [];
    });

  const buckets = emptyBuckets(grain, from, now);
  const bucketIndex = new Map(buckets.map((bucket, i) => [bucket.key, i]));
  const lineTally = new Map<string, AffectedLine>();

  for (const incident of incidents) {
    const durationHours =
      Math.max(
        0,
        ((incident.endedAt ?? now).getTime() - incident.startedAt.getTime()) / MINUTE_MS,
      ) / 60;

    const index = bucketIndex.get(bucketKey(grain, incident.startedAt));
    if (index !== undefined) {
      buckets[index].incidentCount += 1;
      buckets[index].disruptionHours += durationHours;
    }

    for (const { line } of incident.lines) {
      const entry = lineTally.get(line.id) ?? {
        code: line.code,
        shortName: line.shortName,
        mode: line.mode,
        color: line.color,
        textColor: line.textColor,
        incidentCount: 0,
        disruptionHours: 0,
      };
      entry.incidentCount += 1;
      entry.disruptionHours += durationHours;
      lineTally.set(line.id, entry);
    }
  }

  const topLines = [...lineTally.values()]
    .sort((a, b) => b.incidentCount - a.incidentCount || b.disruptionHours - a.disruptionHours)
    .slice(0, 8);

  return {
    grain,
    totalIncidents: incidents.length,
    totalDisruptionHours: buckets.reduce((sum, b) => sum + b.disruptionHours, 0),
    buckets: buckets.map((b) => ({ ...b, disruptionHours: round(b.disruptionHours) })),
    topLines: topLines.map((l) => ({ ...l, disruptionHours: round(l.disruptionHours) })),
  };
}

function windowStart(grain: HistoryGrain, now: Date): Date {
  const count = WINDOW[grain] - 1;
  if (grain === "day") return startOfDay(addDays(now, -count));
  if (grain === "month") return new Date(now.getFullYear(), now.getMonth() - count, 1);
  return new Date(now.getFullYear() - count, 0, 1);
}

function emptyBuckets(grain: HistoryGrain, from: Date, now: Date): HistoryBucket[] {
  const buckets: HistoryBucket[] = [];
  const cursor = new Date(from);

  while (cursor <= now) {
    buckets.push({
      key: bucketKey(grain, cursor),
      label: bucketLabel(grain, cursor),
      incidentCount: 0,
      disruptionHours: 0,
    });
    if (grain === "day") cursor.setDate(cursor.getDate() + 1);
    else if (grain === "month") cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setFullYear(cursor.getFullYear() + 1);
  }
  return buckets;
}

function bucketKey(grain: HistoryGrain, date: Date): string {
  const year = date.getFullYear();
  if (grain === "year") return String(year);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  if (grain === "month") return `${year}-${month}`;
  return `${year}-${month}-${String(date.getDate()).padStart(2, "0")}`;
}

function bucketLabel(grain: HistoryGrain, date: Date): string {
  if (grain === "year") return String(date.getFullYear());
  if (grain === "month") {
    return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
