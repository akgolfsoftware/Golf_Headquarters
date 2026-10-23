// Read-tools for Caddie MCP — auto-approved.
// Spør Prisma og returnerer strukturerte data.
// Feil håndteres med try/catch og returneres som ToolErrorResponse.

import type { Prisma } from "@/generated/prisma/client";
import { medAkProfiler } from "@/lib/deling/ak-profil-lesing";
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

// Bygges per innlogget viewer (coach-scoping: COACH ser kun egne spillere,
// ADMIN trenger også egen profildeling). Begge inngangene (Caddie-chat og MCP-endepunktet)
// er ADMIN-begrenset. Ressursfilteret gjelder likevel hvert enkelt oppslag;
// et navnesøk eller en direkte ID må aldri utvide spillerutvalget.
export const buildReadTools = (viewer: { id: string; role: string }) => {
  const hasPlayer = async (tx: Prisma.TransactionClient, scope: Prisma.UserWhereInput, id: string) => Boolean(await tx.user.findFirst({
    where: { AND: [scope, { id }] }, select: { id: true },
  }));
  const denied = () => toolError("Ikke tilgjengelig", "Fant ingen tilgjengelig spiller eller ressurs.");
  return ({
  searchPlayers: tool({
    description:
      "Søk etter spillere via navn, e-post eller et pseudonym/søketoken (delvis match). Returnerer referanse, pseudonym og HCP. " +
      "Referanser er lokale og midlertidige. Kjør et nytt søk hvis et senere oppslag ikke finner ressursen. Kontaktinfo sendes ikke tilbake.",
    inputSchema: z.object({
      query: z.string().describe("Navn eller e-post (delvis match, case-insensitive)"),
      limit: z.number().int().min(1).max(50).default(10),
    }),
    execute: async ({ query, limit }) => {
      try {
        return (await medAkProfiler(viewer, async (tx, scope) => {
          const players = await tx.user.findMany({
            where: {
              AND: [scope, { OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ] }],
            },
            select: {
              id: true,
              name: true,
              hcp: true,
            },
            take: limit,
            orderBy: { name: "asc" },
          });
          return { ok: true as const, data: { count: players.length, players } };
        })) ?? denied();
      } catch {
        return toolError(
          "searchPlayers feilet",
          "Kunne ikke søke etter spillere. Sjekk databasetilkoblingen.",
        );
      }
    },
  }),

  getPlayer: tool({
    description:
      "Hent delt coachingprofil for én spiller: HCP, erfaring, ambisjon, klubb og plan-status. " +
      "(Kontaktinfo og abonnement/Stripe-detaljer er bevisst utelatt — ikke nødvendig for " +
      "coaching-resonnement, og skal ikke sendes til AI-modellen. Bruk getActiveSubscriptions " +
      "hvis abonnementsstatus faktisk trengs.)",
    inputSchema: z.object({
      id: z.string().describe("Spillerreferanse fra et ferskt searchPlayers-svar"),
    }),
    execute: async ({ id }) => {
      try {
        return (await medAkProfiler(viewer, async (tx, scope) => {
          const player = await tx.user.findFirst({
            where: { AND: [scope, { id }] },
            select: {
              id: true,
              name: true,
              hcp: true,
              playingYears: true,
              ambition: true,
              homeClub: true,
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
              "Spilleren er ikke tilgjengelig",
              "Fant ingen spiller med denne IDen.",
            );
          }
          return { ok: true as const, data: player };
        })) ?? denied();
      } catch {
        return toolError(
          "getPlayer feilet",
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
        return (await medAkProfiler(viewer, async (tx, scope) => {
          if (!(await hasPlayer(tx, scope, playerId))) return denied();
          const fromDate = from ? new Date(from) : undefined;
          const toDate = to ? new Date(to) : undefined;
          const sessions = await tx.trainingPlanSession.findMany({
            where: {
              plan: { userId: playerId, user: scope },
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
        })) ?? denied();
      } catch {
        return toolError(
          "getPlayerSessions feilet",
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
        return (await medAkProfiler(viewer, async (tx, scope) => {
          if (!(await hasPlayer(tx, scope, playerId))) return denied();
          const since = periodToSince(period);
          const [rounds, testCount, sessionCount, sgAgg] = await Promise.all([
            tx.round.findMany({
              where: { userId: playerId, user: scope, playedAt: { gte: since } },
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
            tx.testResult.count({
              where: { userId: playerId, user: scope, takenAt: { gte: since } },
            }),
            tx.trainingPlanSession.count({
              where: {
                plan: { userId: playerId, user: scope },
                scheduledAt: { gte: since },
                status: "COMPLETED",
              },
            }),
            tx.round.aggregate({
              where: { userId: playerId, user: scope, playedAt: { gte: since } },
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
        })) ?? denied();
      } catch {
        return toolError(
          "getPlayerStats feilet",
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
        if (viewer.role !== "ADMIN" || !viewer.id) return denied();
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
      } catch {
        return toolError(
          "getUpcomingBookings feilet",
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
        if (viewer.role !== "ADMIN" || !viewer.id) return denied();
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
      } catch {
        return toolError(
          "getOutstandingInvoices feilet",
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
        return (await medAkProfiler(viewer, async (tx, scope) => {
          const round = await tx.round.findFirst({
            where: { id: roundId, user: scope },
            select: {
              id: true,
              playedAt: true,
              score: true,
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
              "Runden er ikke tilgjengelig",
              "Fant ingen runde med denne IDen.",
            );
          }
          return { ok: true as const, data: round };
        })) ?? denied();
      } catch {
        return toolError(
          "getRound feilet",
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
      } catch {
        return toolError(
          "getTournaments feilet",
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
        if (viewer.role !== "ADMIN" || !viewer.id) return denied();
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
      } catch {
        return toolError(
          "getActiveSubscriptions feilet",
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
        return (await medAkProfiler(viewer, async (tx, scope) => {
          if (!(await hasPlayer(tx, scope, playerId))) return denied();
          const session = await tx.trainingPlanSession.findFirst({
            where: {
              plan: { userId: playerId, user: scope },
              ...(pyramidArea ? { pyramidArea } : {}),
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
              log: {
                select: {
                  startedAt: true,
                  completedAt: true,
                  csAchieved: true,
                  rating: true,
                },
              },
            },
            orderBy: { scheduledAt: "desc" },
          });
          if (!session) {
            return toolError(
              "Ingen tilgjengelig økt",
              "Fant ingen økter for denne spilleren.",
            );
          }
          return { ok: true as const, data: session };
        })) ?? denied();
      } catch {
        return toolError(
          "getPlayerLatestSession feilet",
          "Kunne ikke hente siste økt.",
        );
      }
    },
  }),
}) as const;
};
