// AI-foreslå uke (3 varianter: konservativ/standard/aggressiv).
// Bruker @ai-sdk/anthropic direkte (ANTHROPIC_API_KEY) med generateObject for
// strukturert JSON-output. IKKE @ai-sdk/gateway — free tier har ikke modell-
// tilgang, så gateway ville alltid truffet stubben i prod (jf. gotchas.md).
//
// Faller tilbake til hardkodet stub hvis ANTHROPIC_API_KEY ikke er satt
// eller hvis AI-kallet feiler — så UI-en aldri henger på AI.

import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { kategoriFraHcp } from "@/lib/ai-plan/context";
import { hentPlayerSignals } from "@/lib/plan-engine/load-signals";
import {
  STANDARD_PYRAMIDE,
  STANDARD_OKT_ANTALL,
} from "@/lib/plan-engine/standard-fordeling";
import { SG_FOKUS_LABEL } from "@/lib/workbench/fokus";

// Haiku er billig + raskt for korte plan-forslag (gyldig id mot api.anthropic.com).
const WEEK_SUGGEST_MODEL = "claude-haiku-4-5-20251001" as const;

const PyramidArea = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);

const SessionSchema = z.object({
  day: z.number().int().min(0).max(6).describe("0=mandag, 6=søndag"),
  title: z.string().min(3).max(80),
  pyramidArea: PyramidArea,
  durationMin: z.number().int().min(15).max(360),
});

export const VariantSchema = z.object({
  variant: z.enum(["konservativ", "standard", "aggressiv"]),
  totalSessions: z.number().int().min(3).max(10),
  focusBlend: z.string().min(5).max(120),
  sessions: z.array(SessionSchema).min(3).max(10),
});

const SuggestionsSchema = z.object({
  suggestions: z.array(VariantSchema).length(3),
});

export type WeekSuggestion = z.infer<typeof VariantSchema>;

type PlayerContext = {
  name: string;
  currentPeriod?: string;
  nextTournament?: { name: string; daysUntil: number } | null;
  sgWeaknesses?: string[];
  recentLoadDays?: number;
};

function fallbackSuggestions(): WeekSuggestion[] {
  return [
    {
      variant: "konservativ",
      totalSessions: 5,
      focusBlend: "TEK 40 % · SLAG 30 % · SPILL 30 %",
      sessions: [
        { day: 0, title: "Tek — grunnbevegelse", pyramidArea: "TEK", durationMin: 60 },
        { day: 1, title: "Slag — banespill", pyramidArea: "SLAG", durationMin: 75 },
        { day: 3, title: "Tek — nærspill", pyramidArea: "TEK", durationMin: 60 },
        { day: 4, title: "Spill — runde 9 hull", pyramidArea: "SPILL", durationMin: 120 },
        { day: 6, title: "FYS — restitusjon", pyramidArea: "FYS", durationMin: 45 },
      ],
    },
    {
      variant: "standard",
      totalSessions: 6,
      focusBlend: "TEK 30 % · SLAG 30 % · SPILL 25 % · FYS 15 %",
      sessions: [
        { day: 0, title: "FYS — styrke", pyramidArea: "FYS", durationMin: 60 },
        { day: 1, title: "Tek — putting", pyramidArea: "TEK", durationMin: 60 },
        { day: 2, title: "Slag — jern", pyramidArea: "SLAG", durationMin: 75 },
        { day: 3, title: "Tek — chip", pyramidArea: "TEK", durationMin: 60 },
        { day: 4, title: "Spill — runde 18 hull", pyramidArea: "SPILL", durationMin: 240 },
        { day: 5, title: "Slag — wedge under press", pyramidArea: "SLAG", durationMin: 60 },
      ],
    },
    {
      variant: "aggressiv",
      totalSessions: 7,
      focusBlend: "SLAG 35 % · SPILL 25 % · TEK 20 % · TURN 10 % · FYS 10 %",
      sessions: [
        { day: 0, title: "FYS — styrke", pyramidArea: "FYS", durationMin: 60 },
        { day: 1, title: "Slag — driving", pyramidArea: "SLAG", durationMin: 90 },
        { day: 2, title: "Tek — putting", pyramidArea: "TEK", durationMin: 60 },
        { day: 3, title: "Slag — jern under press", pyramidArea: "SLAG", durationMin: 90 },
        { day: 4, title: "Spill — runde 18 hull", pyramidArea: "SPILL", durationMin: 240 },
        { day: 5, title: "Turn — simulering", pyramidArea: "TURN", durationMin: 90 },
        { day: 6, title: "Tek — nærspill", pyramidArea: "TEK", durationMin: 60 },
      ],
    },
  ];
}

