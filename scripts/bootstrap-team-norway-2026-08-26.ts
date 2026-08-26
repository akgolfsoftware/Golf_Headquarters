/**
 * Bootstrap/backfill for Team Norway-gruppen (plan N5).
 *
 * Egen, kirurgisk script — IKKE lagt inn i
 * scripts/bootstrap-kanoniske-grupper-2026-08-16.ts, som er en datert
 * historisk migrering for de opprinnelige 8 gruppene og hardkoder
 * managedByAkGolf: true for alle rader den rører. Team Norway skal ha
 * managedByAkGolf: false (se begrunnelse i src/lib/domain/grupper.ts) —
 * å kjøre det gamle scriptet uendret på denne gruppen ville gitt gratis
 * PlayerHQ-abonnement til enhver Team Norway-spiller, som ikke er en
 * AK Golf-administrert coachingrelasjon.
 *
 * Idempotent, samme tre-trinns mønster som originalscriptet:
 *   1. Finnes på slug "team-norway" → sikre taksonomi (program/kind/
 *      managedByAkGolf/level) stemmer med KANONISKE_GRUPPER.
 *   2. Ellers: finnes på eksakt navn uten slug → migrer inn slug+taksonomi.
 *   3. Ellers: opprett gruppen.
 *
 * Rører ALDRI medlemslister, tider eller planer — kun gruppens egne felter.
 *
 *   npx tsx scripts/bootstrap-team-norway-2026-08-26.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { kanoniskGruppe } from "../src/lib/domain/grupper";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const g = kanoniskGruppe("team-norway");
  const taksonomi = {
    program: g.program,
    managedByAkGolf: g.managedByAkGolf,
    kind: g.kind,
    level: g.level,
  };

  const paaSlug = await prisma.group.findUnique({ where: { slug: g.slug } });
  if (paaSlug) {
    await prisma.group.update({ where: { id: paaSlug.id }, data: taksonomi });
    console.log(`= ${g.slug}: fantes (slug), taksonomi sikret (id ${paaSlug.id})`);
    return;
  }

  const paaNavn = await prisma.group.findFirst({ where: { name: g.navn, slug: null } });
  if (paaNavn) {
    await prisma.group.update({
      where: { id: paaNavn.id },
      data: { slug: g.slug, ...taksonomi },
    });
    console.log(`~ ${g.slug}: migrert fra navn «${g.navn}» (id ${paaNavn.id})`);
    return;
  }

  const ny = await prisma.group.create({
    data: { name: g.navn, slug: g.slug, ...taksonomi },
  });
  console.log(`+ ${g.slug}: opprettet (id ${ny.id}, managedByAkGolf=${ny.managedByAkGolf})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
