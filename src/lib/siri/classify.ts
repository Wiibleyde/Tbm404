import { IncidentCategory, InfoChannel, Severity } from "@/generated/prisma/client";
import type { NormalizedMessage } from "./types";

const WORKS_RE = /\btravaux\b/i;
const RECURRING_RE =
  /march[ée]|chaque|tous les|toutes les|hebdomadaire|dimanche matin|samedi matin/i;
const CRITICAL_RE =
  /interrompu|interruption|coup[ée]e?|suspendu|arr[êe]t total|ne circule plus|hors service/i;
const MAJOR_RE = /d[ée]viation|report|supprim|ne dessert|perturb|ralenti|retard/i;

// A perturbation valid this long is a standing disruption (works), not a one-off incident.
const PLANNED_MIN_DAYS = 30;
const MS_PER_DAY = 86_400_000;

export interface Classification {
  category: IncidentCategory;
  severity: Severity | null;
}

export function classify(message: NormalizedMessage, now: Date): Classification {
  if (message.channel === InfoChannel.INFORMATION) {
    return { category: IncidentCategory.INFORMATION, severity: null };
  }

  const text = `${message.title}\n${message.description ?? ""}`;
  const category = classifyPerturbation(text, message.validUntil, now);
  const severity =
    category === IncidentCategory.RECURRING ? null : deriveSeverity(text, message.lineRefs.length);

  return { category, severity };
}

function classifyPerturbation(text: string, validUntil: Date | null, now: Date): IncidentCategory {
  if (WORKS_RE.test(text)) return IncidentCategory.PLANNED_WORKS;
  if (RECURRING_RE.test(text)) return IncidentCategory.RECURRING;

  const validityDays = validUntil ? (validUntil.getTime() - now.getTime()) / MS_PER_DAY : null;
  if (validityDays !== null && validityDays > PLANNED_MIN_DAYS)
    return IncidentCategory.PLANNED_WORKS;

  return IncidentCategory.UNPLANNED;
}

function deriveSeverity(text: string, lineCount: number): Severity {
  if (CRITICAL_RE.test(text)) return Severity.CRITICAL;
  if (MAJOR_RE.test(text) || lineCount >= 3) return Severity.MAJOR;
  return Severity.MINOR;
}