async function loadPlayerContext(userId: string, weekStart: Date): Promise<PlayerContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  // Neste turnering etter weekStart.
  const nextEntry = await prisma.tournamentEntry.findFirst({
    where: {
      userId,
      OR: [
        { tournament: { startDate: { gte: weekStart } } },
        { manualDate: { gte: weekStart } },
      ],
      entryStatus: { in: ["PLANNED", "CONFIRMED"] },
    },
    orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
    select: {
      manualName: true,
      manualDate: true,
      tournament: { select: { name: true, startDate: true } },
    },
  });

  let nextTournament: PlayerContext["nextTournament"] = null;
  if (nextEntry) {
    const name = nextEntry.tournament?.name ?? nextEntry.manualName ?? "Turnering";
    const startDate = nextEntry.tournament?.startDate ?? nextEntry.manualDate;
    if (startDate) {
      const daysUntil = Math.max(
        0,
        Math.ceil((startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)),
      );
      nextTournament = { name, daysUntil };
    }
  }

  // SG-svakheter — hent siste SG-signaler.
  const sgSignals = await prisma.signal.findMany({
    where: { userId, kind: "SG_AREA" },
    orderBy: { computedAt: "desc" },
    take: 5,
    select: { payload: true, value: true },
  });
  const sgWeaknesses = sgSignals
    .filter((s) => typeof s.value === "number" && s.value < 0)
    .map((s) => {
      const payload = s.payload as { area?: string } | null;
      return payload?.area ?? "ukjent område";
    });

  // Treningsbelastning siste 14 dager — antall økter.
  const since = new Date(weekStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  const recentLoadDays = await prisma.trainingSessionV2.count({
    where: {
      studentId: userId,
      startTime: { gte: since, lt: weekStart },
      status: { in: ["COMPLETED", "IN_PROGRESS"] },
    },
  });

  return {
    name: user?.name ?? "Spiller",
    nextTournament,
    sgWeaknesses,
    recentLoadDays,
  };
}

/**
 * Standardplan-anker: spillerens kategori (HCP-basert — låst valg inntil
 * drill-retag er avgjort) gir pyramidefordeling + øktantall fra
 * standard-fordeling.ts, så variantene ankres i AK-metodikken i stedet for
 * å flyte fritt.
 */
async function standardAnker(userId: string, aktivFase: string | null): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } });
  const kategori = kategoriFraHcp(user?.hcp ?? null);
  if (!kategori) return [];
  const pyr = STANDARD_PYRAMIDE[kategori];
  const fase = (aktivFase ?? "GRUNN") as keyof (typeof STANDARD_OKT_ANTALL)[typeof kategori];
  const okter = STANDARD_OKT_ANTALL[kategori][fase] ?? STANDARD_OKT_ANTALL[kategori].GRUNN;
  return [
    `Standardplan-anker for spillerens nivå (kategori ${kategori}): ` +
      `FYS ${pyr.FYS} % · TEK ${pyr.TEK} % · SLAG ${pyr.SLAG} % · SPILL ${pyr.SPILL} % · TURN ${pyr.TURN} %, ` +
      `normalt ${okter} økter/uke. «standard»-varianten skal ligge nær dette; ` +
      `«konservativ» litt under, «aggressiv» litt over.`,
  ];
}

