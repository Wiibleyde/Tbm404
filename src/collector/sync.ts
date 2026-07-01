import { TransportMode } from "@/generated/prisma/client";
import { prisma } from "../lib/prisma";
import { classify } from "../lib/siri/classify";
import { parseEventStart } from "../lib/siri/eventDate";
import { lineCodeFromRef } from "../lib/siri/parse";
import type { NormalizedMessage } from "../lib/siri/types";

export interface SyncResult {
  newCount: number;
  endedCount: number;
}

export async function syncIncidents(messages: NormalizedMessage[], now: Date): Promise<SyncResult> {
  let newCount = 0;

  for (const message of messages) {
    await ensureLinesExist(message.lineRefs);
    const created = await upsertIncident(message, now);
    if (created) newCount++;
  }

  const endedCount = await closeMissing(messages, now);
  return { newCount, endedCount };
}

async function upsertIncident(message: NormalizedMessage, now: Date): Promise<boolean> {
  const { category, severity } = classify(message, now);
  const fields = {
    channel: message.channel,
    category,
    severity,
    title: message.title,
    description: message.description,
    stopRefs: message.stopRefs,
    version: message.version,
    validUntil: message.validUntil,
    startsAt: parseEventStart(message.title, now),
  };

  const existing = await prisma.incident.findUnique({
    where: { id: message.id },
    select: { version: true, title: true, description: true },
  });

  if (!existing) {
    await prisma.incident.create({
      data: {
        id: message.id,
        ...fields,
        startedAt: now,
        lastSeenAt: now,
        active: true,
        lines: { create: message.lineRefs.map((lineId) => ({ lineId })) },
        revisions: {
          create: {
            version: message.version,
            title: message.title,
            description: message.description,
          },
        },
      },
    });
    return true;
  }

  const contentChanged =
    existing.version !== message.version ||
    existing.title !== message.title ||
    existing.description !== message.description;

  await prisma.incident.update({
    where: { id: message.id },
    data: {
      ...fields,
      lastSeenAt: now,
      active: true,
      endedAt: null,
      ...(contentChanged && {
        revisions: {
          create: {
            version: message.version,
            title: message.title,
            description: message.description,
          },
        },
      }),
    },
  });

  await syncIncidentLines(message.id, message.lineRefs);
  return false;
}

async function syncIncidentLines(incidentId: string, lineRefs: string[]): Promise<void> {
  const current = await prisma.incidentLine.findMany({
    where: { incidentId },
    select: { lineId: true },
  });
  const have = new Set(current.map((row) => row.lineId));
  const want = new Set(lineRefs);

  const toAdd = lineRefs.filter((ref) => !have.has(ref));
  const toRemove = [...have].filter((lineId) => !want.has(lineId));

  if (toAdd.length > 0) {
    await prisma.incidentLine.createMany({
      data: toAdd.map((lineId) => ({ incidentId, lineId })),
      skipDuplicates: true,
    });
  }
  if (toRemove.length > 0) {
    await prisma.incidentLine.deleteMany({ where: { incidentId, lineId: { in: toRemove } } });
  }
}

async function closeMissing(messages: NormalizedMessage[], now: Date): Promise<number> {
  // An empty flux is suspicious (upstream hiccup); never mark everything resolved.
  if (messages.length === 0) return 0;

  const currentIds = messages.map((message) => message.id);
  const result = await prisma.incident.updateMany({
    where: { active: true, id: { notIn: currentIds } },
    data: { active: false, endedAt: now },
  });
  return result.count;
}

// SIRI can reference a line before GTFS knows it: create an inactive placeholder
// so the incident link never fails; the next GTFS import enriches it.
async function ensureLinesExist(lineRefs: string[]): Promise<void> {
  for (const ref of lineRefs) {
    const code = lineCodeFromRef(ref);
    await prisma.line.upsert({
      where: { id: ref },
      update: {},
      create: { id: ref, code, shortName: code, mode: TransportMode.OTHER, active: false },
    });
  }
}
