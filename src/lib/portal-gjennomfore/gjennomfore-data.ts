/**
 * Data-loader for /portal/gjennomfore — hybrid-design 2026-06-17.
 *
 * Henter dagens TrainingSessionV2-økter og deler dem i tre seksjoner:
 *   nesteOkt  — pågående/neste økt (featured forest card)
 *   resteAvDagen — øvrige kommende økter
 *   fullfortIdag  — fullførte økter
 *
 * Ekte Prisma, tom-tilstand når ingenting i dag — aldri liksom-tall.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type OktStatus = "done" | "now" | "upcoming";

const MILJO_LABEL: Record<string, string> = {
  M0: "Studio",
  M1: "Range",
  M2: "Range",
  M3: "Bane",
  M4: "Bane",
  M5: "Turnering",
};

const PRACTICE_TO_PYRAMID: Record<string, PyramidArea> = {
  BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL",
};


export type GjennomforeOkt = {
  id: string;
  tid: string;
  /** Relativ tid til økt — f.eks. "om 1 t", "om 20 min", "Pågår nå" */
  relTidTekst: string;
  tittel: string;
  meta: string;
  /** Stedsnavn (kort) — f.eks. "Studio", "Range", "Bane" */
  sted: string;
  /** Coach-etternavn med initial — f.eks. "A. Kristiansen" */
  coachNavn: string;
  /** Antall drills */
  antallDrills: number;
  /** Første 3 drill-navn (chip-visning) */
  drillNavn: string[];
  status: OktStatus;
  href: string;
  /** COMPLETED men mangler completedSummary */
  trengerLogg: boolean;
  /** Varighet i minutter */
  varighet: number;
  /** Pyramide-område — brukes for border-farge på rad-visning */
  pyramidArea: PyramidArea;
};

export type GjennomforeData = {
  datoTekst: string;
  antall: number;
  totalMin: number;
  /** Neste/pågående økt — null hvis ingen. */
  nesteOkt: GjennomforeOkt | null;
  /** Øvrige kommende (ikke neste). */
  resteAvDagen: GjennomforeOkt[];
  /** Fullførte i dag. */
  fullfortIdag: GjennomforeOkt[];
};

function tid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo",
  });
}

function minutterTil(d: Date): number {
  return Math.round((d.getTime() - Date.now()) / 60_000);
}

function coachInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
  return name;
}

export async function getGjennomforeData(userId: string): Promise<GjennomforeData> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const okterRaw = await prisma.trainingSessionV2
    .findMany({
      where: { studentId: userId, startTime: { gte: startOfDay, lt: endOfDay } },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
        practiceType: true,
        miljo: true,
        completedSummary: true,
        drills: {
          select: { id: true, name: true },
          orderBy: { sortOrder: "asc" },
          take: 4,
        },
        _count: { select: { drills: true } },
        // Fetch coach name via coachId → user
        coachId: true,
      },
      take: 12,
    })
    .catch(() => []);

  // Batch-hent coach-navn for unike coachId-er
  const coachIds = [...new Set(okterRaw.map((o) => o.coachId).filter(Boolean))] as string[];
  const coaches = await prisma.user
    .findMany({
      where: { id: { in: coachIds } },
      select: { id: true, name: true },
    })
    .catch(() => [] as { id: string; name: string | null }[]);
  const coachMap = new Map(coaches.map((c) => [c.id, c.name ?? "Coach"]));

  const statusAv = (s: string): OktStatus =>
    s === "COMPLETED" ? "done" : s === "IN_PROGRESS" ? "now" : "upcoming";

  const pyrAv = (pt: string): PyramidArea => PRACTICE_TO_PYRAMID[pt] ?? "TEK";

  const mapOkt = (o: (typeof okterRaw)[number]): GjennomforeOkt => {
    const status = statusAv(o.status);
    const varighet = Math.max(
      0,
      Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000),
    );
    const pyramid = pyrAv(o.practiceType);
    const coachNavn = coachInitial(coachMap.get(o.coachId) ?? "Anders Kristiansen");
    const sted = MILJO_LABEL[o.miljo] ?? "Studio";
    const drillNavn = o.drills.map((d) => d.name);
    const trengerLogg = status === "done" && o.completedSummary === null;

    // meta for rad-visning (kompakt)
    const minTil = minutterTil(o.startTime);
    const tidLabel =
      status === "now"
        ? "Pågår nå"
        : status === "upcoming" && minTil > 0
          ? `om ${minTil < 60 ? `${minTil} min` : `${Math.round(minTil / 60)} t`}`
          : tid(o.startTime);
    const meta = `${tid(o.startTime)} · ${sted} · ${varighet} min`;

    return {
      id: o.id,
      tid: tid(o.startTime),
      relTidTekst: tidLabel,
      tittel: o.title,
      meta,
      sted,
      coachNavn,
      antallDrills: o._count.drills,
      drillNavn,
      status,
      href: `/portal/gjennomfore/${o.id}`,
      trengerLogg,
      varighet,
      pyramidArea: pyramid,
    };
  };

  const okter = okterRaw.map(mapOkt);
  const fullfortIdag = okter.filter((o) => o.status === "done");
  const kommende = okter.filter((o) => o.status !== "done");

  // "Neste": IN_PROGRESS først, deretter neste planlagte
  const nesteOkt = kommende[0] ?? null;
  const resteAvDagen = kommende.slice(1);

  const totalMin = okter.reduce((sum, o) => sum + o.varighet, 0);
  const datoTekst = now.toLocaleDateString("nb-NO", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo",
  });

  return {
    datoTekst: datoTekst.charAt(0).toUpperCase() + datoTekst.slice(1),
    antall: okter.length,
    totalMin,
    nesteOkt,
    resteAvDagen,
    fullfortIdag,
  };
}
