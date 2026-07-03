# TBM·404

Self-hosted, CovidTracker-style tracker of TBM (Bordeaux transit network) incidents.
It builds its own history by continuously polling the official SIRI-Lite feed and
enriches lines from the GTFS static feed. Live at https://tbm404.bonnell.fr.

## Stack

- **Bun** runtime, **Next.js 16** App Router + TypeScript + **Tailwind v4**
- **PostgreSQL** + **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Recharts** v3 (history charts), **Motion** (framer) for the front, **Biome** for lint/format
- Two processes: the Next app and a standalone **collector** (`src/collector`)
- Docker Compose (postgres + app + collector). The user runs the reverse-proxy / HTTPS
  themselves — do **not** add Caddy/Traefik/certs.
- **No unit/E2E tests** (deliberate). Comments only when non-obvious, in English.

## Commands

```bash
bun run dev              # next dev
bun run build            # prisma generate && next build
bun run collector        # run the SIRI poller + GTFS importer
bun run lint             # biome check .   (run before committing)
bun run format           # biome format --write .
bun run db:migrate:dev --name <x>   # create a migration (needs a running DB)
bun run db:migrate       # prisma migrate deploy (prod / CI)
```

## Prisma 7 gotchas (these bit us)

- `url` is gone from the `datasource` block → it lives in `prisma.config.ts`, which reads
  `process.env.DATABASE_URL` directly and starts with `import "dotenv/config"` (Bun does
  not inject `.env` into the `prisma` CLI subprocess).
- Generator is `provider = "prisma-client"` with `output = "../src/generated/prisma"`.
  Import the client from `@/generated/prisma/client`, **not** `@prisma/client`.
- Client-safe modules must `import type` the Prisma enums (a value import pulls the runtime
  into the client bundle → `node:module` error). String enums have `value === name`.
- Runtime uses a driver adapter: `new PrismaClient({ adapter: new PrismaPg({ ... }) })`.
- Prod uses **versioned migrations** (`prisma/migrations/`); both container entrypoints run
  `migrate deploy` on boot (advisory-locked, safe to run concurrently).

## Data-model notes

- SIRI general-message feed has **no severity / cause / effect** fields. `severity`,
  incident/works/recurring split, and `startsAt` are all **derived heuristics**
  (`src/lib/siri/classify.ts`, `src/lib/siri/eventDate.ts`). Intentionally rough.
- GTFS: only `routes.txt` is parsed (`src/lib/gtfs/`) — `stop_times.txt` is 137 MB, never
  parse it. SIRI `LineRef bordeaux:Line:07:LOC` ↔ GTFS `route_id` `07`. `route_type`
  0/1 → TRAM, 3 → BUS, 4 → BOAT.
- `Line.active` = "present in the current GTFS import". SIRI can reference unknown lines →
  `src/collector/sync.ts` creates inactive placeholders so incident FKs never break.
- Homepage % denominator = active, **visible** GTFS lines. Headline % counts only UNPLANNED
  incidents that have started (`startsAt <= now`); future events go to "À venir";
  PLANNED_WORKS are reported separately so the ratio doesn't stay pegged high.
- Line page slug = `shortName` (e.g. `/lignes/A`, `/lignes/5`), GTFS `code` as fallback.
- The front glitch intensity is **data-driven**: `--glitch` CSS var = f(disruptionRatio).

## Line visibility filter

`src/lib/line-filter.ts` (`isHiddenLine`) is the single source of truth for which lines the
site surfaces. Kept: trams, boats (LE BATO), regular buses (Lianes / Principale / Locale /
Directe / Ligne …) and **BUS EXPRESS**. Hidden: SCODI, TBNight, Flex'Night / Flex' Artigues,
Bus Relais, all navettes, and festival/event shuttles. Matched on `route_long_name` so it
stays correct as new numbered lines appear. Applied at every read surface: `status.ts`
(denominator + incident feed), `line-detail.ts` (index + line page), `history.ts` (top
affected lines). Add new exclusions by editing the pattern list in that one file.
