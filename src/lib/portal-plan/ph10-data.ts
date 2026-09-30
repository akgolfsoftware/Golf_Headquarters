/**
 * PH-10 Plan — laster. Samler økter, opptatt tid, turneringer, samlinger og
 * perioder for det nivået spilleren ser (År · Måned · Uke · Dag) i én lesing.
 *
 * Bare lesing. Økter kommer fra `getWeekOverview` (samme regler for hva
 * spilleren får se som resten av PlayerHQ); kalenderlagene fra
 * `hentSpillerPeriodeITiden`. Det som ikke finnes i basen, blir tomt — aldri
 * gjettet (Google-kalender og «lagt inn av» finnes ikke som data).
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { getWeekOverview, type TodaySession } from "@/app/portal/actions";
import { hentSpillerPeriodeITiden } from "@/lib/kalender-lag/player-dag";
import { OSLO_YMD_FMT, osloInstant } from "@/lib/jarvis/dagen";
import { osloMinuttAvDogen, idagNaaCta } from "@/lib/portal/idag-visning";
import { SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";
import { lesPeriodeType } from "@/app/admin/(legacy)/kalender/lib/periode-helpers";
import type { PeriodeType } from "@/generated/prisma/client";
import {
  aarAv, ddmm, hhmm, isoUke, plussDager, synligeUker, tilMs, utvidAvtaler,
} from "./ph10-dato";
import type {
  PlanAkse, PlanData, PlanFysiskPlan, PlanHeldag, PlanOkt, PlanOktStatus, PlanOpptatt, PlanPeriode, PlanPeriodeType, PlanZoom,
} from "./ph10-typer";
import { PERIODE_NAVN } from "./ph10-typer";

const OSLO_HM = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const AKSE: Record<string, PlanAkse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const STATUS: Record<string, PlanOktStatus> = { PLANNED: "Planlagt", IN_PROGRESS: "Pågår", COMPLETED: "Gjennomført", SKIPPED: "Hoppet over", CANCELLED: "Avlyst" };

/** Perioder som er hendelser i årsplanen, ikke treningsperioder. */
const SAMLING: Partial<Record<PeriodeType, string>> = { TRENINGSSAMLING: "Treningssamling", HELDAGSSAMLING: "Heldagssamling" };
const PERIODE_TYPE: Partial<Record<PeriodeType, PlanPeriodeType>> = {
  GRUNN: "grunn", SPESIAL: "spesial", TURNERING: "turnering", EVALUERING: "evaluering", TESTUKE: "evaluering", FERIE: "ferie", RESTITUSJON: "restitusjon",
};
const PERIODE_EGET_NAVN: Partial<Record<PeriodeType, string>> = { TESTUKE: "Testuke" };

const PAAMELDING: Record<string, string> = {
  PLANNED: "På planen · ikke påmeldt", CLAIMED_REGISTERED: "Meldt på · venter bekreftelse", CONFIRMED: "Påmeldt", COMPLETED: "Gjennomført", DNF: "Trakk seg underveis",
};

function tilOkt(s: TodaySession): PlanOkt | null {
  const status = STATUS[s.status];
  if (!status) return null;
  const start = idagNaaCta({ id: s.id, modell: s.model ?? "v2", status: s.status });
  const aktiv = status === "Planlagt" || status === "Pågår";
  return {
    id: s.id,
    dato: OSLO_YMD_FMT.format(s.startTime),
    tid: OSLO_HM.format(s.startTime),
    min: s.durationMin,
    akse: AKSE[s.pyramidArea] ?? "tek",
    tittel: s.title,
    sted: s.sted,
    status,
    href: s.href,
    startHref: aktiv ? start.ctaHref : null,
    ovelser: s.drills.map((d) => ({ navn: d.name, min: d.durationMinutes })),
  };
}

const osloDato = (d: Date) => OSLO_YMD_FMT.format(d);
/** Bred UTC-ramme rundt en datoperiode; presis filtrering skjer i koden. */
const ramme = (fra: string, til: string) => ({ fra: new Date(tilMs(plussDager(fra, -1))), til: new Date(tilMs(plussDager(til, 2))) });

async function hentOkter(userId: string, mandager: string[]): Promise<PlanOkt[]> {
  const uker = await Promise.all(mandager.map((m) => {
    const [y, mm, d] = m.split("-").map(Number);
    return getWeekOverview(userId, osloInstant(y, mm, d, 12, 0));
  }));
  return uker.flat().flatMap((dag) => dag.sessions).map(tilOkt).filter((o): o is PlanOkt => o != null)
    .sort((a, b) => a.dato.localeCompare(b.dato) || a.tid.localeCompare(b.tid));
}

