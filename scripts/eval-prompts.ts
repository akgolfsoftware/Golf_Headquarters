#!/usr/bin/env tsx
/**
 * eval-prompts — porten mot forfall.
 *
 * HVA DENNE MÅLER, og hva den ikke måler:
 *
 * Masterbrain har sin egen `scripts/eval-holdout.py`. Den sjekker om FASITEN
 * inneholder det som trengs for å svare. Denne sjekker noe annet: om KONTEKSTEN
 * APPEN FAKTISK INJISERER (`byggFasitKontekst`) bærer de samme fakta fram til
 * modellen. Fasiten kan være komplett samtidig som vårt kontekstlag mister noe
 * på veien — det er nettopp den feilen denne fanger.
 *
 * To lag:
 *
 *   Lag 1 — fasit-dekning (standard). Ingen språkmodell, ingen API-nøkkel,
 *   ingen kostnad. Kjører i CI. For hver holdout-case: bygger vi en kontekst
 *   som inneholder den forventede svingfeilen, SG-båndet og hypotese-språket?
 *
 *   Lag 2 — modellkjøring (`--med-modell`). Kjører de ekte promptene mot
 *   modellen og scorer svaret. Koster penger og krever ANTHROPIC_API_KEY, så
 *   den er opt-in og kjøres lokalt før en promptendring merges.
 *
 * TAK Å VÆRE KLAR OVER: rubrikkens `drill_exists`-dimensjon gir nødvendigvis 0
 * så lenge drill-banken er tom (tømt 2026-07-31). Maks oppnåelig er derfor
 * 4 av 5 dimensjoner. Det er ikke en regresjon.
 *
 *   npm run eval:prompts              # lag 1
 *   npm run eval:prompts -- --med-modell
 *   npm run eval:prompts -- --oppdater-baseline
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { byggFasitKontekst } from "../src/lib/agenticos/kontekst";
import { harDrillBank, masterbrain } from "../src/lib/masterbrain";
import type { Klassifisering } from "../src/lib/agenticos/typer";

const ROT = resolve(__dirname, "..");
const HOLDOUT = join(ROT, "src/lib/masterbrain/training-data/eval/holdout-15.jsonl");
const BASELINE = join(ROT, "eval/baseline.json");

type HoldoutCase = {
  id: string;
  scenario: string;
  input: {
    player?: { category?: string; l_fase?: string; period?: string };
    sg_profile?: Record<string, unknown>;
  };
  expected: {
    primary_sg_band?: string | null;
    primary_fault?: string | null;
    drill?: string | null;
    [k: string]: unknown;
  };
};

type Sjekk = { navn: string; ok: boolean; detalj?: string };
type CaseResultat = { id: string; scenario: string; sjekker: Sjekk[]; score: number; maks: number };

function lesHoldout(): HoldoutCase[] {
  if (!existsSync(HOLDOUT)) {
    console.error(`Fant ikke holdout-settet: ${HOLDOUT}`);
    console.error("Kjør `npm run sync:masterbrain` først.");
    process.exit(1);
  }
  return readFileSync(HOLDOUT, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as HoldoutCase);
}

/** SG-bånd i settet er enten en kategori (ott/app/arg/putt) eller et APP-bånd («150-200»). */
function sgOmradeFor(band: string | null | undefined): string | undefined {
  if (!band) return undefined;
  const kategori = band.toLowerCase();
  if (["ott", "app", "arg", "putt"].includes(kategori)) return kategori;
  // Distansebånd hører til APP.
  return "app";
}

function klassifiseringFor(c: HoldoutCase): Klassifisering {
  // Casene handler om å tolke en spillers tall og foreslå fokus — samme flate
  // som SG-tolkning. TEKNIKK når en konkret svingfeil forventes.
  const teknisk = Boolean(c.expected.primary_fault);
  return {
    intent: teknisk ? "teknikk" : "tolk-tall",
    domene: teknisk ? "TEKNIKK" : "SG",
    rolle: "COACH",
    mindreaarig: false,
    confidence: 1,
  };
}

