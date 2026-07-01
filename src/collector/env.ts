function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function number(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  SIRI_URL: required("SIRI_URL"),
  GTFS_URL:
    process.env.GTFS_URL ??
    "https://bdx.mecatran.com/utw/ws/gtfsfeed/static/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt",
  POLL_INTERVAL_SECONDS: number("POLL_INTERVAL_SECONDS", 180),
  GTFS_REFRESH_HOURS: number("GTFS_REFRESH_HOURS", 24),
};