async function hentTurneringer(userId: string, fra: string, til: string): Promise<PlanHeldag[]> {
  const r = ramme(plussDager(fra, -14), til);
  const rader = await prisma.tournamentEntry.findMany({
    where: {
      userId,
      entryStatus: { not: "WITHDRAWN" },
      OR: [{ manualDate: { gte: r.fra, lte: r.til } }, { tournament: { startDate: { gte: r.fra, lte: r.til } } }],
    },
    select: {
      id: true, manualName: true, manualDate: true, manualEndDate: true, entryStatus: true, planTier: true, notes: true,
      tournament: { select: { id: true, name: true, startDate: true, endDate: true, location: true, format: true, entryCloses: true, registrationUrl: true } },
    },
  });
  const ut: PlanHeldag[] = [];
  for (const e of rader) {
    const start = e.manualDate ?? e.tournament?.startDate;
    if (!start) continue;
    const fraDato = osloDato(start);
    const tilDato = osloDato(e.manualEndDate ?? e.tournament?.endDate ?? start);
    if (tilDato < fra || fraDato > til) continue;
    const t = e.tournament;
    const detaljer: [string, string][] = [
      ["Dato", fraDato === tilDato ? ddmm(fraDato) : `${ddmm(fraDato)}–${ddmm(tilDato)}`],
      ["Sted", t?.location ?? "—"],
      ["Format", t?.format ? t.format.charAt(0) + t.format.slice(1).toLowerCase() : "—"],
      ["Påmeldingsfrist", t?.entryCloses ? ddmm(osloDato(t.entryCloses)) : "—"],
      ["Status", PAAMELDING[e.entryStatus] ?? "—"],
      ["I sesongplanen", `Plan ${e.planTier}`],
    ];
    ut.push({
      id: `turn-${e.id}`, art: "turnering", fra: fraDato, til: tilDato,
      tittel: t?.name ?? e.manualName ?? "Turnering", meta: t?.location ?? null, turneringId: t?.id ?? null, detaljer,
    });
  }
  return ut.sort((a, b) => a.fra.localeCompare(b.fra));
}

/** Datoen en turnering i spillerens plan starter, eller null hvis den ikke er i planen. */
export async function finnTurneringsdato(userId: string, turneringId: string): Promise<string | null> {
  const e = await prisma.tournamentEntry.findFirst({
    where: { userId, tournamentId: turneringId, entryStatus: { not: "WITHDRAWN" } },
    select: { manualDate: true, tournament: { select: { startDate: true } } },
  });
  const d = e?.manualDate ?? e?.tournament?.startDate;
  return d ? osloDato(d) : null;
}

/** Neste fysiske økt fra og med i dag, til «Fysisk»-laget. */
export async function finnNesteFysiskOkt(userId: string, iDag: string): Promise<{ id: string; dato: string } | null> {
  const r = await prisma.workbenchSession.findFirst({
    where: { playerId: userId, pyramid: "FYS", date: { gte: new Date(tilMs(iDag)) }, status: { in: [...SPILLER_SYNLIGE_STATUSER] }, hiddenByPlayer: false },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    select: { id: true, date: true },
  });
  return r ? { id: r.id, dato: r.date.toISOString().slice(0, 10) } : null;
}

async function hentFysiskePlaner(userId: string, naa: Date): Promise<PlanFysiskPlan[]> {
  const planer = await prisma.fysiskPlan.findMany({
    where: { userId },
    orderBy: { startDato: "desc" },
    select: { id: true, navn: true, status: true, startDato: true, uker: { select: { okter: { select: { id: true } } } } },
  });
  return planer.map((p) => {
    const uker = p.uker.length;
    const gaatt = Math.max(0, Math.floor((naa.getTime() - p.startDato.getTime()) / (7 * 86_400_000)));
    return {
      id: p.id, navn: p.navn, uker, okter: p.uker.reduce((s, u) => s + u.okter.length, 0),
      status: p.status === "ACTIVE" ? "ACTIVE" : p.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT",
      ukeNaa: Math.min(gaatt + 1, uker),
    };
  });
}

