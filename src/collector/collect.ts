import { prisma } from "../lib/prisma";
import { fetchSiri } from "../lib/siri/fetch";
import { parseSiri } from "../lib/siri/parse";
import { syncIncidents } from "./sync";

export async function collectOnce(siriUrl: string, now: Date): Promise<void> {
  const startedAt = now;
  const start = performance.now();

  try {
    const raw = await fetchSiri(siriUrl);
    const messages = parseSiri(raw);
    const { newCount, endedCount } = await syncIncidents(messages, now);
    const durationMs = Math.round(performance.now() - start);

    await prisma.pollLog.create({
      data: {
        startedAt,
        ok: true,
        durationMs,
        messageCount: messages.length,
        newCount,
        endedCount,
      },
    });
    console.log(
      `[collect] ok messages=${messages.length} new=${newCount} ended=${endedCount} ${durationMs}ms`,
    );
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);

    await prisma.pollLog.create({ data: { startedAt, ok: false, durationMs, error: message } });
    console.error(`[collect] failed: ${message}`);
  }
}
