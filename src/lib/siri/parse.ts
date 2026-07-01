import { InfoChannel } from "@/generated/prisma/client";
import type { NormalizedMessage, SiriGeneralMessage, SiriResponse } from "./types";

export function parseSiri(response: SiriResponse): NormalizedMessage[] {
  const deliveries = response.Siri?.ServiceDelivery?.GeneralMessageDelivery ?? [];
  const messages: NormalizedMessage[] = [];
  const seen = new Set<string>();

  for (const delivery of deliveries) {
    for (const raw of delivery.GeneralMessage ?? []) {
      const normalized = normalize(raw);
      if (!normalized || seen.has(normalized.id)) continue;
      seen.add(normalized.id);
      messages.push(normalized);
    }
  }
  return messages;
}

function normalize(raw: SiriGeneralMessage): NormalizedMessage | null {
  const id = raw.InfoMessageIdentifier?.value;
  if (!id) return null;

  const messages = raw.Content?.Message ?? [];
  const validUntil = raw.ValidUntilTime ? new Date(raw.ValidUntilTime) : null;

  return {
    id,
    channel:
      raw.InfoChannelRef?.value === "Information"
        ? InfoChannel.INFORMATION
        : InfoChannel.PERTURBATION,
    version: raw.InfoMessageVersion ?? 0,
    validUntil: validUntil && !Number.isNaN(validUntil.getTime()) ? validUntil : null,
    title: pickMessage(messages, "shortMessage") ?? "Perturbation",
    description: pickMessage(messages, "longMessage"),
    lineRefs: uniq((raw.Content?.LineRef ?? []).map((l) => l.value).filter(isNonEmpty)),
    stopRefs: (raw.Content?.StopPointRef ?? []).map((s) => s.value).filter(isNonEmpty),
  };
}

type SiriMessage = NonNullable<NonNullable<SiriGeneralMessage["Content"]>["Message"]>[number];

function pickMessage(messages: SiriMessage[], type: string): string | null {
  const text = messages.find((m) => m.MessageType === type)?.MessageText?.value?.trim();
  return text || null;
}

export function lineCodeFromRef(ref: string): string {
  const match = ref.match(/:Line:([^:]+):/);
  return match ? match[1] : ref;
}

function uniq(values: string[]): string[] {
  return [...new Set(values)];
}

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}