function evaluerCase(c: HoldoutCase): CaseResultat {
  const sjekker: Sjekk[] = [];
  const k = klassifiseringFor(c);
  const blokk = byggFasitKontekst(k, {
    sgOmrade: sgOmradeFor(c.expected.primary_sg_band),
    akKategori: c.input.player?.category,
  });
  const innhold = blokk?.innhold ?? "";

  sjekker.push({
    navn: "kontekst_finnes",
    ok: innhold.length > 0,
    detalj: blokk ? `${innhold.length} tegn` : "ingen fasit-blokk bygget",
  });

  // Forventet svingfeil må være navngitt i konteksten — ellers kan modellen
  // umulig lande på den uten å gjette.
  const feil = c.expected.primary_fault;
  if (feil) {
    const iFasit = feil in
      ((masterbrain.faults as { entities?: Record<string, unknown> }).entities ?? {});
    sjekker.push({ navn: "fault_i_fasit", ok: iFasit, detalj: feil });
    sjekker.push({
      navn: "fault_i_kontekst",
      ok: innhold.includes(feil),
      detalj: feil,
    });
  }

  // SG-bånd: konteksten må omtale området.
  const band = c.expected.primary_sg_band;
  if (band) {
    const omrade = sgOmradeFor(band);
    const nevnt =
      innhold.toLowerCase().includes(band.toLowerCase()) ||
      (omrade ? innhold.toUpperCase().includes(omrade.toUpperCase()) : false);
    sjekker.push({ navn: "sg_band_i_kontekst", ok: nevnt, detalj: band });
  }

  // Hypotese-språket kreves når funnet springer ut av et SG-TALL. En svingfeil
  // uten SG-bånd (ho-002) er observert på video, ikke utledet fra statistikk —
  // da er forbeholdet ikke relevant, og å kreve det ville vært å teste feil ting.
  if (band) {
    sjekker.push({
      navn: "hypotese_spraak",
      ok: /må bekreftes med video|HYPOTESER|dekker ikke putting/i.test(innhold),
      detalj: "SG→feil skal aldri presenteres som diagnose",
    });
  }

  // Drill-dimensjonen: kjent tak så lenge banken er tom.
  if (c.expected.drill) {
    sjekker.push({
      navn: "drill_finnes",
      ok: harDrillBank(),
      detalj: harDrillBank() ? String(c.expected.drill) : "drill-banken er tom (kjent tak)",
    });
  }

  const score = sjekker.filter((s) => s.ok).length;
  return { id: c.id, scenario: c.scenario, sjekker, score, maks: sjekker.length };
}

type Rapport = {
  kjort: string;
  totalScore: number;
  totalMaks: number;
  drillBankTom: boolean;
  caser: Array<{ id: string; score: number; maks: number; feilet: string[] }>;
};

function byggRapport(res: CaseResultat[], naa: string): Rapport {
  return {
    kjort: naa,
    totalScore: res.reduce((a, r) => a + r.score, 0),
    totalMaks: res.reduce((a, r) => a + r.maks, 0),
    drillBankTom: !harDrillBank(),
    caser: res.map((r) => ({
      id: r.id,
      score: r.score,
      maks: r.maks,
      feilet: r.sjekker.filter((s) => !s.ok).map((s) => `${s.navn}${s.detalj ? ` (${s.detalj})` : ""}`),
    })),
  };
}

function main() {
  const args = process.argv.slice(2);
  const oppdaterBaseline = args.includes("--oppdater-baseline");
  const medModell = args.includes("--med-modell");

  if (medModell) {
    console.error(
      "Lag 2 (--med-modell) er ikke implementert ennå. Lag 1 kjører uten modell og uten kostnad.",
    );
    process.exit(2);
  }

  const caser = lesHoldout();
  const res = caser.map(evaluerCase);
  // Tidsstempelet kommer utenfra scriptets logikk, aldri inn i scoringen.
  const rapport = byggRapport(res, new Date().toISOString());

  for (const r of res) {
    const status = r.score === r.maks ? "OK  " : "AVVIK";
    console.log(`${status} ${r.id} ${r.scenario.padEnd(28)} ${r.score}/${r.maks}`);
    for (const s of r.sjekker.filter((x) => !x.ok)) {
      console.log(`        ✗ ${s.navn}${s.detalj ? ` — ${s.detalj}` : ""}`);
    }
  }
  console.log(`\nTotalt: ${rapport.totalScore}/${rapport.totalMaks}`);
  if (rapport.drillBankTom) {
    console.log("Merk: drill-banken er tom — drill_finnes gir 0 med vilje. Ikke en regresjon.");
  }

  if (oppdaterBaseline) {
    writeFileSync(BASELINE, `${JSON.stringify(rapport, null, 2)}\n`, "utf8");
    console.log(`\nBaseline oppdatert: ${BASELINE}`);
    return;
  }

  if (!existsSync(BASELINE)) {
    console.error(
      `\nIngen baseline. Kjør \`npm run eval:prompts -- --oppdater-baseline\` for å sette dagens nivå.`,
    );
    process.exit(1);
  }

  const forrige = JSON.parse(readFileSync(BASELINE, "utf8")) as Rapport;
  // Sammenlign andel, ikke absolutt tall: antall sjekker endrer seg når
  // holdout-settet eller sjekkene utvides.
  const naaAndel = rapport.totalScore / rapport.totalMaks;
  const forAndel = forrige.totalScore / forrige.totalMaks;
  console.log(
    `Baseline: ${forrige.totalScore}/${forrige.totalMaks} (${(forAndel * 100).toFixed(1)} %) — nå ${(naaAndel * 100).toFixed(1)} %`,
  );

  if (naaAndel < forAndel - 1e-9) {
    console.error(
      "\nEVAL FEILET: fasit-dekningen er dårligere enn baseline. En promptversjon eller " +
        "kontekstendring skal ikke rulles ut med lavere dekning.",
    );
    process.exit(1);
  }
  console.log("Eval OK — ingen regresjon.");
}

main();
