#!/usr/bin/env tsx
/**
 * Drill-QA — kvalitetssjekk av ExerciseDefinition-banken.
 *
 *   npx tsx scripts/drill-qa.ts      # rapport til konsoll + docs/drill-qa-rapport.md
 *   npm run qa:drills
 *
 * KUN LESING — gjør ingen endringer i databasen.
 *
 * Klassifiserer funn i tre alvorlighetsgrader:
 *   ERROR  objektiv datafeil — bør blokkere (exit-kode 1).
 *          (duplikat-navn, tom/tynn beskrivelse, omvendt HCP-range,
 *           omvendt kategori-range mot bankens egen konvensjon,
 *           intensitet utenfor 1–10.)
 *   WARN   kompletthetshull som svekker forslag-motoren / balanse-skjevhet.
 *          (golf-drill uten skillArea, manglende treningstype, skjev
 *           område-/treningstype-fordeling.)
 *   INFO   bevissthet — dekningsgrad (video, fasilitetskrav, coach-notater).
 *
 * Tersklene for WARN (skjevhet) er bevisst justerbare — se KONFIG nederst.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// NGF-kategori-skala: A (best) → L (lavest). Indeks brukes til range-sjekk.
const KATEGORI_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const katIdx = (k: string | null): number | null =>
  k == null ? null : KATEGORI_ORDER.indexOf(k);

// Golf-disipliner som SKAL ha en skillArea (FYS/TURN er unntatt — fysisk/
// turnerings-trening har ikke nødvendigvis et golf-ferdighetsområde).
const KREVER_SKILLAREA = new Set(["TEK", "SLAG", "SPILL"]);

// KONFIG — justerbare terskler for balanse-advarsler.
const BLOKK_MAKS_ANDEL = 0.7; // WARN hvis BLOKK-trening > 70 % av banken.
const OMRADE_MIN_ANDEL = 0.05; // WARN hvis et pyramide-område < 5 % av banken.
const TYNN_BESKRIVELSE = 20; // tegn — kortere regnes som mangelfull.

type Sev = "ERROR" | "WARN" | "INFO";
type Finding = { sev: Sev; rule: string; drill: string; detail: string };

type Drill = {
  id: string;
  name: string;
  description: string | null;
  videoUrl: string | null;
  pyramidArea: string;
  skillArea: string | null;
  minKategori: string | null;
  maxKategori: string | null;
  minHcp: number | null;
  maxHcp: number | null;
  intensitet: number | null;
  treningstype: string | null;
  fasilitetKrav: string[];
  coachNotes: string | null;
  csTargetByKategori: unknown;
  source: string;
};

async function main() {
  const drills = (await prisma.exerciseDefinition.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      videoUrl: true,
      pyramidArea: true,
      skillArea: true,
      minKategori: true,
      maxKategori: true,
      minHcp: true,
      maxHcp: true,
      intensitet: true,
      treningstype: true,
      fasilitetKrav: true,
      coachNotes: true,
      csTargetByKategori: true,
      source: true,
    },
  })) as Drill[];

  const total = drills.length;
  const findings: Finding[] = [];

  // --- ERROR: duplikat-navn (case-insensitivt) ---
  const byName = new Map<string, Drill[]>();
  for (const d of drills) {
    const key = d.name.trim().toLowerCase();
    (byName.get(key) ?? byName.set(key, []).get(key)!).push(d);
  }
  for (const [, group] of byName) {
    if (group.length > 1) {
      findings.push({
        sev: "ERROR",
        rule: "duplikat-navn",
        drill: group[0].name,
        detail: `${group.length} driller deler dette navnet`,
      });
    }
  }

  // --- Per-drill-sjekker ---
  let manglerVideo = 0;
  let tomFasilitet = 0;
  let manglerCoachNotes = 0;
  let manglerCsTarget = 0;

  for (const d of drills) {
    // ERROR: tom/tynn beskrivelse
    if (!d.description || d.description.trim().length < TYNN_BESKRIVELSE) {
      findings.push({
        sev: "ERROR",
        rule: "tynn-beskrivelse",
        drill: d.name,
        detail: `beskrivelse ${d.description ? `${d.description.trim().length} tegn` : "mangler"}`,
      });
    }

    // ERROR: omvendt HCP-range
    if (d.minHcp != null && d.maxHcp != null && d.minHcp > d.maxHcp) {
      findings.push({
        sev: "ERROR",
        rule: "omvendt-hcp-range",
        drill: d.name,
        detail: `minHcp ${d.minHcp} > maxHcp ${d.maxHcp}`,
      });
    }

    // ERROR: intensitet utenfor 1–10
    if (d.intensitet != null && (d.intensitet < 1 || d.intensitet > 10)) {
      findings.push({
        sev: "ERROR",
        rule: "intensitet-utenfor-skala",
        drill: d.name,
        detail: `intensitet ${d.intensitet} (forventet 1–10)`,
      });
    }

    // ERROR: omvendt kategori-range. Kanonisk konvensjon (src/lib/ai-plan/
    // context.ts:236-238): minKategori = beste (laveste indeks, A),
    // maxKategori = laveste (L), slik at idx(min) <= idx(max). Er den omvendt
    // (idx(min) > idx(max)) matcher drillen INGEN spiller i kategori-filteret
    // og blir usynlig i AI-plan-forslag.
    const lo = katIdx(d.minKategori);
    const hi = katIdx(d.maxKategori);
    if (lo != null && hi != null && lo > hi) {
      findings.push({
        sev: "ERROR",
        rule: "kategori-range-omvendt",
        drill: d.name,
        detail: `min ${d.minKategori} / maks ${d.maxKategori} — idx(min)>idx(max): usynlig i kategori-filter`,
      });
    }

    // WARN: golf-drill uten skillArea
    if (KREVER_SKILLAREA.has(d.pyramidArea) && !d.skillArea) {
      findings.push({
        sev: "WARN",
        rule: "mangler-skillarea",
        drill: d.name,
        detail: `${d.pyramidArea}-drill uten skillArea`,
      });
    }

    // WARN: manglende treningstype
    if (!d.treningstype) {
      findings.push({
        sev: "WARN",
        rule: "mangler-treningstype",
        drill: d.name,
        detail: "treningstype ikke satt",
      });
    }

    // INFO-tellere
    if (!d.videoUrl) manglerVideo++;
    if (!d.fasilitetKrav || d.fasilitetKrav.length === 0) tomFasilitet++;
    if (!d.coachNotes) manglerCoachNotes++;
    if (d.csTargetByKategori == null) manglerCsTarget++;
  }

  // --- Balanse: pyramide-område ---
  const byArea = new Map<string, number>();
  for (const d of drills) byArea.set(d.pyramidArea, (byArea.get(d.pyramidArea) ?? 0) + 1);
  for (const [area, n] of byArea) {
    if (n / total < OMRADE_MIN_ANDEL) {
      findings.push({
        sev: "WARN",
        rule: "tynn-omrade-dekning",
        drill: area,
        detail: `${n} driller (${pct(n, total)}) — under ${pct(OMRADE_MIN_ANDEL * total, total)} terskel`,
      });
    }
  }

  // --- Balanse: treningstype (blokk-skjevhet) ---
  const byType = new Map<string, number>();
  for (const d of drills) {
    const t = d.treningstype ?? "(mangler)";
    byType.set(t, (byType.get(t) ?? 0) + 1);
  }
  const blokk = byType.get("BLOKK") ?? 0;
  if (blokk / total > BLOKK_MAKS_ANDEL) {
    findings.push({
      sev: "WARN",
      rule: "blokk-skjevhet",
      drill: "BLOKK",
      detail: `${blokk} driller (${pct(blokk, total)}) er blokk-trening — over ${Math.round(BLOKK_MAKS_ANDEL * 100)} % terskel`,
    });
  }

  // ---------- RAPPORT ----------
  const errors = findings.filter((f) => f.sev === "ERROR");
  const warns = findings.filter((f) => f.sev === "WARN");

  const lines: string[] = [];
  const log = (s = "") => {
    lines.push(s);
    console.log(s);
  };

  log("");
  log("=== DRILL-QA ===");
  log(`Driller totalt: ${total}  (kun source=SYSTEM teller hvis ikke annet)`);
  log(`ERROR: ${errors.length}   WARN: ${warns.length}`);
  log("");

  // Område-fordeling
  log("Område-fordeling:");
  for (const [area, n] of [...byArea.entries()].sort((a, b) => b[1] - a[1])) {
    log(`  ${area.padEnd(6)} ${String(n).padStart(4)}  ${pct(n, total)}`);
  }
  log("");
  log("Treningstype-fordeling:");
  for (const [t, n] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    log(`  ${t.padEnd(12)} ${String(n).padStart(4)}  ${pct(n, total)}`);
  }
  log("");

  // Dekningsgrad (INFO)
  log("Dekningsgrad:");
  log(`  Video:           ${total - manglerVideo}/${total}  (${manglerVideo} mangler)`);
  log(`  Fasilitetskrav:  ${total - tomFasilitet}/${total}  (${tomFasilitet} uten — kan være gyldig «ingen krav»)`);
  log(`  Coach-notater:   ${total - manglerCoachNotes}/${total}  (${manglerCoachNotes} mangler)`);
  log(`  CS-target:       ${total - manglerCsTarget}/${total}  (${manglerCsTarget} mangler)`);
  log("");

  // ERROR/WARN-detaljer gruppert per regel
  for (const sev of ["ERROR", "WARN"] as const) {
    const list = findings.filter((f) => f.sev === sev);
    if (list.length === 0) continue;
    log(`--- ${sev} (${list.length}) ---`);
    const byRule = new Map<string, Finding[]>();
    for (const f of list) (byRule.get(f.rule) ?? byRule.set(f.rule, []).get(f.rule)!).push(f);
    for (const [rule, fs] of byRule) {
      log(`  ${rule} (${fs.length}):`);
      for (const f of fs.slice(0, 15)) log(`    - ${f.drill} — ${f.detail}`);
      if (fs.length > 15) log(`    … +${fs.length - 15} til (se markdown-rapport)`);
    }
    log("");
  }

  // Skriv markdown-rapport
  writeReport(total, byArea, byType, findings, {
    manglerVideo,
    tomFasilitet,
    manglerCoachNotes,
    manglerCsTarget,
  });

  const out = join(process.cwd(), "docs", "drill-qa-rapport.md");
  log(`Rapport skrevet: ${out}`);

  await prisma.$disconnect();
  if (errors.length > 0) {
    console.error(`\nFEILET: ${errors.length} ERROR-funn. Rett dem og kjør på nytt.`);
    process.exit(1);
  }
}

function pct(n: number, total: number): string {
  return total === 0 ? "0 %" : `${((n / total) * 100).toFixed(1)} %`;
}

function writeReport(
  total: number,
  byArea: Map<string, number>,
  byType: Map<string, number>,
  findings: Finding[],
  dekning: {
    manglerVideo: number;
    tomFasilitet: number;
    manglerCoachNotes: number;
    manglerCsTarget: number;
  },
) {
  const md: string[] = [];
  const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);
  md.push(`# Drill-QA-rapport`);
  md.push("");
  md.push(`Generert ${stamp} · ${total} driller`);
  md.push("");

  const errors = findings.filter((f) => f.sev === "ERROR").length;
  const warns = findings.filter((f) => f.sev === "WARN").length;
  md.push(`**ERROR:** ${errors}  ·  **WARN:** ${warns}`);
  md.push("");

  md.push("## Område-fordeling");
  md.push("");
  md.push("| Område | Antall | Andel |");
  md.push("|---|---|---|");
  for (const [a, n] of [...byArea.entries()].sort((x, y) => y[1] - x[1])) {
    md.push(`| ${a} | ${n} | ${pct(n, total)} |`);
  }
  md.push("");

  md.push("## Treningstype-fordeling");
  md.push("");
  md.push("| Type | Antall | Andel |");
  md.push("|---|---|---|");
  for (const [t, n] of [...byType.entries()].sort((x, y) => y[1] - x[1])) {
    md.push(`| ${t} | ${n} | ${pct(n, total)} |`);
  }
  md.push("");

  md.push("## Dekningsgrad");
  md.push("");
  md.push("| Felt | Dekket | Mangler |");
  md.push("|---|---|---|");
  md.push(`| Video | ${total - dekning.manglerVideo} | ${dekning.manglerVideo} |`);
  md.push(`| Fasilitetskrav | ${total - dekning.tomFasilitet} | ${dekning.tomFasilitet} |`);
  md.push(`| Coach-notater | ${total - dekning.manglerCoachNotes} | ${dekning.manglerCoachNotes} |`);
  md.push(`| CS-target | ${total - dekning.manglerCsTarget} | ${dekning.manglerCsTarget} |`);
  md.push("");

  for (const sev of ["ERROR", "WARN"] as const) {
    const list = findings.filter((f) => f.sev === sev);
    if (list.length === 0) continue;
    md.push(`## ${sev} (${list.length})`);
    md.push("");
    md.push("| Regel | Drill | Detalj |");
    md.push("|---|---|---|");
    for (const f of list) md.push(`| ${f.rule} | ${f.drill} | ${f.detail} |`);
    md.push("");
  }

  writeFileSync(join(process.cwd(), "docs", "drill-qa-rapport.md"), md.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
