// AI-foreslå uke (3 varianter: konservativ/standard/aggressiv).
// Bruker @ai-sdk/anthropic direkte (ANTHROPIC_API_KEY) med generateObject for
// strukturert JSON-output. IKKE @ai-sdk/gateway — free tier har ikke modell-
// tilgang, så gateway ville alltid truffet stubben i prod (jf. gotchas.md).
//
// Faller tilbake til hardkodet stub hvis ANTHROPIC_API_KEY ikke er satt
// eller hvis AI-kallet feiler — så UI-en aldri henger på AI.

import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { anthropicProvider } from "@/lib/ai/client";
import { kategoriFraHcp } from "@/lib/ai-plan/context";
import { hentPlayerSignals } from "@/lib/plan-engine/load-signals";
import { buildWeekPrompt } from "./week-prompt";
import { logError } from "@/lib/error-tracking";

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
  daysUntilTournament: number | null;
  sgWeaknesses: unknown[];
  completedSessions: number;
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
      manualDate: true,
      tournament: { select: { startDate: true } },
    },
  });

  let daysUntilTournament: number | null = null;
  if (nextEntry) {
    const startDate = nextEntry.tournament?.startDate ?? nextEntry.manualDate;
    if (startDate) {
      const daysUntil = Math.max(
        0,
        Math.ceil((startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)),
      );
      daysUntilTournament = daysUntil;
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
    .filter((s) => typeof s.value === "number" && Number.isFinite(s.value) && s.value < 0)
    .map((s) => {
      const payload = z.object({ area: z.unknown() }).safeParse(s.payload);
      return payload.success ? payload.data.area : null;
    });

  // Registrerte fullførte V2-økter, ikke dager eller samlet treningsbelastning.
  const since = new Date(weekStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  const completedSessions = await prisma.trainingSessionV2.count({
    where: {
      studentId: userId,
      startTime: { gte: since, lt: weekStart },
      status: "COMPLETED",
    },
  });

  return {
    daysUntilTournament,
    sgWeaknesses,
    completedSessions,
  };
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
    const [ctx, signaler, user] = await Promise.all([
      loadPlayerContext(userId, weekStart),
      hentPlayerSignals(userId, weekStart),
      prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
    ]);

    const hcp = z.number().min(-10).max(54).safeParse(user?.hcp);
    const userPrompt = buildWeekPrompt(ctx, signaler, hcp.success ? kategoriFraHcp(hcp.data) : null);

    const { object } = await generateObject({
      model: anthropicProvider()(WEEK_SUGGEST_MODEL),
      schema: SuggestionsSchema,
      system:
        "Du er AK Golf sin AI-coach. Du lager pragmatiske, gjennomførbare treningsuker for golfspillere. Du svarer alltid på norsk bokmål og bruker korte, konkrete økt-titler.",
      prompt: userPrompt,
      maxRetries: 1,
    });

    return { suggestions: object.suggestions, usedAi: true };
  } catch {
    // Provider errors may contain the request/response. Never persist them or player IDs.
    try {
      await logError({
        context: "ai-plan.generateWeekSuggestions",
        error: new Error("WEEK_SUGGEST_UNAVAILABLE"),
      });
    } catch {
      // Logging failure must not bypass the explicit non-AI fallback result.
    }
    return { suggestions: fallbackSuggestions(), usedAi: false };
  }
}
