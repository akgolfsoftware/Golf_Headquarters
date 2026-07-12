/**
 * Data-loader for v2-forhåndsvisningen av AgencyOS Kalender (coach-uke).
 *
 * Kilder (EKTE data — ingen fabrikkering):
 *   1. Booking (via loadWeekCalendar) → 1-til-1- og gruppe-økter i valgt uke,
 *      mappet til et 7-dagers tids-grid.
 *   2. GroupSchedule med recurring="WEEKLY" → GJENTAKENDE SERIER. Projiseres
 *      inn i uka på sin ukedag/tid, men KUN for uker på eller etter seriens
 *      startdato (ingen oppdiktede forekomster før serien faktisk begynner).
 *      Serie-økter merkes med `serie`-label ("Gjentas hver <dag>.").
 *
 * SerieMeny («denne / alle fremtidige») bindes til en EKTE gjentakende serie:
 * den som forekommer i uka, ellers nærmeste kommende serie (med startdato-note).
 * Selve serie-redigeringen er delvis (struktur vises, handlingene er ikke koblet).
 *
 * Server-only. Kalles fra page.tsx (RSC).
 */

import { prisma } from "@/lib/prisma";
import { loadWeekCalendar } from "@/lib/admin-kalender/week-data";

export type AkseKort = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export interface KalOkt {
  id: string;
  kl: string;
  startMin: number;
  navn: string;
  akse?: AkseKort;
  sted?: string | null;
  gruppe?: number | null;
  serie?: string | null;
  href?: string;
  naa?: boolean;
}

export interface KalDag {
  dag: string;
  dato: string;
  /** Lokal dato (YYYY-MM-DD) — grunnlag for trykk-på-tom-luke → ny booking (I1). */
  datoISO: string;
  idag: boolean;
  okter: KalOkt[];
}

export interface SerieMenyData {
  navn: string;
  dagTid: string;
  starterLabel: string | null;
}

export interface KalenderData {
  ukeLabel: string;
  ukeNr: number;
  dager: KalDag[];
  idagIndex: number | null;
  serieOkterAntall: number;
  antallOkter: number;
  serieMeny: SerieMenyData | null;
  innsikt: string | null;
  nav: { forrige: string; neste: string; idag: string; erInnevaerende: boolean };
}

const DAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const DAG_GJENTAS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
const MND_NB = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

/** Akse-klassifisering fra tjenestenavn (samme heuristikk som /admin/kalender). */
function akseFra(serviceLabel: string): AkseKort {
  const t = serviceLabel.toLowerCase();
  if (/(fys|speed|styrke|screening|mobilitet)/.test(t)) return "FYS";
  if (/(turnering)/.test(t)) return "TURN";
  if (/(trackman|driver|innspill|wedge|jern|slag)/.test(t)) return "SLAG";
  if (/(spill|bane|hull|runde|tee)/.test(t)) return "SPILL";
  return "TEK";
}

