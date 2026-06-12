/**
 * Data-loader for /portal/gjennomfore — "I dag"-fanen (ExecuteScreen · TodayView).
 *
 * Henter dagens TrainingSessionV2-økter (samme kilde som Hjem) og bygger
 * accent-kortet (dato + antall + status + Start nå) og økt-lista. Ekte Prisma,
 * tom-tilstand når ingenting i dag — aldri liksom-tall.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type OktStatus = "done" | "now" | "upcoming";

export type GjennomforeOkt = {
  id: string;
  tid: string;
  tittel: string;
  meta: string;
  status: OktStatus;
  href: string;
};

export type GjennomforeData = {
  /** "Onsdag 28. mai" */
  datoTekst: string;
  antall: number;
  /** "Approach-fokus · 1 fullført, 1 nå" — null hvis ingen økter. */
  statusTekst: string | null;
  /** Href til Start nå (pågående/neste økt) — null hvis ingenting å starte. */
  startHref: string | null;
  okter: GjennomforeOkt[];
};

const PRACTICE_TO_PYRAMID: Record<string, PyramidArea> = {
  BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL",
};
const TEMA_LABEL: Record<PyramidArea, string> = { FYS: "Fysisk", TEK: "Teknisk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering" };

function tid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
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
      select: { id: true, title: true, startTime: true, endTime: true, status: true, practiceType: true, _count: { select: { drills: true } } },
      take: 12,
    })
    .catch(() => []);

  const statusAv = (s: string): OktStatus => (s === "COMPLETED" ? "done" : s === "IN_PROGRESS" ? "now" : "upcoming");
  const pyrAv = (pt: string): PyramidArea => PRACTICE_TO_PYRAMID[pt] ?? "TEK";

  const okter: GjennomforeOkt[] = okterRaw.map((o) => ({
    id: o.id,
    tid: tid(o.startTime),
    tittel: o.title,
    meta: `${TEMA_LABEL[pyrAv(o.practiceType)]} · ${Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000))} min`,
    status: statusAv(o.status),
    href: `/portal/gjennomfore/${o.id}`,
  }));

  const fokus = okterRaw.find((o) => o.status === "IN_PROGRESS") ?? okterRaw.find((o) => o.endTime > now) ?? null;
  const fullfort = okter.filter((o) => o.status === "done").length;
  const naa = okter.filter((o) => o.status === "now").length;

  let statusTekst: string | null = null;
  if (okter.length > 0) {
    const fokusOmr = fokus ? TEMA_LABEL[pyrAv(fokus.practiceType)] : null;
    const deler = [`${fullfort} fullført`];
    if (naa > 0) deler.push(`${naa} nå`);
    statusTekst = `${fokusOmr ? `${fokusOmr}-fokus · ` : ""}${deler.join(", ")}`;
  }

  const datoTekst = now.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });

  return {
    datoTekst: datoTekst.charAt(0).toUpperCase() + datoTekst.slice(1),
    antall: okter.length,
    statusTekst,
    startHref: fokus ? `/portal/gjennomfore/${fokus.id}` : null,
    okter,
  };
}
