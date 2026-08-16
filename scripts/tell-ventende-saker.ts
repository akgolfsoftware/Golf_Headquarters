/**
 * Teller ventende saker i køen (Jarvis steg 1). Ment kalt av det globale
 * Claude-verktøyet "messages" (SLA-sjekk) via:
 *
 *   npx tsx scripts/tell-ventende-saker.ts
 *
 * Skriver ett menneskelesbart sammendrag og én maskinlesbar JSON-linje.
 * Krever at tabellen "saker" finnes (se scripts/add-sak-tabell-2026-08-16.ts).
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [totalVenter, overFrist] = await Promise.all([
    prisma.sak.count({ where: { status: "VENTER" } }),
    prisma.sak.count({
      where: { status: "VENTER", frist: { lt: new Date() } },
    }),
  ]);

  console.log(`Ventende: ${totalVenter} (${overFrist} over frist)`);
  console.log(JSON.stringify({ ventende: totalVenter, overFrist }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