function mandagFor(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function ukedagIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export async function hentAgencyKalenderData(ukeParam?: string): Promise<KalenderData> {
  // 1 · Booking-basert uke-grid (gjenbruk eksisterende, verifisert loader).
  const uke = await loadWeekCalendar(ukeParam);

  const now = new Date();
  const ukeStart = mandagFor(
    ukeParam && !Number.isNaN(new Date(ukeParam).getTime()) ? new Date(ukeParam) : now,
  );

  // 7 dag-bøtter fra booking-data.
  const dager: KalDag[] = uke.days.map((d, i) => {
    const dato = new Date(ukeStart);
    dato.setDate(dato.getDate() + i);
    const okter: KalOkt[] = uke.events
      .filter((e) => e.dayIndex === i)
      .map((e) => ({
        id: e.id,
        kl: e.timeLabel,
        startMin: e.startMin,
        navn: e.title,
        akse: akseFra(e.serviceLabel),
        sted: e.location,
        gruppe: null, // deltakerantall pr. booking er ikke tilgjengelig — ikke gjettet
        serie: null,
        href: e.href,
        naa: e.kind === "live",
      }));
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      dag: DAG_KORT[i],
      dato: `${d.date}.`,
      datoISO: `${dato.getFullYear()}-${pad(dato.getMonth() + 1)}-${pad(dato.getDate())}`,
      idag: d.isToday,
      okter,
    };
  });

  // 2 · Gjentakende serier (GroupSchedule WEEKLY) — projiser inn i uka.
  const serier = await prisma.groupSchedule.findMany({
    where: { recurring: "WEEKLY" },
    include: {
      group: { select: { id: true, name: true, _count: { select: { members: true } } } },
    },
    orderBy: { startAt: "asc" },
  });

  let serieOkterAntall = 0;
  for (const s of serier) {
    const dayIndex = ukedagIndex(s.startAt);
    const forekomst = new Date(ukeStart);
    forekomst.setDate(forekomst.getDate() + dayIndex);
    // Ærlig: bare projiser fra og med seriens startdato (ingen forekomster før serien begynner).
    const anker = new Date(s.startAt);
    anker.setHours(0, 0, 0, 0);
    if (forekomst < anker) continue;

    const startMin = s.startAt.getHours() * 60 + s.startAt.getMinutes();
    dager[dayIndex].okter.push({
      id: `serie-${s.id}`,
      kl: hhmm(s.startAt),
      startMin,
      navn: s.group.name,
      akse: undefined, // akse for gruppe-serie er ikke registrert — nøytral prikk, ikke gjettet
      sted: s.location,
      gruppe: s.group._count.members || null,
      serie: `Gjentas hver ${DAG_GJENTAS[dayIndex]}.`,
      href: `/admin/grupper/${s.group.id}`,
      naa: false,
    });
    serieOkterAntall += 1;
  }

  // Sorter hver dag på starttid.
  for (const d of dager) d.okter.sort((a, b) => a.startMin - b.startMin);

  const antallOkter = dager.reduce((sum, d) => sum + d.okter.length, 0);

  // 3 · SerieMeny — bind til EN ekte gjentakende serie.
  const serieMeny = byggSerieMeny(serier, ukeStart);

  // 4 · Innsikt (ærlig, avledet fra reelle tall).
  const innsikt = byggInnsikt(serieOkterAntall, serieMeny);

  const ukeLabel = `Uke ${uke.weekNumber} · ${ukeRange(ukeStart)} · alle spillere`;

  return {
    ukeLabel,
    ukeNr: uke.weekNumber,
    dager,
    idagIndex: uke.nowDayIndex,
    serieOkterAntall,
    antallOkter,
    serieMeny,
    innsikt,
    nav: {
      forrige: `/admin/kalender?uke=${uke.prevWeekParam}`,
      neste: `/admin/kalender?uke=${uke.nextWeekParam}`,
      idag: `/admin/kalender?uke=${uke.todayParam}`,
      erInnevaerende: uke.isCurrentWeek,
    },
  };
}

type SerieRad = Awaited<ReturnType<typeof prisma.groupSchedule.findMany>>[number] & {
  group: { id: string; name: string; _count: { members: number } };
};

/** Velg serien som forekommer i uka, ellers nærmeste kommende serie. */
function byggSerieMeny(serier: SerieRad[], ukeStart: Date): SerieMenyData | null {
  if (serier.length === 0) return null;
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const iUka = serier.find((s) => {
    const dayIndex = ukedagIndex(s.startAt);
    const forekomst = new Date(ukeStart);
    forekomst.setDate(forekomst.getDate() + dayIndex);
    const anker = new Date(s.startAt);
    anker.setHours(0, 0, 0, 0);
    return forekomst >= anker;
  });

  const valgt = iUka ?? serier[0];
  const dayIndex = ukedagIndex(valgt.startAt);
  const dagTid = `Gjentas hver ${DAG_GJENTAS[dayIndex]}. ${hhmm(valgt.startAt)}`;

  const anker = new Date(valgt.startAt);
  anker.setHours(0, 0, 0, 0);
  const forekomst = new Date(ukeStart);
  forekomst.setDate(forekomst.getDate() + dayIndex);
  const starterLabel =
    forekomst < anker
      ? `Starter ${valgt.startAt.getDate()}. ${MND_KORT[valgt.startAt.getMonth()]}`
      : null;

  return { navn: valgt.group.name, dagTid, starterLabel };
}

function byggInnsikt(serieOkterAntall: number, serieMeny: SerieMenyData | null): string | null {
  if (serieOkterAntall > 0) {
    return `${serieOkterAntall} gjentakende ${serieOkterAntall === 1 ? "serie-økt" : "serie-økter"} i uka. Endrer du en, velger du om det gjelder bare denne økta eller hele serien.`;
  }
  if (serieMeny?.starterLabel) {
    return `Ingen gjentakende serier denne uka — de faste gruppene starter opp igjen ${serieMeny.starterLabel.replace("Starter ", "")}.`;
  }
  return null;
}

function ukeRange(ukeStart: Date): string {
  const slutt = new Date(ukeStart);
  slutt.setDate(slutt.getDate() + 6);
  const sammeMnd = ukeStart.getMonth() === slutt.getMonth();
  if (sammeMnd) {
    return `${ukeStart.getDate()}.–${slutt.getDate()}. ${MND_NB[slutt.getMonth()]}`;
  }
  return `${ukeStart.getDate()}. ${MND_NB[ukeStart.getMonth()]}–${slutt.getDate()}. ${MND_NB[slutt.getMonth()]}`;
}
