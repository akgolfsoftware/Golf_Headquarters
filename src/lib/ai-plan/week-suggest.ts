// Sprint 3 — AI-foreslå uke (3 varianter: konservativ/standard/aggressiv).
// Bruker Vercel AI Gateway med generateObject for strukturert JSON-output.
//
// Faller tilbake til hardkodet stub hvis AI_GATEWAY_API_KEY ikke er satt
// eller hvis AI-kallet feiler — så UI-en aldri henger på AI.

import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Modell-id via AI Gateway. Haiku er billig + raskt for korte plan-forslag.
const WEEK_SUGGEST_MODEL = "anthropic/claude-haiku-4.5" as const;

const PyramidArea = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);

const SessionSchema = z.object({
  day: z.number().int().min(0).max(6).describe("0=mandag, 6=søndag"),
  title: z.string().min(3).max(80),
  pyramidArea: PyramidArea,
  durationMin: z.number().int().min(15).max(360),
});

const VariantSchema = z.object({
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
        { day: 3, title: "Tek — kort spill", pyramidArea: "TEK", durationMin: 60 },
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
        { day: 6, title: "Tek — kort spill", pyramidArea: "TEK", durationMin: 60 },
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

function buildPrompt(ctx: PlayerContext, weekStart: Date): string {
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
  return lines.join("\n");
}

/**
 * Generer 3 uke-varianter for spilleren via Vercel AI Gateway.
 *
 * Eksempel-prompt sendes som user-message; system-prompten beskriver rolle.
 * Output valideres mot zod-schema. Faller tilbake til stub ved feil.
 */
export async function generateWeekSuggestions(
  userId: string,
  weekStart: Date,
): Promise<{ suggestions: WeekSuggestion[]; usedAi: boolean }> {
  // Sjekk om AI Gateway er konfigurert.
  if (!process.env.AI_GATEWAY_API_KEY) {
    return { suggestions: fallbackSuggestions(), usedAi: false };
  }

  try {
    const ctx = await loadPlayerContext(userId, weekStart);
    const userPrompt = buildPrompt(ctx, weekStart);

    const { object } = await generateObject({
      model: gateway.languageModel(WEEK_SUGGEST_MODEL),
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
