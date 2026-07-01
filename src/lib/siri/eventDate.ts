const MONTHS: Record<string, number> = {
  janvier: 1,
  février: 2,
  fevrier: 2,
  mars: 3,
  avril: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  août: 8,
  aout: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  décembre: 12,
  decembre: 12,
};

// Words that flip a leading date's meaning from "event starts" to "state ends"
// (e.g. "Dès le 11/07 : Reprise de l'itinéraire" = a diversion active NOW that
// ends on 11/07, not a future event). When present, we don't treat it as a start.
const FLIP_WORDS =
  /d[èe]s\b|(?:à|a)\s+partir|(?:à|a)\s+compter|depuis|jusqu|reprise|repris|r[ée]tabli/i;

const PAST_TOLERANCE_MS = 60 * 86_400_000;

// TBM titles often lead with the event date: "9 et 10/07 : ...", "2/7 : ...".
// Parse that leading segment into the event's earliest day (local midnight).
// Returns null when there's no clear, pure leading date.
export function parseEventStart(title: string, now = new Date()): Date | null {
  const head = title.split(":")[0].trim();
  if (head.length < 2 || head.length > 28) return null;
  if (FLIP_WORDS.test(head)) return null;

  const dates = extractDates(head, now);
  if (dates.length === 0) return null;
  return dates.reduce((earliest, date) => (date < earliest ? date : earliest));
}

function extractDates(text: string, now: Date): Date[] {
  const numeric = extractNumericDates(text, now);
  if (numeric.length > 0) return numeric;
  return extractTextualDates(text, now);
}

// "9 et 10/07", "2/7", "9/07/2026", "9 au 12/07"
function extractNumericDates(text: string, now: Date): Date[] {
  const pattern =
    /(\d{1,2}(?:\s*(?:et|au|à|-|,|&)\s*\d{1,2})*)\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{2,4}))?/g;
  const dates: Date[] = [];
  for (const match of text.matchAll(pattern)) {
    const month = Number(match[2]);
    const year = match[3] ? normalizeYear(Number(match[3])) : null;
    for (const dayStr of match[1].split(/\D+/).filter(Boolean)) {
      const date = buildDate(Number(dayStr), month, year, now);
      if (date) dates.push(date);
    }
  }
  return dates;
}

// "1er juillet", "du 1er au 5 juillet", "9 et 10 juillet 2026"
function extractTextualDates(text: string, now: Date): Date[] {
  const months = Object.keys(MONTHS).join("|");
  const pattern = new RegExp(
    `(\\d{1,2})(?:er)?(?:\\s*(?:et|au|à|-|,|&)\\s*(\\d{1,2})(?:er)?)?\\s+(${months})(?:\\s+(\\d{4}))?`,
    "ig",
  );
  const dates: Date[] = [];
  for (const match of text.matchAll(pattern)) {
    const month = MONTHS[match[3].toLowerCase()];
    const year = match[4] ? Number(match[4]) : null;
    for (const dayStr of [match[1], match[2]].filter(Boolean)) {
      const date = buildDate(Number(dayStr), month, year, now);
      if (date) dates.push(date);
    }
  }
  return dates;
}

function buildDate(day: number, month: number, year: number | null, now: Date): Date | null {
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  const baseYear = year ?? now.getFullYear();
  let date = new Date(baseYear, month - 1, day);
  // No explicit year and clearly in the past → assume next year (Dec → Jan wrap).
  if (year === null && date.getTime() < now.getTime() - PAST_TOLERANCE_MS) {
    date = new Date(baseYear + 1, month - 1, day);
  }
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeYear(year: number): number {
  return year < 100 ? 2000 + year : year;
}