export async function hentPlanData(o: {
  userId: string; naa: Date; zoom: PlanZoom; dato: string; lag?: "fys" | "turn"; aapneHeldagId?: string | null; aapneOktId?: string | null;
}): Promise<PlanData> {
  const { userId, naa, zoom, dato } = o;
  const iDag = osloDato(naa);
  const aar = aarAv(dato);
  const uker = synligeUker(zoom, dato);
  const fra = zoom === "aar" ? `${aar}-01-01` : uker[0];
  const til = zoom === "aar" ? `${aar}-12-31` : plussDager(uker[uker.length - 1], 6);
  const { fra: fraD, til: tilD } = ramme(fra, til);

  const [okter, hendelser, avtaler, turneringer, sesong, wbAar, fysiskePlaner, uleste] = await Promise.all([
    zoom === "aar" ? Promise.resolve([] as PlanOkt[]) : hentOkter(userId, uker),
    zoom === "aar" ? Promise.resolve([]) : hentSpillerPeriodeITiden(userId, fra, til),
    zoom === "aar" ? Promise.resolve([]) : prisma.playerBusyBlock.findMany({
      where: { userId, OR: [{ recurring: "WEEKLY", startAt: { lte: tilD } }, { recurring: { not: "WEEKLY" }, startAt: { lte: tilD }, endAt: { gte: fraD } }] },
      select: { id: true, title: true, startAt: true, endAt: true, kind: true, recurring: true },
    }),
    hentTurneringer(userId, fra, til),
    prisma.seasonPlan.findFirst({
      where: { userId, year: aar },
      select: { periodBlocks: { orderBy: { startDate: "asc" }, select: { id: true, lPhase: true, notes: true, focus: true, startDate: true, endDate: true } } },
    }),
    zoom === "aar"
      ? prisma.workbenchSession.findMany({
        where: { playerId: userId, date: { gte: new Date(tilMs(fra)), lte: new Date(tilMs(til)) }, status: { in: [...SPILLER_SYNLIGE_STATUSER] }, hiddenByPlayer: false },
        select: { date: true, durationMinutes: true, status: true },
      })
      : Promise.resolve([]),
    o.lag === "fys" ? hentFysiskePlaner(userId, naa) : Promise.resolve(null),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  const opptatt: PlanOpptatt[] = [
    ...hendelser.filter((h) => h.lag === "BOOKING" && h.startMin != null && h.sluttMin != null)
      .map((h) => ({ id: h.id, dato: h.dato, tid: hhmm(h.startMin!), min: h.sluttMin! - h.startMin!, art: "booking" as const, tittel: h.tittel })),
    ...utvidAvtaler(avtaler, fra, til),
  ].sort((a, b) => a.dato.localeCompare(b.dato) || a.tid.localeCompare(b.tid));

  const heldag: PlanHeldag[] = [
    ...turneringer,
    ...hendelser.filter((h) => h.lag === "SKOLE" || h.lag === "TESTER").map((h): PlanHeldag => ({
      id: h.id, art: h.lag === "SKOLE" ? "skole" : "test", fra: h.dato, til: h.dato, tittel: h.tittel, meta: h.undertekst ?? null, turneringId: null, detaljer: [],
    })),
  ];

  const perioder: PlanPeriode[] = [];
  for (const b of sesong?.periodBlocks ?? []) {
    const type = lesPeriodeType(b);
    const start = osloDato(b.startDate), slutt = osloDato(b.endDate);
    const samling = SAMLING[type];
    if (samling) {
      if (slutt >= fra && start <= til) {
        heldag.push({ id: `samling-${b.id}`, art: "samling", fra: start, til: slutt, tittel: b.focus?.trim() || samling, meta: samling, turneringId: null,
          detaljer: [["Dato", start === slutt ? ddmm(start) : `${ddmm(start)}–${ddmm(slutt)}`], ["Type", samling]] });
      }
      continue;
    }
    const pt = PERIODE_TYPE[type];
    if (!pt) continue;
    const fraUke = aarAv(start) < aar ? 1 : Math.min(52, isoUke(start));
    const tilUke = aarAv(slutt) > aar || (isoUke(slutt) === 1 && slutt.slice(5, 7) === "12") ? 52 : Math.min(52, isoUke(slutt));
    const dagerIPeriode = wbAar.filter((s) => { const d = s.date.toISOString().slice(0, 10); return d >= start && d <= slutt; });
    const plan = dagerIPeriode.reduce((s, x) => s + x.durationMinutes, 0);
    const gjort = dagerIPeriode.filter((x) => x.status === "COMPLETED").reduce((s, x) => s + x.durationMinutes, 0);
    perioder.push({
      id: b.id, type: pt, navn: PERIODE_EGET_NAVN[type] ?? PERIODE_NAVN[pt], fraUke, tilUke, fraDato: start,
      planTimer: plan > 0 ? Math.round((plan / 60) * 10) / 10 : null,
      gjortTimer: plan > 0 && start <= iDag ? Math.round((gjort / 60) * 10) / 10 : null,
    });
  }

  return {
    zoom, dato, iDag, naaMin: osloMinuttAvDogen(naa), aar, okter, opptatt, heldag, perioder,
    aapneOktId: o.aapneOktId ?? null, aapneHeldagId: o.aapneHeldagId ?? null, fysiskePlaner, uleste,
  };
}
