/**
 * CoachHQ · AgencyOS — Caddie-aktivitet
 *
 * Sentral oversikt over AI-Caddie sin aktivitet i akademiet. Tidslinje med
 * hendelser (forslag, analyser, eskaleringer, flagg), KPI-strip, mest aktive
 * spillere, fordeling av drill-typer og AI-feil siste 7 dager.
 *
 * Designet er migrert fra `public/design/batch4/coachhq-caddie-aktivitet.html`.
 * Henter data fra Notification (type: "caddie") med dummy-fallback.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CaddieAktivitetClient } from "./aktivitet-client";
import type { CaddieEvent } from "./aktivitet-client";

export const dynamic = "force-dynamic";

function buildDummyEvents(nowMs: number): ReadonlyArray<CaddieEvent> {
  return [
  {
    id: "ev1",
    at: new Date(nowMs - 60 * 1000),
    type: "suggest",
    statusKind: "wait",
    playerInitials: "MR",
    playerName: "Markus R.P.",
    pillLabel: "Foreslo økt",
    title: "Foreslo Putt 5×6 fra 3 m for onsdag 21.5 · 14:00",
    italicSpan: "Putt 5×6 fra 3 m",
    confidence: 0.87,
    followUp: null,
  },
  {
    id: "ev2",
    at: new Date(nowMs - 35 * 60 * 1000),
    type: "analyzed",
    statusKind: "ok",
    playerInitials: "JT",
    playerName: "Joachim T.",
    pillLabel: "Analyserte runde",
    title: "Analyserte runde GFGK 19.5 · 71 brutto · SG·App +0,4",
    italicSpan: "+0,4",
    confidence: 0.92,
    followUp: null,
  },
  {
    id: "ev3",
    at: new Date(nowMs - 72 * 60 * 1000),
    type: "suggest",
    statusKind: "wait",
    playerInitials: "MR",
    playerName: "Markus R.P.",
    pillLabel: "Foreslo plan-endring",
    title:
      "Anbefalte å flytte tirsdag-økt 16:00 → 18:00 · skole-prøve detektert",
    confidence: 0.74,
    followUp: null,
  },
  {
    id: "ev4",
    at: new Date(nowMs - 129 * 60 * 1000),
    type: "import",
    statusKind: "info",
    playerInitials: "VB",
    playerName: "Vilde Bryne",
    pillLabel: "Lead-score",
    title:
      "Scoret innkommende forespørsel · 94 % høy sannsynlighet for konvertering",
    italicSpan: "94 % høy",
    confidence: 0.94,
    followUp: null,
  },
  {
    id: "ev5",
    at: new Date(nowMs - 167 * 60 * 1000),
    type: "escalate",
    statusKind: "wait",
    playerInitials: "SB",
    playerName: "Sigrid Brun",
    pillLabel: "Eskalerte",
    title:
      "Foreslo 30 % volum-reduksjon uke 22 · albue-issue rapportert 17.5",
    italicSpan: "30 % volum-reduksjon",
    confidence: 0.81,
    followUp: null,
  },
  {
    id: "ev6",
    at: new Date(nowMs - 245 * 60 * 1000),
    type: "analyzed",
    statusKind: "ok",
    playerInitials: "ØR",
    playerName: "Øyvind R.",
    pillLabel: "Trackman-import",
    title:
      "Importerte 124 slag fra Trackman bay 2 · auto-mapped til iron CS75-økt",
    confidence: 0.98,
    followUp: "followed",
  },
  {
    id: "ev7",
    at: new Date(nowMs - 322 * 60 * 1000),
    type: "suggest",
    statusKind: "ok",
    playerInitials: "ES",
    playerName: "Emma S.",
    pillLabel: "Foreslo økt",
    title: "Foreslo Iron CS65 blokk for torsdag 22.5 · matcher teknisk plan",
    italicSpan: "Iron CS65 blokk",
    confidence: 0.84,
    followUp: "followed",
  },
  {
    id: "ev8",
    at: new Date(nowMs - 349 * 60 * 1000),
    type: "flagged",
    statusKind: "info",
    playerInitials: "SB",
    playerName: "Sigrid Brun",
    pillLabel: "Flagg",
    title:
      "Markerte mønster · 3 forfalte tester + lav aktivitet siste 14 dager",
    italicSpan: "3 forfalte tester",
    confidence: 0.77,
    followUp: null,
  },
  {
    id: "ev9",
    at: new Date(nowMs - 395 * 60 * 1000),
    type: "suggest",
    statusKind: "rej",
    playerInitials: "MR",
    playerName: "Markus R.P.",
    pillLabel: "Drill-match",
    title: 'Anbefalte drill "Hofte-skifte med medisinball" · nedsving-fokus',
    confidence: 0.72,
    followUp: "ignored",
  },
  {
    id: "ev10",
    at: new Date(nowMs - 17 * 60 * 60 * 1000),
    type: "analyzed",
    statusKind: "ok",
    playerInitials: "JT",
    playerName: "Joachim T.",
    pillLabel: "Ukes-oppsummering",
    title:
      "Genererte uke 20-rapport · pyramide-balanse 67 % · SG-trend opp",
    italicSpan: "67 %",
    confidence: 0.89,
    followUp: "followed",
  },
  {
    id: "ev11",
    at: new Date(nowMs - 21 * 60 * 60 * 1000),
    type: "suggest",
    statusKind: "ok",
    playerInitials: "IM",
    playerName: "Ida M.",
    pillLabel: "Foreslo økt",
    title: "Foreslo Core-styrke 90s-test fredag 23.5",
    italicSpan: "Core-styrke 90s",
    confidence: 0.86,
    followUp: "followed",
  },
  {
    id: "ev12",
    at: new Date(nowMs - 24 * 60 * 60 * 1000),
    type: "escalate",
    statusKind: "wait",
    playerInitials: "HV",
    playerName: "Henrik V.",
    pillLabel: "Venter godkj.",
    title: "Foreslo mental-økt fredag 23.5 · pre-sesong forberedelse",
    italicSpan: "mental-økt fredag 23.5",
    confidence: 0.76,
    followUp: null,
  },
  ];
}

export default async function CaddieAktivitetPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const nowMs = new Date().getTime();
  let events: ReadonlyArray<CaddieEvent> = buildDummyEvents(nowMs);

  try {
    const raw = await prisma.notification.findMany({
      where: { type: { startsWith: "caddie" } },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        user: { select: { name: true } },
      },
    });

    if (raw.length > 0) {
      events = raw.map((n, i) => ({
        id: n.id,
        at: n.createdAt,
        type: mapNotificationToCaddieType(n.type),
        statusKind: n.readAt ? "ok" : "wait",
        playerInitials: initialsOf(n.user.name),
        playerName: n.user.name,
        pillLabel: prettifyType(n.type),
        title: n.body ?? n.title,
        italicSpan: undefined,
        confidence: typicalConfidence(i),
        followUp: null,
      }));
    }
  } catch {
    // Fallback til DUMMY
  }

  return <CaddieAktivitetClient events={events} nowMs={nowMs} />;
}

function mapNotificationToCaddieType(
  type: string,
): CaddieEvent["type"] {
  if (type.includes("escalat")) return "escalate";
  if (type.includes("flag")) return "flagged";
  if (type.includes("analyz")) return "analyzed";
  if (type.includes("import")) return "import";
  return "suggest";
}

function prettifyType(type: string): string {
  const t = type.replace(/^caddie[._-]?/, "").replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1) || "Hendelse";
}

function typicalConfidence(i: number): number {
  return 0.7 + ((i * 7) % 28) / 100;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
