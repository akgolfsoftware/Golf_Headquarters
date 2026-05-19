"use server";

// Sprint 2 — Tournament-actions (turnering-client.tsx)
//
// 11. prepareForTournament — "Forbered meg"
// 12. logTournamentResult  — "Logg resultat"
// 13. withdrawFromTournament — "Avregistrer"
// 14. requestTournamentFocus — "Be om turnerings-fokus-plan"

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { generateTournamentPrep } from "@/lib/ai-plan/tournament-prep";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

const PyramidAreaEnum = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);

/* ─── 11. prepareForTournament ─────────────────────────────────────── */

const PrepareInput = z.object({
  tournamentId: z.string().min(1),
  variant: z.enum(["konservativ", "standard", "aggressiv"]),
});
export type PrepareForTournamentInput = z.infer<typeof PrepareInput>;

export async function prepareForTournament(
  input: PrepareForTournamentInput,
): Promise<ActionResult<{ preparationId: string; sessionsPlanned: number }>> {
  const user = await requirePortalUser();
  const parsed = PrepareInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: parsed.data.tournamentId },
      select: { id: true, startDate: true, endDate: true, name: true },
    });
    if (!tournament) return { error: "Turnering ikke funnet" };

    const daysUntil = Math.max(
      1,
      Math.ceil(
        (tournament.startDate.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    // Antall planlagte økter per variant.
    const sessionsPerVariant: Record<
      "konservativ" | "standard" | "aggressiv",
      number
    > = {
      konservativ: Math.min(Math.max(Math.floor(daysUntil / 3), 3), 8),
      standard: Math.min(Math.max(Math.floor(daysUntil / 2), 4), 12),
      aggressiv: Math.min(Math.max(daysUntil - 2, 5), 18),
    };
    const total = sessionsPerVariant[parsed.data.variant];

    // Be AI om personlig plan (eller fallback hvis AI Gateway ikke er konfigurert).
    const { sessions: plannedSessions } = await generateTournamentPrep({
      userId: user.id,
      tournamentId: parsed.data.tournamentId,
      variant: parsed.data.variant,
      totalSessions: total,
      daysUntil,
    });

    // Map daysBefore → konkret startTime/endTime.
    const start = tournament.startDate;
    const concreteSessions = plannedSessions.map((s) => {
      const d = new Date(start);
      d.setDate(d.getDate() - s.daysBefore);
      d.setHours(15, 0, 0, 0);
      const end = new Date(d.getTime() + s.durationMin * 60_000);
      return { ...s, startTime: d, endTime: end };
    });

    const result = await prisma.$transaction(async (tx) => {
      const prep = await tx.tournamentPreparation.upsert({
        where: {
          userId_tournamentId: {
            userId: user.id,
            tournamentId: parsed.data.tournamentId,
          },
        },
        create: {
          userId: user.id,
          tournamentId: parsed.data.tournamentId,
          variant: parsed.data.variant,
          totalDays: daysUntil,
          sessionsPlanned: total,
        },
        update: {
          variant: parsed.data.variant,
          totalDays: daysUntil,
          sessionsPlanned: total,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      for (const s of concreteSessions) {
        await tx.trainingSessionV2.create({
          data: {
            title: `Forbered: ${tournament.name} — ${s.title}`,
            studentId: user.id,
            coachId: user.id, // TODO: bruk primary coach når relasjon finnes
            startTime: s.startTime,
            endTime: s.endTime,
            miljo: "M3",
            practiceType: "BLOKK",
            status: "PLANNED",
            notes: s.rationale,
            isCoachCreated: false,
            generertFra: "TournamentPreparation",
            generertFraId: prep.id,
            drillInstances: {
              create: [
                {
                  drillName: s.title,
                  orderIndex: 0,
                  pyramideArea: s.pyramidArea,
                },
              ],
            },
          },
        });
      }

      return prep;
    });

    revalidatePath(`/portal/tren/turneringer/${parsed.data.tournamentId}`);
    revalidatePath("/portal/tren/turneringer");
    revalidatePath("/portal/tren");
    revalidatePath("/portal/kalender");
    return {
      success: true,
      data: { preparationId: result.id, sessionsPlanned: total },
    };
  } catch (err) {
    console.error("prepareForTournament failed", err);
    return { error: "Kunne ikke lage forberedelses-plan" };
  }
}

/* ─── 12. logTournamentResult ──────────────────────────────────────── */

const LogResultInput = z.object({
  tournamentId: z.string().min(1),
  rounds: z
    .array(
      z.object({
        roundNumber: z.number().int().positive(),
        score: z.number().int(),
        weather: z.string().max(40).optional(),
        notes: z.string().max(500).optional(),
      }),
    )
    .min(1, "Minst én runde kreves"),
  finalPlacement: z.number().int().positive().optional(),
  sgTotal: z.number().optional(),
});
export type LogTournamentResultInput = z.infer<typeof LogResultInput>;

export async function logTournamentResult(
  input: LogTournamentResultInput,
): Promise<ActionResult<{ resultId: string }>> {
  const user = await requirePortalUser();
  const parsed = LogResultInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const totalScore = parsed.data.rounds.reduce(
      (sum, r) => sum + r.score,
      0,
    );

    const result = await prisma.tournamentResult.upsert({
      where: {
        tournamentId_userId: {
          tournamentId: parsed.data.tournamentId,
          userId: user.id,
        },
      },
      create: {
        tournamentId: parsed.data.tournamentId,
        userId: user.id,
        position: parsed.data.finalPlacement ?? null,
        score: totalScore,
        notes: parsed.data.rounds
          .map(
            (r) =>
              `R${r.roundNumber}: ${r.score}${r.weather ? ` (${r.weather})` : ""}${r.notes ? ` — ${r.notes}` : ""}`,
          )
          .join("\n"),
      },
      update: {
        position: parsed.data.finalPlacement ?? null,
        score: totalScore,
        notes: parsed.data.rounds
          .map(
            (r) =>
              `R${r.roundNumber}: ${r.score}${r.weather ? ` (${r.weather})` : ""}${r.notes ? ` — ${r.notes}` : ""}`,
          )
          .join("\n"),
      },
      select: { id: true },
    });

    revalidatePath(`/portal/tren/turneringer/${parsed.data.tournamentId}`);
    revalidatePath("/portal/tren/turneringer");
    revalidatePath("/portal");
    return { success: true, data: { resultId: result.id } };
  } catch (err) {
    console.error("logTournamentResult failed", err);
    return { error: "Kunne ikke logge resultat" };
  }
}

/* ─── 13. withdrawFromTournament ───────────────────────────────────── */

const WithdrawInput = z.object({
  tournamentId: z.string().min(1),
  reason: z.string().min(1).max(500),
  otherText: z.string().max(500).optional(),
});
export type WithdrawInput = z.infer<typeof WithdrawInput>;

export async function withdrawFromTournament(
  input: WithdrawInput,
): Promise<ActionResult<{ entryId: string }>> {
  const user = await requirePortalUser();
  const parsed = WithdrawInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const entry = await prisma.tournamentEntry.findFirst({
      where: { userId: user.id, tournamentId: parsed.data.tournamentId },
      select: { id: true, notes: true },
    });
    if (!entry) return { error: "Påmelding ikke funnet" };

    const reasonText =
      parsed.data.reason === "annet" && parsed.data.otherText
        ? parsed.data.otherText
        : parsed.data.reason;

    await prisma.tournamentEntry.update({
      where: { id: entry.id },
      data: {
        entryStatus: "WITHDRAWN",
        withdrawnAt: new Date(),
        withdrawnReason: reasonText,
      },
    });

    revalidatePath(`/portal/tren/turneringer/${parsed.data.tournamentId}`);
    revalidatePath("/portal/tren/turneringer");
    revalidatePath("/portal/kalender");
    revalidatePath("/portal");
    return { success: true, data: { entryId: entry.id } };
  } catch (err) {
    console.error("withdrawFromTournament failed", err);
    return { error: "Kunne ikke avregistrere fra turnering" };
  }
}

/* ─── 14. requestTournamentFocus ───────────────────────────────────── */

const TournamentFocusInput = z.object({
  tournamentId: z.string().min(1),
  helpType: z.enum(["scratch", "adjust", "focus"]),
  focusAreas: z.array(PyramidAreaEnum).optional(),
  description: z.string().min(5).max(2000),
  urgency: z.enum(["low", "normal", "high"]),
});
export type RequestTournamentFocusInput = z.infer<typeof TournamentFocusInput>;

export async function requestTournamentFocus(
  input: RequestTournamentFocusInput,
): Promise<ActionResult<{ adjustmentId: string }>> {
  const user = await requirePortalUser();
  const parsed = TournamentFocusInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: parsed.data.tournamentId },
      select: { id: true, startDate: true, name: true },
    });
    if (!tournament) return { error: "Turnering ikke funnet" };

    // Mandag i uka turneringen starter — brukes som weekStart.
    const weekStart = new Date(tournament.startDate);
    const day = (weekStart.getDay() + 6) % 7; // 0 = mandag
    weekStart.setDate(weekStart.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);

    const adjustment = await prisma.planAdjustment.create({
      data: {
        userId: user.id,
        weekStart,
        description: `[TURNERING ${tournament.name}] [${parsed.data.helpType.toUpperCase()}] [${parsed.data.urgency}]\n${parsed.data.description}`,
        focusAreas: parsed.data.focusAreas ?? [],
      },
      select: { id: true },
    });

    // Notifiser coach.
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "tournament-focus",
          title: `${user.name} ber om turnerings-fokus: ${tournament.name}`,
          body: parsed.data.description.slice(0, 200),
          link: `/admin/spillere/${user.id}`,
        },
      });
    } catch (e) {
      console.warn("tournament-focus notification failed", e);
    }

    revalidatePath(`/portal/tren/turneringer/${parsed.data.tournamentId}`);
    revalidatePath("/portal/tren");
    return { success: true, data: { adjustmentId: adjustment.id } };
  } catch (err) {
    console.error("requestTournamentFocus failed", err);
    return { error: "Kunne ikke sende forespørsel" };
  }
}
