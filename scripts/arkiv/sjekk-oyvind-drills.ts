#!/usr/bin/env tsx
/**
 * Sammenligner drill-utvalg for demo-spiller før/etter A–K-retag.
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type NgfKategori } from "../src/generated/prisma/client";
import { kategoriFraHcp } from "../src/lib/ai-plan/context";
import {
  AK_KATEGORI_ORDER,
  akKategoriIdx,
  akTilNgfKategori,
  hentSesongSnittscore,
  hentSpillerAkKategori,
} from "../src/lib/domain/spiller-kategori";
import { kategoriFraSnittscore } from "../src/lib/domain/ak-kategori";
import { avgScoreFromHcp } from "../src/lib/stats/sg-estimator";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ALLE_LEGACY: NgfKategori[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

async function countDrillsLegacy(kategori: NgfKategori | null): Promise<number> {
  if (!kategori) {
    return prisma.exerciseDefinition.count();
  }
  const idx = ALLE_LEGACY.indexOf(kategori);
  const tillattMin = ALLE_LEGACY.slice(0, idx + 1);
  const tillattMax = ALLE_LEGACY.slice(idx);
  return prisma.exerciseDefinition.count({
    where: {
      AND: [
        { OR: [{ minKategori: null }, { minKategori: { in: tillattMin } }] },
        { OR: [{ maxKategori: null }, { maxKategori: { in: tillattMax } }] },
      ],
    },
  });
}

async function countDrillsNy(kategori: ReturnType<typeof akTilNgfKategori> | null): Promise<number> {
  if (!kategori) {
    return prisma.exerciseDefinition.count();
  }
  const ak = kategori as (typeof AK_KATEGORI_ORDER)[number];
  const idx = akKategoriIdx(ak);
  const tillattMin = AK_KATEGORI_ORDER.slice(0, idx + 1).map(akTilNgfKategori);
  const tillattMax: NgfKategori[] = [
    ...AK_KATEGORI_ORDER.slice(idx).map(akTilNgfKategori),
    "L",
  ];
  return prisma.exerciseDefinition.count({
    where: {
      AND: [
        { OR: [{ minKategori: null }, { minKategori: { in: tillattMin } }] },
        { OR: [{ maxKategori: null }, { maxKategori: { in: tillattMax } }] },
      ],
    },
  });
}

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      name: { contains: "Øyvind", mode: "insensitive" },
      role: "PLAYER",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      hcp: true,
      tilgjengeligeFasiliteter: true,
    },
  });

  if (!user) {
    console.log("Fant ikke Øyvind Rohjan i DB.");
    return;
  }

  const wagr = await prisma.wagrSnapshot.findUnique({
    where: { userId: user.id },
    select: { ngfCategory: true, rank: true },
  });

  const sesongSnitt = await hentSesongSnittscore(user.id);
  const akNy = await hentSpillerAkKategori(user.id, {
    wagrNgfCategory: wagr?.ngfCategory ?? null,
    hcp: user.hcp,
  });
  const legacyKat = kategoriFraHcp(user.hcp);

  const runderIAar = await prisma.round.count({
    where: {
      userId: user.id,
      playedAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
    },
  });

  const drillsLegacy = await countDrillsLegacy(legacyKat);
  const drillsNy = await countDrillsNy(akNy ? akTilNgfKategori(akNy) : null);
  const total = await prisma.exerciseDefinition.count();

  console.log("\n═══ Øyvind Rohjan — drill-sammenligning ═══\n");
  console.log(`Spiller:     ${user.name}`);
  console.log(`HCP:         ${user.hcp ?? "—"}`);
  console.log(`WAGR:        ${wagr?.ngfCategory ?? "—"} (rank ${wagr?.rank ?? "—"})`);
  console.log(`Runder ${new Date().getFullYear()}: ${runderIAar}`);
  console.log(`Sesong-snitt: ${sesongSnitt != null ? sesongSnitt.toFixed(1) : "— (fallback HCP→snitt)"}`);
  if (sesongSnitt == null && user.hcp != null) {
    console.log(`  Estimat:   ${avgScoreFromHcp(user.hcp).toFixed(1)} → ${kategoriFraSnittscore(avgScoreFromHcp(user.hcp)).kategori}`);
  }
  console.log("");
  console.log("KATEGORI:");
  console.log(`  Før (HCP A–L):     ${legacyKat ?? "—"}`);
  console.log(`  Nå (snitt A–K):    ${akNy ?? "—"} ${akNy ? `(${kategoriFraSnittscore(sesongSnitt ?? avgScoreFromHcp(user.hcp ?? 20)).niva})` : ""}`);
  console.log("");
  console.log("DRILLS I FILTER:");
  console.log(`  Før:  ${drillsLegacy} / ${total} (${((drillsLegacy / total) * 100).toFixed(0)}%)`);
  console.log(`  Nå:   ${drillsNy} / ${total} (${((drillsNy / total) * 100).toFixed(0)}%)`);
  console.log(`  Delta: ${drillsNy - drillsLegacy >= 0 ? "+" : ""}${drillsNy - drillsLegacy}`);
  console.log("");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());