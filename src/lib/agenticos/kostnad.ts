// Kostnads- og kvalitetsoversikt over AgenticOS-loggen.
//
// Med AiInteraksjon på plass er «hva koster AI-en per abonnent» og «hvilken
// promptversjon fungerer» SQL-spørsmål, ikke gjetning. Denne modulen er de
// spørringene.
//
// ÆRLIGHET OM TALLENE: bare `ai-plan` regner ut og lagrer `kostUsd` i dag. De
// øvrige flatene logger tokens, men ikke kost. Å summere `kostUsd` alene ville
// gitt et tall som SER UT som totalen, men er én flates forbruk.
//
// Derfor: kost utledes fra tokens via PRISER under. Modeller uten en pris vi kan
// stå inne for rapporteres som «ukjent pris» med tokens synlig, aldri som 0 og
// aldri med en gjettet sats. Fyll inn PRISER etter hvert som satsene bekreftes.

import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * USD per million tokens, per modell-id.
 *
 * Sonnet 4.5-satsen er hentet fra `src/lib/ai-plan/generate.ts`, som er den
 * eneste prisen som allerede var forankret i repoet. De øvrige står bevisst
 * tomme framfor å bli gjettet — en oppdiktet sats er verre enn «ukjent».
 */
export const PRISER: Record<string, { inn: number; ut: number }> = {
  "claude-sonnet-4-5-20250514": { inn: 3, ut: 15 },
};

/** Lokale modeller koster ingenting i API-avgift. */
const GRATIS_MODELLER = new Set(["llama3.1"]);

export type ModellForbruk = {
  modell: string;
  antall: number;
  tokensInn: number;
  tokensUt: number;
  /** Null når vi ikke har en pris vi kan stå inne for. */
  kostUsd: number | null;
};

function beregnKost(m: ModellForbruk): number | null {
  if (GRATIS_MODELLER.has(m.modell)) return 0;
  const pris = PRISER[m.modell];
  if (!pris) return null;
  return (m.tokensInn / 1_000_000) * pris.inn + (m.tokensUt / 1_000_000) * pris.ut;
}

export type MaanedsForbruk = {
  /** «2026-08» i Oslo-tid. */
  maaned: string;
  antall: number;
  perModell: ModellForbruk[];
  kjentKostUsd: number;
  /** Interaksjoner der modellen mangler pris — kosten er reell, men ukjent. */
  utenPris: number;
};

type MaanedRad = {
  maaned: string;
  modell: string;
  antall: bigint;
  tokens_inn: bigint | null;
  tokens_ut: bigint | null;
};

/**
 * Forbruk per måned og modell, siste `maaneder` måneder.
 *
 * Måned bøttes i Oslo-tid, ikke UTC — Vercel kjører UTC, og en interaksjon
 * 1. august kl. 01:00 norsk tid hører til august, ikke juli.
 */
export async function hentMaanedsForbruk(maaneder = 6): Promise<MaanedsForbruk[]> {
  const rader = await prisma.$queryRaw<MaanedRad[]>`
    SELECT
      to_char("createdAt" AT TIME ZONE 'Europe/Oslo', 'YYYY-MM') AS maaned,
      modell,
      count(*) AS antall,
      sum(coalesce("tokensInn", 0)) AS tokens_inn,
      sum(coalesce("tokensUt", 0)) AS tokens_ut
    FROM ai_interaksjoner
    WHERE "createdAt" >= (now() - make_interval(months => ${maaneder}))
    GROUP BY 1, 2
    ORDER BY 1 DESC, 2
  `;

  const perMaaned = new Map<string, MaanedsForbruk>();
  for (const r of rader) {
    const forbruk: ModellForbruk = {
      modell: r.modell,
      antall: Number(r.antall),
      tokensInn: Number(r.tokens_inn ?? 0),
      tokensUt: Number(r.tokens_ut ?? 0),
      kostUsd: null,
    };
    forbruk.kostUsd = beregnKost(forbruk);

    const bøtte = perMaaned.get(r.maaned) ?? {
      maaned: r.maaned,
      antall: 0,
      perModell: [],
      kjentKostUsd: 0,
      utenPris: 0,
    };
    bøtte.antall += forbruk.antall;
    bøtte.perModell.push(forbruk);
    if (forbruk.kostUsd === null) bøtte.utenPris += forbruk.antall;
    else bøtte.kjentKostUsd += forbruk.kostUsd;
    perMaaned.set(r.maaned, bøtte);
  }
  return [...perMaaned.values()];
}

