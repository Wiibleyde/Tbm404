import "dotenv/config";
import { defineConfig } from "prisma/config";

// CLI-only config (generate / db push / migrate). The runtime client gets its
// connection from the pg driver adapter in src/lib/prisma.ts, not from here.
// dotenv loads .env for the CLI (Bun does not inject it into the prisma
// subprocess); in Docker there's no .env and compose sets the env directly.
// Read process.env directly (not the throwing `env()` helper) so `generate`,
// which never connects, works at build time without DATABASE_URL set.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