function buildPrompt(ctx: PlayerContext, weekStart: Date, ekstra: string[]): string {
  const lines: string[] = [];
  lines.push(`Spiller: ${ctx.name}`);
  lines.push(`Uke som starter: ${weekStart.toISOString().slice(0, 10)} (mandag)`);
  if (ctx.nextTournament) {
    lines.push(
      `Neste turnering: ${ctx.nextTournament.name} om ${ctx.nextTournament.daysUntil} dager`,
    );
  } else {
    lines.push("Neste turnering: ingen planlagt nær fremtid");
  }
  if (ctx.sgWeaknesses && ctx.sgWeaknesses.length > 0) {
    lines.push(`SG-svakheter (negativ trend): ${ctx.sgWeaknesses.join(", ")}`);
  } else {
    lines.push("SG-svakheter: ingen tydelige svakheter registrert");
  }
  lines.push(`Treningsbelastning siste 14 dager: ${ctx.recentLoadDays ?? 0} fullførte økter`);
  lines.push(...ekstra);
  lines.push("");
  lines.push(
    "Lag tre varianter (konservativ, standard, aggressiv) for kommende uke.",
  );
  lines.push(
    "Hver variant skal ha 5–7 økter fordelt over uken (0=mandag, 6=søndag).",
  );
  lines.push(
    "Bruk pyramidområdene: FYS (fysisk), TEK (teknikk), SLAG (slagtrening), SPILL (banespill), TURN (turneringssimulering).",
  );
  lines.push(
    "Prioriter SG-svakheter (TEK/SLAG/SPILL) når relevant, og bygg taper hvis turneringen er nær (< 7 dager).",
  );
  lines.push(
    "focusBlend er en kort tekst med prosent-fordeling (eksempel: 'TEK 40 % · SLAG 30 % · SPILL 30 %').",
  );
  lines.push(
    "Titler i norsk klarspråk uten fagkoder. Skriv «nærspill», aldri «kort spill». Minst én putting-økt per uke.",
  );
  return lines.join("\n");
}

/** Anthropic-provider med /v1-normalisert baseURL (env-en mangler /v1 — gotcha). */
function anthropicProvider() {
  const base = process.env.ANTHROPIC_BASE_URL;
  return createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    ...(base ? { baseURL: base.endsWith("/v1") ? base : `${base.replace(/\/$/, "")}/v1` } : {}),
  });
}

/**
 * Generer 3 uke-varianter for spilleren via Anthropic direkte.
 *
 * Prompten ankres i spillerens standardplan (nivå × fase) + signalene fra
 * plan-engine (fokus, etterlevelse, periode). Output valideres mot zod-schema.
 * Faller tilbake til stub ved feil eller manglende nøkkel.
 */
export async function generateWeekSuggestions(
  userId: string,
  weekStart: Date,
): Promise<{ suggestions: WeekSuggestion[]; usedAi: boolean }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { suggestions: fallbackSuggestions(), usedAi: false };
  }

  try {
    const [ctx, signaler] = await Promise.all([
      loadPlayerContext(userId, weekStart),
      hentPlayerSignals(userId, weekStart),
    ]);

    const ekstra: string[] = [];
    if (signaler.fokus) {
      const kilde = signaler.fokus.kilde === "coach" ? "coachens periodefokus" : "svakeste SG-område";
      const label = signaler.fokus.kategori
        ? SG_FOKUS_LABEL[signaler.fokus.kategori]
        : signaler.fokus.label;
      ekstra.push(`Fokusområde (${kilde}): ${label} — vekt dette i alle varianter.`);
    }
    if (signaler.aktivFase) {
      ekstra.push(`Aktiv treningsperiode: ${signaler.aktivFase}.`);
    }
    if (signaler.adherencePct != null && signaler.adherencePct < 75) {
      ekstra.push(
        `Plan-etterlevelse siste 4 uker: ${signaler.adherencePct} % — gjør variantene overkommelige (heller færre økter som blir gjennomført).`,
      );
    }
    ekstra.push(...(await standardAnker(userId, signaler.aktivFase)));

    const userPrompt = buildPrompt(ctx, weekStart, ekstra);

    const { object } = await generateObject({
      model: anthropicProvider()(WEEK_SUGGEST_MODEL),
      schema: SuggestionsSchema,
      system:
        "Du er AK Golf sin AI-coach. Du lager pragmatiske, gjennomførbare treningsuker for golfspillere. Du svarer alltid på norsk bokmål og bruker korte, konkrete økt-titler.",
      prompt: userPrompt,
      maxRetries: 1,
    });

    return { suggestions: object.suggestions, usedAi: true };
  } catch (err) {
    console.error("[ai] generateWeekSuggestions failed, bruker stub", err);
    return { suggestions: fallbackSuggestions(), usedAi: false };
  }
}
