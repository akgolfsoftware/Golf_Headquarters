// Sprint 3 — AI-generert 21-dagers turneringsforberedelse.
// Bruker Vercel AI Gateway til å skreddersy økt-fokus per dag basert på
// turneringens bane-profil + spillerens SG-svakheter.
//
// Faller tilbake til regelbasert plan (samme som Sprint 2-stub) ved AI-feil
// eller manglende AI_GATEWAY_API_KEY.

import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TOURNAMENT_PREP_MODEL = "anthropic/claude-haiku-4.5" as const;

const PyramidArea = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);

const PlannedSessionSchema = z.object({
  daysBefore: z
    .number()
    .int()
    .min(1)
    .describe("Antall dager før turneringsstart denne økten skal kjøres."),
  title: z.string().min(3).max(80),
  pyramidArea: PyramidArea,
  durationMin: z.number().int().min(15).max(360),
  rationale: z
    .string()
    .min(5)
    .max(200)
    .describe("Kort begrunnelse for hvorfor økten er der i planen."),
});

const PrepPlanSchema = z.object({
  sessions: z.array(PlannedSessionSchema).min(3).max(20),
});

export type PlannedSession = z.infer<typeof PlannedSessionSchema>;

type PrepContext = {
  playerName: string;
  tournamentName: string;
  daysUntil: number;
  variant: "konservativ" | "standard" | "aggressiv";
  totalSessions: number;
  courseProfile?: string | null;
  sgWeaknesses: string[];
};

function fallbackPlan(daysUntil: number, totalSessions: number): PlannedSession[] {
  const areas: ("FYS" | "TEK" | "SLAG" | "SPILL" | "TURN")[] = [
    "FYS",
    "TEK",
    "SLAG",
    "SPILL",
    "TURN",
  ];
  return Array.from({ length: totalSessions }, (_, i) => {
    const offsetDays = Math.round((daysUntil / (totalSessions + 1)) * (i + 1));
    const daysBefore = Math.max(1, daysUntil - offsetDays);
    const area = areas[i % areas.length] ?? "TEK";
    return {
      daysBefore,
      title: `${area}-fokus`,
      pyramidArea: area,
      durationMin: 90,
      rationale: "Regelbasert fallback — ingen AI-generert begrunnelse.",
    } satisfies PlannedSession;
  });
}

async function loadContext(
  userId: string,
  tournamentId: string,
  variant: "konservativ" | "standard" | "aggressiv",
  totalSessions: number,
): Promise<PrepContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      name: true,
      startDate: true,
      notes: true,
      course: { select: { name: true, par: true, rating: true, slope: true } },
    },
  });
  if (!tournament || !user) return null;

  const daysUntil = Math.max(
    1,
    Math.ceil((tournament.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const courseBits: string[] = [];
  if (tournament.course?.name) courseBits.push(tournament.course.name);
  if (tournament.course?.par) courseBits.push(`par ${tournament.course.par}`);
  if (tournament.course?.rating) courseBits.push(`rating ${tournament.course.rating}`);
  if (tournament.course?.slope) courseBits.push(`slope ${tournament.course.slope}`);
  if (tournament.notes) courseBits.push(tournament.notes);
  const courseProfile = courseBits.length > 0 ? courseBits.join(" · ") : null;

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

  return {
    playerName: user.name,
    tournamentName: tournament.name,
    daysUntil,
    variant,
    totalSessions,
    courseProfile,
    sgWeaknesses,
  };
}

function buildPrompt(ctx: PrepContext): string {
  const lines: string[] = [];
  lines.push(`Spiller: ${ctx.playerName}`);
  lines.push(`Turnering: ${ctx.tournamentName}`);
  lines.push(`Dager til turneringsstart: ${ctx.daysUntil}`);
  lines.push(`Intensitets-variant: ${ctx.variant}`);
  lines.push(`Antall økter som skal planlegges: ${ctx.totalSessions}`);
  if (ctx.courseProfile) {
    lines.push(`Baneprofil: ${ctx.courseProfile}`);
  }
  if (ctx.sgWeaknesses.length > 0) {
    lines.push(`SG-svakheter: ${ctx.sgWeaknesses.join(", ")}`);
  } else {
    lines.push("SG-svakheter: ingen tydelige svakheter registrert.");
  }
  lines.push("");
  lines.push(
    "Bygg en personlig forberedelses-plan med nøyaktig N økter (N=antall over).",
  );
  lines.push(
    "Fordel økter over perioden frem til turnering. daysBefore=1 er dagen før spillestart.",
  );
  lines.push(
    "Bygg klassisk taper: bygg volum/intensitet tidlig, reduser de siste 5–7 dagene.",
  );
  lines.push(
    "Adresser SG-svakheter konkret i øktenes titler/innhold de første 70 % av perioden.",
  );
  lines.push(
    "Bruk pyramidområdene FYS, TEK, SLAG, SPILL, TURN. Hold rationale kort og handlingsorientert.",
  );
  return lines.join("\n");
}

/**
 * Generer en personlig N-dagers forberedelses-plan.
 *
 * Returnerer planlagte økter med daysBefore + rationale.
 * Faller tilbake til regelbasert fallback ved AI-feil.
 */
export async function generateTournamentPrep(args: {
  userId: string;
  tournamentId: string;
  variant: "konservativ" | "standard" | "aggressiv";
  totalSessions: number;
  daysUntil: number;
}): Promise<{ sessions: PlannedSession[]; usedAi: boolean }> {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return {
      sessions: fallbackPlan(args.daysUntil, args.totalSessions),
      usedAi: false,
    };
  }

  try {
    const ctx = await loadContext(
      args.userId,
      args.tournamentId,
      args.variant,
      args.totalSessions,
    );
    if (!ctx) {
      return {
        sessions: fallbackPlan(args.daysUntil, args.totalSessions),
        usedAi: false,
      };
    }

    const userPrompt = buildPrompt(ctx);

    const { object } = await generateObject({
      model: gateway.languageModel(TOURNAMENT_PREP_MODEL),
      schema: PrepPlanSchema,
      system:
        "Du er AK Golf sin AI-coach. Du lager personlige, fysiologisk fornuftige turneringsforberedelser. Du svarer alltid på norsk bokmål.",
      prompt: userPrompt,
      maxRetries: 1,
    });

    // Sikre at vi ikke får flere økter enn bedt om.
    const sessions = object.sessions.slice(0, args.totalSessions);
    if (sessions.length < 3) {
      return {
        sessions: fallbackPlan(args.daysUntil, args.totalSessions),
        usedAi: false,
      };
    }
    return { sessions, usedAi: true };
  } catch (err) {
    console.error("[ai] generateTournamentPrep failed, bruker fallback", err);
    return {
      sessions: fallbackPlan(args.daysUntil, args.totalSessions),
      usedAi: false,
    };
  }
}
