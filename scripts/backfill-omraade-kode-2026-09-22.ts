/**
 * Backfill: typet område (omraadeKode) på position_tasks fra den gamle
 * fritekst-lista, og normaliser `omraade`-etiketten til fasitens visning
 * (putting i fot med meter i parentes). Datafiks, ingen skjemaendring.
 *
 * «Putt 10-15» og «Putt 15-25» slås sammen til PUTT_10_25 (fasitens inndeling).
 *
 * Kjør: npx tsx scripts/backfill-omraade-kode-2026-09-22.ts [--skriv]
 * Uten --skriv: tørrkjøring, viser hva som ville endret seg.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { omraadeTilKode, omraadeVisning } from "../src/components/teknisk-plan/constants";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const SKRIV = process.argv.includes("--skriv");

async function main() {
  const rader = await prisma.positionTask.findMany({
    select: { id: true, omraade: true, omraadeKode: true },
  });
  let endret = 0;
  const ukjente = new Map<string, number>();
  for (const r of rader) {
    const kode = r.omraadeKode ?? omraadeTilKode(r.omraade);
    if (!kode) {
      ukjente.set(r.omraade, (ukjente.get(r.omraade) ?? 0) + 1);
      continue;
    }
    const etikett = omraadeVisning(kode);
    if (r.omraadeKode === kode && r.omraade === etikett) continue;
    endret++;
    if (SKRIV) {
      await prisma.positionTask.update({ where: { id: r.id }, data: { omraadeKode: kode, omraade: etikett } });
    } else {
      console.log(`${r.id}: «${r.omraade}» ${r.omraadeKode ?? "—"} → ${kode} «${etikett}»`);
    }
  }
  console.log(`${rader.length} oppgaver, ${endret} ${SKRIV ? "oppdatert" : "ville blitt oppdatert"}.`);
  if (ukjente.size) {
    console.log("Ukjente områder (ikke rørt):");
    for (const [k, n] of ukjente) console.log(`  «${k}» × ${n}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
