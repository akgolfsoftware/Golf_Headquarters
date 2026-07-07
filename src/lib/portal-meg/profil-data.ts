/**
 * Data-loader for /portal/meg — Profil-oversikt (PlayerHQ landing).
 *
 * Henter ekte Prisma-data for header (avatar/navn/meta + abonnement-badge),
 * KPI-strip (runder/beste/snitt) og de klikkbare profil-radene (innboks,
 * fakturaer, bookinger, innstillinger, abonnement).
 *
 * Tomt/utledet ved manglende data — aldri falske tall. Ingen JSON-blobs leses
 * her, så zod-validering er ikke nødvendig.
 */

import { prisma } from "@/lib/prisma";
import type { Tier } from "@/generated/prisma/client";

export type ProfilOversikt = {
  navn: string;
  fornavn: string;
  avatarUrl: string | null;
  initialer: string;
  /** Meta-deler: "HCP 4,2" · "GFGK" · "Pro 2/4 credits" — kun de som finnes. */
  metaDeler: string[];
  badge: { label: string; variant: "lime" | "neutral" };
  /** App-abonnement: gratis (via coaching/gruppe/prøve) eller betalende. */
  abonnement: {
    gratis: boolean;
    /** Coaching-pakkenavn ("Performance Pro" / "Performance") eller null. */
    planNavn: string | null;
  };
  kpi: {
    runder: string;
    beste: string;
    snitt: string;
  };
  innboks: {
    uleste: number;
    /** Tittel på siste varsel, eller null hvis ingen. */
    sisteTittel: string | null;
    sisteNaar: string | null;
  };
  fakturaer: {
    utestaaende: number;
    /** Sum utestående i kroner (heltall) eller null. */
    sumKr: number | null;
  };
  nesteBooking: {
    tekst: string | null;
  };
};

const NOK = new Intl.NumberFormat("nb-NO");

function initialerFra(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "—";
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

function relativTid(d: Date, now: Date): string {
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60_000);
  if (diffMin < 1) return "nå nettopp";
  if (diffMin < 60) return `${diffMin} min siden`;
  const diffTimer = Math.round(diffMin / 60);
  if (diffTimer < 24) return `${diffTimer} ${diffTimer === 1 ? "time" : "timer"} siden`;
  const diffDager = Math.round(diffTimer / 24);
  if (diffDager < 7) return `${diffDager} ${diffDager === 1 ? "dag" : "dager"} siden`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function tallNb(n: number, maxDesimaler = 0): string {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: maxDesimaler });
}

/** Bygger "HCP 4,2 · GFGK · Pro 2/4 credits"-delene fra ekte felter. */
function byggMeta(input: {
  hcp: number | null;
  homeClub: string | null;
  tier: Tier;
  monthlyCredits: number;
  creditsRemaining: number;
}): string[] {
  const deler: string[] = [];
  if (input.hcp != null) deler.push(`HCP ${tallNb(input.hcp, 1)}`);
  if (input.homeClub) deler.push(input.homeClub);
  if (input.tier === "PRO" && input.monthlyCredits > 0) {
    deler.push(`Pro ${input.creditsRemaining}/${input.monthlyCredits} credits`);
  }
  return deler;
}

export async function hentProfilOversikt(input: {
  userId: string;
  navn: string;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  /** Effektiv tier (kan være kampanje-overstyrt). Brukes til badge + credits-meta. */
  tier: Tier;
}): Promise<ProfilOversikt> {
  const now = new Date();

  const [subscription, scoreAgg, sisteVarsel, ulesteAntall, fakturaAgg, nesteBookingRad] =
    await Promise.all([
      prisma.subscription.findUnique({
        where: { userId: input.userId },
        select: { monthlyCredits: true, creditsRemaining: true },
      }),
      prisma.round.aggregate({
        where: { userId: input.userId },
        _count: { _all: true },
        _min: { score: true },
        _avg: { score: true },
      }),
      prisma.notification.findFirst({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
        select: { title: true, createdAt: true },
      }),
      prisma.notification.count({
        where: { userId: input.userId, readAt: null },
      }),
      prisma.payment.aggregate({
        where: { userId: input.userId, status: "PENDING" },
        _count: { _all: true },
        _sum: { amountOre: true },
      }),
      prisma.booking.findFirst({
        where: {
          userId: input.userId,
          startAt: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { startAt: "asc" },
        select: {
          startAt: true,
          coach: { select: { name: true } },
          location: { select: { name: true } },
        },
      }),
    ]);

  const monthlyCredits = subscription?.monthlyCredits ?? 0;
  const creditsRemaining = subscription?.creditsRemaining ?? 0;

  // KPI
  const antallRunder = scoreAgg._count._all;
  const beste = scoreAgg._min.score;
  const snitt = scoreAgg._avg.score;

  // Faktura
  const utestaaende = fakturaAgg._count._all;
  const sumOre = fakturaAgg._sum.amountOre ?? 0;

  // Neste booking → "Tirs 28/5 · Øyvind · Oslo GK · 14:30"
  let bookingTekst: string | null = null;
  if (nesteBookingRad) {
    const d = nesteBookingRad.startAt;
    const dag = d.toLocaleDateString("nb-NO", { weekday: "short" });
    const dato = d.toLocaleDateString("nb-NO", { day: "numeric", month: "numeric" });
    const tid = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
    const deler = [
      `${dag} ${dato}`,
      nesteBookingRad.coach?.name?.split(" ")[0],
      nesteBookingRad.location?.name,
      tid,
    ].filter(Boolean);
    bookingTekst = deler.join(" · ");
  }

  return {
    navn: input.navn,
    fornavn: input.navn.split(" ")[0] || input.navn,
    avatarUrl: input.avatarUrl,
    initialer: initialerFra(input.navn),
    metaDeler: byggMeta({
      hcp: input.hcp,
      homeClub: input.homeClub,
      tier: input.tier,
      monthlyCredits,
      creditsRemaining,
    }),
    badge:
      input.tier === "PRO"
        ? { label: "Pro · 299 kr/mnd", variant: "lime" }
        : { label: "Gratis", variant: "neutral" },
    abonnement: {
      // Coaching-pakke (credits) ⇒ app-tilgang inkludert (gratis). Ellers betalende.
      gratis: monthlyCredits > 0,
      planNavn: monthlyCredits >= 4 ? "Performance Pro" : monthlyCredits > 0 ? "Performance" : null,
    },
    kpi: {
      runder: antallRunder > 0 ? String(antallRunder) : "—",
      beste: beste != null ? String(beste) : "—",
      snitt: snitt != null ? tallNb(snitt, 1) : "—",
    },
    innboks: {
      uleste: ulesteAntall,
      sisteTittel: sisteVarsel?.title ?? null,
      sisteNaar: sisteVarsel ? relativTid(sisteVarsel.createdAt, now) : null,
    },
    fakturaer: {
      utestaaende,
      sumKr: sumOre > 0 ? Math.round(sumOre / 100) : null,
    },
    nesteBooking: { tekst: bookingTekst },
  };
}

export const formatKr = (kr: number) => `${NOK.format(kr)} kr`;