export type PromptversjonStat = {
  promptId: string;
  promptVersjon: number;
  antall: number;
  godkjent: number;
  avvist: number;
  ventende: number;
  /**
   * Andel godkjent av de som FAKTISK er avgjort. Null når ingen er avgjort —
   * flater uten godkjenningsflyt (daily-brief, live-coach) står alltid PENDING,
   * og en rate på 0 % der ville vært misvisende.
   */
  godkjenningsrate: number | null;
};

type PromptRad = {
  promptId: string;
  promptVersjon: number;
  antall: bigint;
  godkjent: bigint;
  avvist: bigint;
  ventende: bigint;
};

/**
 * Kvalitet per promptversjon. Dette er tallet som svarer på «ble svarene
 * dårligere etter at vi endret prompten?».
 */
export async function hentPromptversjonStats(): Promise<PromptversjonStat[]> {
  const rader = await prisma.$queryRaw<PromptRad[]>`
    SELECT
      "promptId",
      "promptVersjon",
      count(*) AS antall,
      count(*) FILTER (WHERE utfall = 'GODKJENT') AS godkjent,
      count(*) FILTER (WHERE utfall = 'AVVIST') AS avvist,
      count(*) FILTER (WHERE utfall = 'PENDING') AS ventende
    FROM ai_interaksjoner
    GROUP BY 1, 2
    ORDER BY 1, 2 DESC
  `;

  return rader.map((r) => {
    const godkjent = Number(r.godkjent);
    const avvist = Number(r.avvist);
    const avgjort = godkjent + avvist;
    return {
      promptId: r.promptId,
      promptVersjon: r.promptVersjon,
      antall: Number(r.antall),
      godkjent,
      avvist,
      ventende: Number(r.ventende),
      godkjenningsrate: avgjort > 0 ? godkjent / avgjort : null,
    };
  });
}

export type AvvisGrunnStat = { begrunnelse: string; antall: number };

/**
 * Hvorfor forslag avvises, aggregert. Den mest verdifulle datakilden vi har —
 * og grunnen til at avvisningsgrunn er kodet og ikke fri tekst.
 */
export async function hentAvvisGrunner(): Promise<AvvisGrunnStat[]> {
  const rader = await prisma.$queryRaw<Array<{ begrunnelse: string; antall: bigint }>>`
    SELECT begrunnelse, count(*) AS antall
    FROM ai_interaksjoner
    WHERE utfall = 'AVVIST' AND begrunnelse IS NOT NULL
    GROUP BY 1
    ORDER BY 2 DESC
  `;
  return rader.map((r) => ({ begrunnelse: r.begrunnelse, antall: Number(r.antall) }));
}

export type AgenticOsOversikt = {
  maaneder: MaanedsForbruk[];
  promptversjoner: PromptversjonStat[];
  avvisGrunner: AvvisGrunnStat[];
  /** Modeller vi mangler pris for. Tom liste = alle kostnader er dekket. */
  modellerUtenPris: string[];
};

/** Alt på én gang, for agent-oversikten. Tåler at tabellen ikke finnes ennå. */
export async function hentAgenticOsOversikt(): Promise<AgenticOsOversikt | null> {
  try {
    const [maaneder, promptversjoner, avvisGrunner] = await Promise.all([
      hentMaanedsForbruk(),
      hentPromptversjonStats(),
      hentAvvisGrunner(),
    ]);

    const utenPris = new Set<string>();
    for (const m of maaneder) {
      for (const pm of m.perModell) {
        if (pm.kostUsd === null) utenPris.add(pm.modell);
      }
    }

    return {
      maaneder,
      promptversjoner,
      avvisGrunner,
      modellerUtenPris: [...utenPris].sort(),
    };
  } catch (err) {
    // Tabellen kan mangle i et miljø der DDL-scriptet ikke er kjørt. Da skal
    // agent-siden fortsatt laste — oversikten utelates i stedet.
    console.error("[agenticos] kunne ikke hente kostnadsoversikt", err);
    return null;
  }
}
