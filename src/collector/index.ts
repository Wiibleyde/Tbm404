import { ensureLines, importLines } from "../lib/gtfs/importLines";
import { collectOnce } from "./collect";
import { env } from "./env";

const HOUR_MS = 3_600_000;

async function main(): Promise<void> {
  console.log(`[collector] boot, interval=${env.POLL_INTERVAL_SECONDS}s`);

  try {
    const count = await ensureLines(env.GTFS_URL);
    console.log(`[collector] lines ready (${count})`);
  } catch (err) {
    console.error("[collector] GTFS import failed, continuing with placeholders:", err);
  }

  let lastGtfsRefresh = Date.now();

  while (true) {
    await collectOnce(env.SIRI_URL, new Date());

    if (Date.now() - lastGtfsRefresh > env.GTFS_REFRESH_HOURS * HOUR_MS) {
      try {
        const count = await importLines(env.GTFS_URL);
        console.log(`[collector] GTFS refreshed (${count})`);
        lastGtfsRefresh = Date.now();
      } catch (err) {
        console.error("[collector] GTFS refresh failed:", err);
      }
    }

    await Bun.sleep(env.POLL_INTERVAL_SECONDS * 1000);
  }
}

main().catch((err) => {
  console.error("[collector] fatal:", err);
  process.exit(1);
});
