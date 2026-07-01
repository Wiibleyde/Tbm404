import type { SiriResponse } from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;

export async function fetchSiri(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<SiriResponse> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchWithTimeout(url, timeoutMs);
      if (!res.ok) throw new Error(`SIRI HTTP ${res.status}`);
      return (await res.json()) as SiriResponse;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS) await Bun.sleep(attempt * 1000);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
  } finally {
    clearTimeout(timer);
  }
}
