// Prisma 7 config — erstatter url/directUrl i schema.prisma.
// `url` her brukes av Prisma CLI for migrasjoner.
// Runtime queries går via PrismaClient + driver adapter (se src/lib/prisma.ts).

import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma sin default `import "dotenv/config"` leser bare `.env`.
// Vi bruker `.env.local` (Next.js-konvensjon for secrets), så last den eksplisitt.
loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // DIRECT_URL = direkte Postgres-tilkobling (port 5432). Migrasjoner krever
  // session-mode connection — pgbouncer transaction-mode (port 6543) støtter
  // ikke DDL-operasjoner som migrate trenger.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
