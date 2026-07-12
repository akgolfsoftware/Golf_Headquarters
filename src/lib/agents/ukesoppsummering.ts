/**
 * C5 (Bølge 3) — spiller-loopen: ukesoppsummering. Hver søndag kveld får
 * hver spiller med aktiv plan en oppsummering av uka (økter gjennomført av
 * planlagt + minutter) og en peker mot neste uke — som in-app-varsel og
 * web-push (best-effort). Ren informasjon, aldri pekefinger: avvik omtales
 * i klarspråk (Nordstjernen — anbefalinger, aldri sperrer).
 *
 * Vern:
 * - Samtykke-gate: mindreårig uten foreldresamtykke får INGEN utsendelse.
 * - Idempotens: har spilleren alt fått ukesoppsummering siste 3 dager
 *   hoppes hen over (tag i Notification.type + createdAt-vindu).
 * - Spillere uten aktiv plan eller uten økter denne/neste uke hoppes over
 *   (ingen tomme «0 av 0»-meldinger).
 */

import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/push/send";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";

const VARSEL_TYPE = "ukesoppsummering";

function mandag(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

export async function runUkesoppsummering(): Promise<{
  spillere: number;
  sendt: number;
  hoppet: number;
  feilet: number;
}> {
  const now = new Date();
  const ukeStart = mandag(now);
  const nesteUkeStart = new Date(ukeStart);
  nesteUkeStart.setDate(nesteUkeStart.getDate() + 7);
  const nesteUkeSlutt = new Date(nesteUkeStart);
  nesteUkeSlutt.setDate(nesteUkeSlutt.getDate() + 7);
  const treDagerSiden = new Date(now.getTime() - 3 * 86_400_000);

  const spillere = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      deletedAt: null,
      trainingPlans: { some: { isActive: true } },
    },
    select: {
      id: true,
      requiresGuardianConsent: true,
      guardianConsentGivenAt: true,
      trainingPlans: {
        where: { isActive: true },
        select: {
          sessions: {
            where: { scheduledAt: { gte: ukeStart, lt: nesteUkeSlutt } },
            select: { scheduledAt: true, status: true, durationMin: true },
          },
        },
      },
    },
    take: 300,
  });

  let sendt = 0;
  let hoppet = 0;
  let feilet = 0;

  for (const spiller of spillere) {
    try {
      if (isAwaitingGuardianConsent(spiller)) {
        hoppet++;
        continue;
      }

      const alleOkter = spiller.trainingPlans.flatMap((p) => p.sessions);
      const denneUka = alleOkter.filter((s) => s.scheduledAt < nesteUkeStart);
      const nesteUka = alleOkter.filter((s) => s.scheduledAt >= nesteUkeStart);
      if (denneUka.length === 0 && nesteUka.length === 0) {
        hoppet++;
        continue;
      }

      const alleredeSendt = await prisma.notification.findFirst({
        where: {
          userId: spiller.id,
          type: VARSEL_TYPE,
          createdAt: { gte: treDagerSiden },
        },
        select: { id: true },
      });
      if (alleredeSendt) {
        hoppet++;
        continue;
      }

      const fullfort = denneUka.filter((s) => s.status === "COMPLETED");
      const minutter = fullfort.reduce((sum, s) => sum + s.durationMin, 0);

      const ukeDel =
        denneUka.length > 0
          ? `Denne uka: ${fullfort.length} av ${denneUka.length} økter gjennomført` +
            (minutter > 0 ? ` (${minutter} min)` : "") +
            "."
          : "Ingen økter var planlagt denne uka.";
      const nesteDel =
        nesteUka.length > 0
          ? ` Neste uke venter ${nesteUka.length} økt${nesteUka.length === 1 ? "" : "er"} — ta en titt på planen.`
          : " Neste uke er åpen — fyll den i Workbench, eller hør med coachen din.";

      await prisma.notification.create({
        data: {
          userId: spiller.id,
          type: VARSEL_TYPE,
          title: "Ukas oppsummering",
          body: (ukeDel + nesteDel).slice(0, 280),
          link: "/portal/planlegge",
        },
      });
      await sendPush(spiller.id, {
        title: "Ukas oppsummering",
        body: ukeDel + nesteDel,
        link: "/portal/planlegge",
        tag: "ukesoppsummering",
      });
      sendt++;
    } catch {
      feilet++;
    }
  }

  return { spillere: spillere.length, sendt, hoppet, feilet };
}
