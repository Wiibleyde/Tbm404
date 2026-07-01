import { unzipSync } from "fflate";

// Extract a single file from the GTFS zip without decompressing the rest
// (stop_times.txt alone is ~130 MB and we never need it).
export async function downloadGtfsFile(url: string, fileName: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GTFS HTTP ${res.status}`);

  const archive = new Uint8Array(await res.arrayBuffer());
  const extracted = unzipSync(archive, { filter: (file) => file.name === fileName });
  const bytes = extracted[fileName];
  if (!bytes) throw new Error(`${fileName} not found in GTFS archive`);

  return new TextDecoder().decode(bytes);
}
