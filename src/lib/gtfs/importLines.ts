import { TransportMode } from "@/generated/prisma/client";
import { prisma } from "../prisma";
import { parseCsv } from "./csv";
import { downloadGtfsFile } from "./download";

export async function ensureLines(gtfsUrl: string): Promise<number> {
  const existing = await prisma.line.count({ where: { active: true } });
  if (existing > 0) return existing;
  return importLines(gtfsUrl);
}

export async function importLines(gtfsUrl: string): Promise<number> {
  const csv = await downloadGtfsFile(gtfsUrl, "routes.txt");
  const routes = parseCsv(csv);

  let imported = 0;
  for (const route of routes) {
    const routeId = route.route_id?.trim();
    if (!routeId) continue;

    const id = `bordeaux:Line:${routeId}:LOC`;
    const data = {
      code: routeId,
      shortName: route.route_short_name?.trim() || routeId,
      longName: route.route_long_name?.trim() || null,
      mode: modeFromRouteType(route.route_type?.trim()),
      color: normalizeColor(route.route_color),
      textColor: normalizeColor(route.route_text_color),
      active: true,
    };

    await prisma.line.upsert({ where: { id }, update: data, create: { id, ...data } });
    imported++;
  }
  return imported;
}

// GTFS route_type: 0 = tram/light rail, 1 = metro, 3 = bus, 4 = ferry.
function modeFromRouteType(routeType: string | undefined): TransportMode {
  switch (routeType) {
    case "0":
    case "1":
      return TransportMode.TRAM;
    case "3":
      return TransportMode.BUS;
    case "4":
      return TransportMode.BOAT;
    default:
      return TransportMode.OTHER;
  }
}

function normalizeColor(value: string | undefined): string | null {
  const hex = value?.trim();
  if (!hex) return null;
  return `#${hex.replace(/^#/, "")}`;
}
