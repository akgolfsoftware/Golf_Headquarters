/**
 * Bootstrap/backfill for de 8 kanoniske AK Golf-gruppene (plan G1).
 *
 * Idempotent, i tre trinn per gruppe:
 *   1. Finnes på slug → sikre at program/managedByAkGolf/kind/level stemmer.
 *   2. Ellers: finnes på eksakt navn (engangs-migrering av eksisterende rader,
 *      f.eks. GFGK-gruppene og WANG-gruppa) → sett slug + taksonomifeltene.
 *   3. Ellers: opprett gruppen (WANG UNG, AK Golf Academy, AK Golf Junior
 *      Academy finnes ikke i prod i dag).
 *
 * Rører ALDRI medlemslister, tider eller planer — kun gruppens egne felter.
 * Kjøres etter scripts/add-gruppe-taksonomi-2026-08-16.ts:
 *
 *   npx tsx scripts/bootstrap-kanoniske-grupper-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { KANONISKE_GRUPPER } from "../src/lib/domain/grupper";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rapport: string[] = [];

  for (const g of KANONISKE_GRUPPER) {
    const taksonomi = {
      program: g.program,
      managedByAkGolf: true,
      kind: g.kind,
      level: g.level,
    };

    const paaSlug = await prisma.group.findUnique({ where: { slug: g.slug } });
    if (paaSlug) {
      await prisma.group.update({ where: { id: paaSlug.id }, data: taksonomi });
      rapport.push(`= ${g.slug}: fantes (slug), taksonomi sikret`);
      continue;
    }

    const paaNavn = await prisma.group.findFirst({
      where: { name: g.navn, slug: null },
    });
    if (paaNavn) {
      await prisma.group.update({
        where: { id: paaNavn.id },
        data: { slug: g.slug, ...taksonomi },
      });
      rapport.push(`~ ${g.slug}: migrert fra navn «${g.navn}» (id ${paaNavn.id})`);
      continue;
    }

    const ny = await prisma.group.create({
      data: { name: g.navn, slug: g.slug, ...taksonomi },
    });
    rapport.push(`+ ${g.slug}: opprettet (id ${ny.id})`);
  }

  console.log(rapport.join("\n"));

  const antall = await prisma.group.count({ where: { managedByAkGolf: true } });
  console.log(`\nAK Golf-administrerte grupper totalt: ${antall} (forventet ${KANONISKE_GRUPPER.length}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
