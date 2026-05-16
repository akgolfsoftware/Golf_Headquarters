// Read-tools for Caddie MCP — auto-approved.
// Spør Prisma og returnerer strukturerte data.
// Feil håndteres med try/catch og returneres som ToolErrorResponse.

import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toolError } from "../types";

// Periode-helper: regner ut "siden"-dato fra periode-string.
function periodToSince(period: "30d" | "90d" | "season"): Date {
  const now = new Date();
  if (period === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  if (period === "90d") {
    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }
  // season: 1. januar inneværende år
  return new Date(now.getFullYear(), 0, 1);
}

export const READ_TOOLS = {
  searchPlayers: tool({
    description:
      "Søk etter spillere via navn eller e-post (delvis match). Returnerer id, navn, e-post, HCP og tier.",
    inputSchema: z.object({
      query: z.string().describe("Navn eller e-post (delvis match, case-insensitive)"),
      limit: z.number().int().min(1).max(50).default(10),
    }),
    execute: async ({ query, limit }) => {
      try {
        const players = await prisma.user.findMany({
          where: {
            role: "PLAYER",
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            hcp: true,
            tier: true,
          },
          take: limit,
          orderBy: { name: "asc" },
        });
        return { ok: true as const, data: { count: players.length, players } };
      } catch (err) {
        return toolError(
          `searchPlayers feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke søke etter spillere. Sjekk databasetilkoblingen.",
        );
      }
    },
  }),

  getPlayer: tool({
    description:
      "Hent full profil for én spiller: HCP, tier, plan-status, abonnement og siste login.",
    inputSchema: z.object({
      id: z.string().describe("Spiller-ID (cuid)"),
    }),
    execute: async ({ id }) => {
      try {
        const player = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            tier: true,
            hcp: true,
            playingYears: true,
            ambition: true,
            homeClub: true,
            lastLoginAt: true,
            createdAt: true,
            subscription: {
              select: {
                tier: true,
                status: true,
                currentPeriodEnd: true,
                monthlyCredits: true,
                creditsRemaining: true,
              },
            },
            trainingPlans: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
              },
              take: 5,
              orderBy: { updatedAt: "desc" },
            },
          },
        });
        if (!player) {
          return toolError(
            `Spiller med id=${id} finnes ikke`,
            "Fant ingen spiller med denne IDen.",
          );
        }
        return { ok: true as const, data: player };
      } catch (err) {
        return toolError(
          `getPlayer feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente spiller-profil.",
        );
      }
    },
  }),

  getPlayerSessions: tool({
    description:
      "Hent treningsøkter for en spiller innen et dato-område, med dato, type (pyramidArea) og status.",
    inputSchema: z.object({
      playerId: z.string(),
      from: z.string().describe("ISO-dato (YYYY-MM-DD)").optional(),
      to: z.string().describe("ISO-dato (YYYY-MM-DD)").optional(),
      limit: z.number().int().min(1).max(200).default(50),
    }),
    execute: async ({ playerId, from, to, limit }) => {
      try {
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        const sessions = await prisma.trainingPlanSession.findMany({
          where: {
            plan: { userId: playerId },
            scheduledAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          },
          select: {
            id: true,
            scheduledAt: true,
            durationMin: true,
            title: true,
            pyramidArea: true,
            skillArea: true,
            environment: true,
            status: true,
            plan: { select: { id: true, name: true } },
          },
          orderBy: { scheduledAt: "desc" },
          take: limit,
        });
        return { ok: true as const, data: { count: sessions.length, sessions } };
      } catch (err) {
        return toolError(
          `getPlayerSessions feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente økter for spilleren.",
        );
      }
    },
  }),

  getPlayerStats: tool({
    description:
      "Aggregerte stats for en spiller innen en periode: snitt-SG, runder, tester, økter.",
    inputSchema: z.object({
      playerId: z.string(),
      period: z.enum(["30d", "90d", "season"]).default("30d"),
    }),
    execute: async ({ playerId, period }) => {
      try {
        const since = periodToSince(period);
        const [rounds, testCount, sessionCount, sgAgg] = await Promise.all([
          prisma.round.findMany({
            where: { userId: playerId, playedAt: { gte: since } },
            select: {
              id: true,
              playedAt: true,
              score: true,
              sgTotal: true,
              sgOtt: true,
              sgApp: true,
              sgArg: true,
              sgPutt: true,
            },
            orderBy: { playedAt: "desc" },
          }),
          prisma.testResult.count({
            where: { userId: playerId, takenAt: { gte: since } },
          }),
          prisma.trainingPlanSession.count({
            where: {
              plan: { userId: playerId },
              scheduledAt: { gte: since },
              status: "COMPLETED",
            },
          }),
          prisma.round.aggregate({
            where: { userId: playerId, playedAt: { gte: since } },
            _avg: {
              sgTotal: true,
              sgOtt: true,
              sgApp: true,
              sgArg: true,
              sgPutt: true,
              score: true,
            },
          }),
        ]);
        return {
          ok: true as const,
          data: {
            period,
            since: since.toISOString(),
            roundCount: rounds.length,
            testCount,
            completedSessionCount: sessionCount,
            averages: sgAgg._avg,
            recentRounds: rounds.slice(0, 10),
          },
        };
      } catch (err) {
        return toolError(
          `getPlayerStats feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke aggregere stats for spilleren.",
        );
      }
    },
  }),

  getUpcomingBookings: tool({
    description:
      "Bookinger fra nå og N dager frem, med spiller, tjeneste og lokasjon. Kun CONFIRMED/PENDING.",
    inputSchema: z.object({
      daysAhead: z.number().int().min(1).max(60).default(7),
      limit: z.number().int().min(1).max(200).default(50),
    }),
    execute: async ({ daysAhead, limit }) => {
      try {
        const now = new Date();
        const until = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        const bookings = await prisma.booking.findMany({
          where: {
            startAt: { gte: now, lte: until },
            status: { in: ["CONFIRMED", "PENDING"] },
          },
          select: {
            id: true,
            startAt: true,
            endAt: true,
            status: true,
            notes: true,
            priceOre: true,
            user: { select: { id: true, name: true, email: true } },
            serviceType: { select: { id: true, name: true, slug: true } },
            location: { select: { id: true, name: true } },
            facility: { select: { id: true, name: true } },
          },
          orderBy: { startAt: "asc" },
          take: limit,
        });
        return { ok: true as const, data: { count: bookings.length, bookings } };
      } catch (err) {
        return toolError(
          `getUpcomingBookings feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente kommende bookinger.",
        );
      }
    },
  }),

  getOutstandingInvoices: tool({
    description:
      "Utestående faktura (PaymentType=INVOICE, status=PENDING eller FAILED) med spiller og beløp i NOK.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(200).default(50),
    }),
    execute: async ({ limit }) => {
      try {
        const payments = await prisma.payment.findMany({
          where: {
            type: "INVOICE",
            status: { in: ["PENDING", "FAILED"] },
          },
          select: {
            id: true,
            amountOre: true,
            currency: true,
            status: true,
            description: true,
            createdAt: true,
            stripeInvoiceId: true,
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        const totalOre = payments.reduce((sum, p) => sum + p.amountOre, 0);
        return {
          ok: true as const,
          data: {
            count: payments.length,
            totalOre,
            totalNok: totalOre / 100,
            invoices: payments.map((p) => ({
              ...p,
              amountNok: p.amountOre / 100,
            })),
          },
        };
      } catch (err) {
        return toolError(
          `getOutstandingInvoices feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente utestående faktura.",
        );
      }
    },
  }),

  getRound: tool({
    description:
      "Hent én runde med course-info, score og SG-detaljer (totalt + per område).",
    inputSchema: z.object({
      roundId: z.string(),
    }),
    execute: async ({ roundId }) => {
      try {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
          select: {
            id: true,
            playedAt: true,
            score: true,
            notes: true,
            sgTotal: true,
            sgOtt: true,
            sgApp: true,
            sgArg: true,
            sgPutt: true,
            sgTee: true,
            sgApp200: true,
            sgApp150: true,
            sgApp100: true,
            sgApp50: true,
            sgChip: true,
            sgPitch: true,
            sgLob: true,
            sgBunker: true,
            sgPutt0_3: true,
            sgPutt3_5: true,
            sgPutt5_10: true,
            sgPutt10_15: true,
            sgPutt15_25: true,
            sgPutt25_40: true,
            sgPutt40plus: true,
            user: { select: { id: true, name: true } },
            course: { select: { id: true, name: true, par: true, rating: true, slope: true } },
          },
        });
        if (!round) {
          return toolError(
            `Runde med id=${roundId} finnes ikke`,
            "Fant ingen runde med denne IDen.",
          );
        }
        return { ok: true as const, data: round };
      } catch (err) {
        return toolError(
          `getRound feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente runden.",
        );
      }
    },
  }),

  getTournaments: tool({
    description:
      "Hent turneringer. Filtrer på upcoming/past/all. Returnerer navn, dato, format og bane.",
    inputSchema: z.object({
      filter: z.enum(["upcoming", "past", "all"]).default("upcoming"),
      limit: z.number().int().min(1).max(100).default(20),
    }),
    execute: async ({ filter, limit }) => {
      try {
        const now = new Date();
        const where =
          filter === "upcoming"
            ? { startDate: { gte: now } }
            : filter === "past"
              ? { startDate: { lt: now } }
              : {};
        const tournaments = await prisma.tournament.findMany({
          where,
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            format: true,
            notes: true,
            course: { select: { id: true, name: true, par: true } },
          },
          orderBy: { startDate: filter === "past" ? "desc" : "asc" },
          take: limit,
        });
        return { ok: true as const, data: { count: tournaments.length, tournaments } };
      } catch (err) {
        return toolError(
          `getTournaments feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente turneringer.",
        );
      }
    },
  }),

  getActiveSubscriptions: tool({
    description:
      "Hent aktive Stripe-abonnementer (status=ACTIVE eller TRIALING) med tier, credits og periode-slutt.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(200).default(100),
    }),
    execute: async ({ limit }) => {
      try {
        const subs = await prisma.subscription.findMany({
          where: { status: { in: ["ACTIVE", "TRIALING"] } },
          select: {
            id: true,
            tier: true,
            status: true,
            currentPeriodEnd: true,
            monthlyCredits: true,
            creditsRemaining: true,
            stripeSubscriptionId: true,
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { currentPeriodEnd: "asc" },
          take: limit,
        });
        return { ok: true as const, data: { count: subs.length, subscriptions: subs } };
      } catch (err) {
        return toolError(
          `getActiveSubscriptions feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente abonnementer.",
        );
      }
    },
  }),

  getPlayerLatestSession: tool({
    description:
      "Hent siste treningsøkt for en spiller. Filtrer valgfritt på pyramide-område (FYS|TEK|SLAG|SPILL|TURN).",
    inputSchema: z.object({
      playerId: z.string(),
      pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]).optional(),
    }),
    execute: async ({ playerId, pyramidArea }) => {
      try {
        const session = await prisma.trainingPlanSession.findFirst({
          where: {
            plan: { userId: playerId },
            ...(pyramidArea ? { pyramidArea } : {}),
          },
          select: {
            id: true,
            scheduledAt: true,
            durationMin: true,
            title: true,
            rationale: true,
            pyramidArea: true,
            skillArea: true,
            environment: true,
            status: true,
            plan: { select: { id: true, name: true } },
            log: {
              select: {
                startedAt: true,
                completedAt: true,
                csAchieved: true,
                rating: true,
                notes: true,
                coachFeedback: true,
              },
            },
          },
          orderBy: { scheduledAt: "desc" },
        });
        if (!session) {
          return toolError(
            `Ingen økter funnet for playerId=${playerId}${pyramidArea ? ` (område=${pyramidArea})` : ""}`,
            "Fant ingen økter for denne spilleren.",
          );
        }
        return { ok: true as const, data: session };
      } catch (err) {
        return toolError(
          `getPlayerLatestSession feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke hente siste økt.",
        );
      }
    },
  }),
} as const;
