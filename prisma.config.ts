// Prisma 7 config — erstatter url/directUrl i schema.prisma.
// `url` her brukes av Prisma CLI for migrasjoner.
// Runtime queries går via PrismaClient + driver adapter (se src/lib/prisma.ts).

import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma sin default `import "dotenv/config"` leser bare `.env`.
// Vi bruker `.env.local` (Next.js-konvensjon for secrets), så last den eksplisitt.
loadEnv({ path: ".env.local" });

// `env("DIRECT_URL")` kaster når variabelen mangler — og siden `postinstall`
// kjører `prisma generate`, døde HELE `npm install` på det. Det tok ned alle
// Vercel-preview-deployer 05.–10.08.2026 (DIRECT_URL var satt for Production,
// ikke for Preview); se docs/VERCEL-PREVIEW-FEIL-2026-08-10.md.
//
// `prisma generate` trenger ingen database — den leser bare schema.prisma.
// Derfor faller vi tilbake på en åpenbart ugyldig URL når variabelen mangler,
// slik at generering alltid virker. Kommandoer som FAKTISK snakker med
// databasen feiler fortsatt — men da på tilkoblingen, med en URL som sier hva
// som er galt, i stedet for å velte installasjonen.
//
// Merk: dette gjelder kun Prisma CLI. Runtime går via PrismaClient +
// driver adapter på DATABASE_URL (src/lib/prisma.ts) og er urørt.
const direkteUrl =
  process.env.DIRECT_URL ??
  "postgresql://mangler:mangler@direct-url-er-ikke-satt.invalid:5432/mangler";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // DIRECT_URL = direkte Postgres-tilkobling (port 5432). Migrasjoner krever
  // session-mode connection — pgbouncer transaction-mode (port 6543) støtter
  // ikke DDL-operasjoner som migrate trenger.
  datasource: {
    url: direkteUrl,
  },
});
