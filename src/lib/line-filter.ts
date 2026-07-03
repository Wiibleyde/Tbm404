// Single source of truth for which lines the site surfaces.
//
// Kept: trams (A–F), boats (LE BATO), regular buses (Lianes / Principale / Locale /
// Directe / Ligne …) and the BUS EXPRESS network.
// Hidden: school services (SCODI), night buses (TBNight, Flex'Night), on-demand flex
// (Flex' Artigues), tram-replacement + event shuttles (navettes), tram-works relief
// buses (Bus Relais) and one-off event lines (festivals).
//
// Matched on the GTFS route_long_name (with the short name as a fallback) rather than a
// hard-coded id list, so it stays correct as TBM adds new numbered navettes/SCODI lines.
// Type-only shape → no Prisma runtime, safe to import from client components.
const HIDDEN_LINE_PATTERNS: RegExp[] = [
  /\bnavette\b/i, // Navette Tram 1xx–4xx, Navette Stade Atlantique, Navette Arena
  /\bbus relais\b/i, // Bus Relais A–F (tram replacement)
  /\bflex/i, // Flex'Night 1–7, Flex' Artigues (transport à la demande)
  /\bscodi\b/i, // SCODI Sxx (scolaire)
  /\btbnight\b/i, // TBNight
  /\bfestival\b/i, // Festival Eysines Goes Soul (event shuttle)
];

export function isHiddenLine(line: { shortName: string; longName?: string | null }): boolean {
  const haystack = `${line.shortName} ${line.longName ?? ""}`;
  return HIDDEN_LINE_PATTERNS.some((pattern) => pattern.test(haystack));
}
