/**
 * Data for Spiller 360 (AG-08) i Precision Athletics.
 *
 * Bygger på de samme lasterne og den samme tilgangsporten som sidene den
 * erstatter (/admin/spillere/[id], /analyse, /tester, /plan):
 * `coachScopedPlayerWhere` for spilleren, samtykke-maskert fravær
 * (`innsynsNivaaFra`), `loadMinGolf`, `loadAnalyticsWorkbenchData`,
 * `loadSpillerTesterData`, `loadTestFollowup`, `loadSpillerDashboardEkstra`,
 * `lastSpillerOversiktForViewer`, `hentTekniskPlan`. Ingen nye tabeller, ingen
 * skriving. Hver fane henter bare sine egne data.
 *
 * Tall som ikke finnes i basen blir null og vises som «—» (fireukerssjekk,
 * utviklingssjekk, Kategori C-linja i talentradaren, standardplan-effekt).
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { innsynsNivaaFra, maskerLeave } from "@/lib/health/leave-innsyn";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";
import { hentTreningsVolum } from "@/lib/training/volum";
import { beregnKorrelasjon } from "@/lib/training/korrelasjon";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { loadAnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import { sammenlignMedSegSelv, STANDARD_VINDU } from "@/lib/domain/sg-mot-seg-selv";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { hentVekstrateData } from "@/lib/admin/vekstrate-data";
import { getPlayerBenchmarkGaps } from "@/lib/intelligence/benchmark-provider";
import { loadSpillerTesterData } from "@/lib/admin/spiller-tester-data";
import { loadTestFollowup } from "@/lib/portal-tester/test-followup-data";
import { ovelsesNavn } from "@/lib/portal-tester/test-anbefaling";
import { tnHistorikkRader } from "@/lib/portal-tester/tn-historikk";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnFormat } from "@/lib/portal-tester/tn-scoring";
import { formaterTestVerdi } from "@/lib/portal-tester/format-verdi";
import { parseForScoring } from "@/lib/portal-tester/test-scoring";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { adherencePct } from "@/lib/workbench/compliance";
import { loadSpillerDashboardEkstra } from "@/lib/admin-spiller/spiller-dashboard-data";
import { lastSpillerOversiktForViewer } from "@/lib/admin-spiller/spiller-oversikt-data";
import { lastSpillerArbeidsvisning } from "@/lib/admin-spiller/spiller-arbeidsvisning-data";
import { hentTekniskPlan } from "@/lib/teknisk-plan/tp-last";
import { planVisning } from "@/lib/teknisk-plan/tp-visning";
import { velgPlan } from "@/lib/teknisk-plan/tp-oversikt";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";
import { ukenummer } from "@/lib/uke-helpers";
import type { SessionStatus, SgCategory } from "@/generated/prisma/client";
import {
  akseFra, dato, datagrunnlag, desimal, erWangEllerTn, hcp, kortDato, sg, snittscore,
  tellendeRunder, tilPar, type AkseKode, type S360Fane,
} from "./spiller360-visning";
import type {
  S360FaneData, S360Hode, S360Iup, S360Plan, S360RailSpiller, S360Samtaler, S360Stats, S360Talent, S360Tester, S360Tp,
} from "./spiller360-typer";

type Viewer = { id: string; role: string };

const DAG = 86_400_000;
const OMRADE_NAVN: Record<SgCategory, string> = { OTT: "Utslag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting" };
const SG_KODER: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];
const UKEDAG = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "UTC" });
const DAG_MND = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

/** WorkbenchSession.status → compliance-vokabularet (samme tabell som load-workbench.ts). */
const WB_TIL_SESSION: Record<string, SessionStatus> = {
  SCHEDULED: "PLANNED", PUBLISHED: "PLANNED", PLANNED: "PLANNED", IN_PROGRESS: "ACTIVE",
  COMPLETED: "COMPLETED", CANCELLED: "CANCELLED", SKIPPED: "SKIPPED",
};

/** `date` (@db.Date, UTC-midnatt for Oslo-dagen) + startMinute → lokal tid. */
function wbTid(date: Date, startMinute: number): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, startMinute);
}

function dagLabel(d: Date): string {
  const u = UKEDAG.format(d).replace(".", "");
  return `${u.charAt(0).toUpperCase()}${u.slice(1, 3)} ${DAG_MND.format(d)}`;
}

function alderAar(d: Date | null): number | null {
  return d ? d.getUTCFullYear() : null;
}

/** Hullantall fra hullkortet; 0 = bare totalscore. */
function hullFra(n: number): number {
  return n;
}

/* ───────────────────────── Hode (alltid) ───────────────────────── */

export async function lastSpiller360Hode(viewer: Viewer, id: string): Promise<S360Hode | null> {
  const naa = new Date();
  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(viewer), { id, role: "PLAYER" }] },
    select: {
      id: true, name: true, avatarUrl: true, hcp: true, dateOfBirth: true,
      groupMemberships: { where: { endedAt: null }, orderBy: { joinedAt: "asc" }, select: { group: { select: { name: true, program: true } } } },
    },
  });
  if (!spiller) return null;

  const idag = osloDagSomDbDato(naa);
  const [runder, okter, avtale, nesteTurnering, sisteBooking, forslag] = await Promise.all([
    prisma.round.findMany({
      where: { userId: id },
      orderBy: { playedAt: "desc" },
      take: 20,
      select: { score: true, playedAt: true, _count: { select: { holeScores: true } } },
    }),
    prisma.workbenchSession.findMany({
      where: { playerId: id, date: { gte: new Date(idag.getTime() - 28 * DAG), lte: idag }, status: { not: "DRAFT" } },
      select: { date: true, startMinute: true, durationMinutes: true, status: true },
    }),
    prisma.subscription.findFirst({
      where: { userId: id, kind: "COACHING", status: { in: ["ACTIVE", "TRIALING"] } },
      select: { plan: true, monthlyCredits: true, creditsRemaining: true, currentPeriodEnd: true },
    }),
    prisma.tournamentEntry.findFirst({
      where: { userId: id, withdrawnAt: null, OR: [{ tournament: { startDate: { gte: naa } } }, { manualDate: { gte: naa } }] },
      orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
      select: { manualName: true, manualDate: true, tournament: { select: { name: true, startDate: true } } },
    }),
    prisma.booking.findFirst({
      where: { userId: id, startAt: { lt: naa } },
      orderBy: { startAt: "desc" },
      select: { startAt: true, serviceType: { select: { name: true } } },
    }),
    prisma.planAction.findMany({
      where: { userId: id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, actionType: true, agentName: true, createdAt: true },
    }),
  ]);

  const snitt = snittscore(runder.map((r) => ({ score: r.score, playedAt: r.playedAt, hull: hullFra(r._count.holeScores) })));
  const grupper = spiller.groupMemberships.map((m) => m.group.name);
  const wangTn = erWangEllerTn(spiller.groupMemberships.map((m) => m.group.program), grupper);
  const pct = adherencePct(
    okter.map((o) => ({ scheduledAt: wbTid(o.date, o.startMinute), durationMin: o.durationMinutes, status: WB_TIL_SESSION[o.status] ?? "PLANNED" })),
    naa,
  );
  const turnDato = nesteTurnering?.tournament?.startDate ?? nesteTurnering?.manualDate ?? null;

  return {
    id: spiller.id,
    navn: spiller.name ?? "Spiller",
    avatarUrl: spiller.avatarUrl,
    grupper,
    kategori: snitt.kategori,
    hcp: hcp(spiller.hcp),
    fodtAar: alderAar(spiller.dateOfBirth),
    tilhorighet: wangTn ? "WANG · TEAM NORWAY" : "AK GOLF",
    etterlevelse: { pct, kilde: `WORKBENCH · 4 UKER · ${dato(naa)}` },
    avtale: avtale
      ? {
          verdi: `${avtale.creditsRemaining} av ${avtale.monthlyCredits} klipp`,
          hint: [avtale.plan, avtale.currentPeriodEnd ? `FORNYES ${dato(avtale.currentPeriodEnd)}` : null].filter(Boolean).join(" · ").toUpperCase(),
        }
      : null,
    nesteTurnering: nesteTurnering
      ? { navn: nesteTurnering.tournament?.name ?? nesteTurnering.manualName ?? "Turnering", dato: dato(turnDato) }
      : null,
    sisteBooking: sisteBooking ? { dato: dato(sisteBooking.startAt), tjeneste: sisteBooking.serviceType?.name ?? "—" } : null,
    kreverDeg: forslag.map((f) => ({
      id: f.id,
      tittel: `Forslag til godkjenning · ${f.actionType.toLowerCase().replace(/_/g, " ")}`,
      sub: `${f.agentName} · ${dato(f.createdAt)}`.toUpperCase(),
    })),
  };
}

/* ─────────────────────── Arbeidsvisning (?vis=360) ─────────────────────── */

export async function lastSpiller360Rail(viewer: Viewer, id: string): Promise<S360RailSpiller[]> {
  const a = await lastSpillerArbeidsvisning(viewer, id);
  return (a?.rail ?? []).map((r) => ({ id: r.id, navn: r.navn, sub: [r.hcpLabel !== "—" ? `HCP ${r.hcpLabel}` : null, r.subLabel || null].filter(Boolean).join(" · ") }));
}

/* ───────────────────────────── Plan ───────────────────────────── */

async function lastPlan(viewer: Viewer, id: string): Promise<S360Plan> {
  const naa = new Date();
  const idag = osloDagSomDbDato(naa);
  const mandag = new Date(idag.getTime() - ((idag.getUTCDay() + 6) % 7) * DAG);
  const sondag = new Date(mandag.getTime() + 6 * DAG);

  const [okter, oversikt, ekstra, aktivPlan, forslag, samtykke, leaves] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: { playerId: id, date: { gte: mandag, lte: sondag }, status: { not: "DRAFT" }, isTemplate: false },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      select: { id: true, date: true, title: true, pyramid: true, durationMinutes: true, status: true },
    }),
    lastSpillerOversiktForViewer(viewer, id),
    loadSpillerDashboardEkstra(id),
    prisma.trainingPlan.findFirst({
      where: { userId: id, isActive: true },
      orderBy: { updatedAt: "desc" },
      select: { name: true, startDate: true, endDate: true, sessions: { select: { status: true } } },
    }),
    prisma.planAction.findFirst({ where: { userId: id, status: "PENDING" }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    hentSamtykkeStatus(id),
    prisma.leave.findMany({ where: { userId: id }, orderBy: { startAt: "desc" }, take: 10 }),
  ]);

  const innsyn = innsynsNivaaFra(samtykke);
  const naaPeriode = ekstra.sesong?.perioder.find((p) => p.startDate <= naa && p.endDate >= naa) ?? null;
  const nestePeriode = ekstra.sesong?.perioder.find((p) => p.startDate > naa) ?? null;

  return {
    ukeLabel: `Uke ${ukenummer(mandag)}`,
    uke: okter.map((o) => ({ id: o.id, dag: dagLabel(o.date), tittel: o.title, akse: akseFra(o.pyramid), minutter: o.durationMinutes, status: o.status })),
    iDag: oversikt?.iDag ?? [],
    naa: oversikt?.naa ? { tittel: oversikt.naa.tittel, tidspunkt: oversikt.naa.tidspunktLabel, sted: oversikt.naa.sted } : null,
    aktivPlan: aktivPlan
      ? {
          navn: aktivPlan.name,
          periode: `${dato(aktivPlan.startDate)}–${aktivPlan.endDate ? dato(aktivPlan.endDate) : "åpen"}`,
          okter: `${aktivPlan.sessions.filter((s) => s.status === "COMPLETED").length} av ${aktivPlan.sessions.length}`,
          venter: forslag ? `Forslag ${dato(forslag.createdAt)}` : null,
        }
      : null,
    sesong: ekstra.sesong
      ? {
          navn: `${ekstra.sesong.year}${ekstra.sesong.name ? ` · ${ekstra.sesong.name}` : ""}`,
          naa: naaPeriode ? { navn: naaPeriode.focus ?? naaPeriode.lPhase, til: dato(naaPeriode.endDate) } : null,
          neste: nestePeriode ? { navn: nestePeriode.focus ?? nestePeriode.lPhase, fra: dato(nestePeriode.startDate) } : null,
        }
      : null,
    kommende: oversikt?.nesteTurneringer.map((t) => ({ navn: t.navn, dato: t.datoLabel })) ?? [],
    resultater: ekstra.turneringsResultater.map((t) => ({ navn: t.navn, dato: dato(t.dato), plassering: t.position, score: t.score })),
    permisjoner: leaves.map((rad) => {
      const l = maskerLeave(rad, innsyn);
      return {
        id: rad.id,
        aarsak: l.reason,
        fra: dato(l.startAt),
        til: l.endAt ? dato(l.endAt) : "pågår",
        beskrivelse: l.description ?? (l.skjult ? "Ikke delt av spilleren" : "—"),
        status: l.returnedAt ? "Avsluttet" : l.endAt ? "Planlagt slutt" : "Pågående",
      };
    }),
  };
}

/* ───────────────────────────── Stats ───────────────────────────── */

async function stallSnitt(viewer: Viewer): Promise<Record<SgCategory, number | null>> {
  const grense = new Date(Date.now() - 56 * DAG);
  const agg = await prisma.round.aggregate({
    where: { playedAt: { gte: grense }, user: { AND: [coachScopedPlayerWhere(viewer), { role: "PLAYER" }] } },
    _avg: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
  });
  return { OTT: agg._avg.sgOtt, APP: agg._avg.sgApp, ARG: agg._avg.sgArg, PUTT: agg._avg.sgPutt };
}

async function lastStats(viewer: Viewer, id: string): Promise<S360Stats> {
  const naa = new Date();
  const UKER = 8;
  const idag = osloDagSomDbDato(naa);
  const mandag = new Date(idag.getTime() - ((idag.getUTCDay() + 6) % 7) * DAG);

  const [minGolf, workbench, runder, sgRunder, turneringer, vekstrate, gaps, stallen, volum, korrelasjon, ukeOkter] = await Promise.all([
    loadMinGolf(id, "elite"),
    loadAnalyticsWorkbenchData(id),
    prisma.round.findMany({
      where: { userId: id },
      orderBy: { playedAt: "desc" },
      take: 30,
      select: {
        id: true, playedAt: true, score: true, sgTotal: true, tournamentEntryId: true,
        course: { select: { name: true, par: true } },
        holeScores: { select: { par: true } },
        _count: { select: { shots: true } },
      },
    }),
    prisma.round.findMany({
      where: { userId: id },
      orderBy: { playedAt: "desc" },
      take: STANDARD_VINDU * 2,
      select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    hentTurneringshistorikk(id),
    hentVekstrateData(id),
    getPlayerBenchmarkGaps(id).catch(() => []),
    stallSnitt(viewer),
    hentTreningsVolum(id, UKER),
    beregnKorrelasjon(id, 16),
    prisma.workbenchSession.findMany({
      where: { playerId: id, date: { gte: mandag, lt: new Date(mandag.getTime() + 7 * DAG) }, status: { not: "DRAFT" }, isTemplate: false },
      select: { pyramid: true, durationMinutes: true, actualMinutes: true, status: true },
    }),
  ]);

  const snitt = snittscore(runder.map((r) => ({ score: r.score, playedAt: r.playedAt, hull: r.holeScores.length })));
  const tellende = tellendeRunder(runder.map((r) => ({ score: r.score, playedAt: r.playedAt, hull: r.holeScores.length })));
  const motSegSelv = sammenlignMedSegSelv(sgRunder);
  const gapFor = new Map(gaps.map((g) => [g.category, g]));
  const sgAkse = new Map(minGolf.sgStatus.kategorier.map((k) => [k.akse, k.sg]));
  const snittPerOmrade = workbench.sgBreakdown;

  // SG-fremgang per uke (samme ISO-uke-snitt som den gamle fremgang-seksjonen).
  const grense = new Date(naa.getTime() - UKER * 7 * DAG);
  const ukeRunder = sgRunder.filter((r) => r.playedAt >= grense);
  const uker = SG_KODER.map((k) => {
    const felt = { OTT: "sgOtt", APP: "sgApp", ARG: "sgArg", PUTT: "sgPutt" } as const;
    const verdier = ukeRunder.map((r) => r[felt[k]]).filter((v): v is number => v != null);
    if (!verdier.length) return null;
    const siste = verdier[0];
    return { kode: k, navn: OMRADE_NAVN[k], siste, trend: verdier.length > 1 ? siste - verdier[1] : null, antall: verdier.length };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const planMotFaktisk = (["fys", "tek", "slag", "spill", "turn"] as AkseKode[]).map((akse) => {
    const rader = ukeOkter.filter((o) => akseFra(o.pyramid) === akse);
    return {
      akse,
      plan: rader.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.durationMinutes, 0),
      faktisk: rader.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + (o.actualMinutes ?? o.durationMinutes), 0),
    };
  }).filter((r) => r.plan > 0 || r.faktisk > 0);

  const volumUkeSet = [...new Set(volum.map((v) => v.uke))].sort();

  return {
    snitt: { ...snitt, kilde: `RUNDER · BRUTTO · ${snitt.antall} TELLENDE · ${tellende[0] ? dato(tellende[0].playedAt) : "—"}` },
    runder: runder.map((r) => {
      const par = r.holeScores.length ? r.holeScores.reduce((s, h) => s + h.par, 0) : r.course.par;
      return {
        id: r.id,
        dato: dato(r.playedAt),
        bane: r.course.name,
        brutto: r.score,
        tilPar: tilPar(r.score - par),
        hull: r.holeScores.length || null,
        sg: r.sgTotal,
        type: r.tournamentEntryId ? "Turnering" : "Trening",
        grunnlag: r._count.shots > 0 ? "Slag for slag" : r.holeScores.length ? "Hullkort" : "Scorekort",
      };
    }),
    tigerFive: minGolf.runder.tigerFive.map((t) => ({ navn: t.navn, verdi: String(t.verdi), status: t.status })),
    sg: {
      verdi: minGolf.sgStatus.verdi,
      trend: minGolf.sgStatus.trend,
      runder: minGolf.sgStatus.runder,
      baseline: minGolf.sgStatus.baseline,
      grunnlag: minGolf.sgStatus.grunnlag,
      kilde: minGolf.sgStatus.kilde,
      datagrunnlag: datagrunnlag(snittPerOmrade.roundCount),
      omrader: SG_KODER.map((k) => {
        const g = gapFor.get(k);
        const felt = { OTT: snittPerOmrade.sgOtt, APP: snittPerOmrade.sgApp, ARG: snittPerOmrade.sgArg, PUTT: snittPerOmrade.sgPutt }[k];
        return { kode: k, navn: OMRADE_NAVN[k], sg: felt ?? sgAkse.get(k as never) ?? null, motNeste: g?.slagGap ?? null, nesteNivaa: g?.nextLevel ?? null, stallen: stallen[k] };
      }),
      stallKilde: `RUNDER SISTE 8 UKER · ${dato(naa)}`,
      motSegSelv: {
        harSvar: motSegSelv.harSvar,
        grunnlag: motSegSelv.grunnlag,
        akser: motSegSelv.akser.map((a) => ({ navn: a.navn, nylig: a.nylig, tidligere: a.tidligere, endring: a.endring })),
        verst: motSegSelv.storsteTilbakegang ? `${motSegSelv.storsteTilbakegang.navn} ${sg(motSegSelv.storsteTilbakegang.endring, 2)}` : null,
      },
      nesteFokus: minGolf.nesteFokus
        ? { omrade: minGolf.nesteFokus.omrade, sgTap: minGolf.nesteFokus.sgTap, grunnlag: minGolf.nesteFokus.grunnlag, lekkasje: minGolf.nesteFokus.lekkasjeBaand.map((b) => ({ label: b.label, sg: b.sg })) }
        : null,
      uker,
    },
    trening: {
      analyse: workbench.training.analyse,
      volumOmrader: SG_KODER.map((k) => ({ kode: k, navn: OMRADE_NAVN[k], minutter: volum.filter((v) => v.sgArea === k).reduce((s, v) => s + v.minutter, 0) })).filter((v) => v.minutter > 0),
      volumTotal: volum.reduce((s, v) => s + v.minutter, 0),
      volumUker: volumUkeSet.map((u) => ({ uke: u.replace(/^\d{4}-/, ""), minutter: volum.filter((v) => v.uke === u).reduce((s, v) => s + v.minutter, 0) })),
      korrelasjon: korrelasjon.map((k) => ({ navn: OMRADE_NAVN[k.sgArea], r: k.r, datapunkter: k.datapunkter, tolkning: k.tolkning })),
      planMotFaktisk,
      planKilde: `WORKBENCH · UKE ${ukenummer(mandag)} · ${dato(naa)}`,
    },
    trackman: {
      koller: workbench.trackman.clubs,
      okter: workbench.trackman.sessions.slice(0, 6).map((s) => ({ id: s.id, dato: dato(s.recordedAt), slag: s.shotCount, kolle: s.primaryClub })),
    },
    putting: { band: minGolf.putting.band.map((b) => ({ band: b.band, pct: b.pct })), baseline: minGolf.putting.baseline },
    progresjon: minGolf.progresjon ? { nivaa: minGolf.progresjon.nivaa, nesteNivaa: minGolf.progresjon.nesteNivaa, krav: minGolf.progresjon.krav } : null,
    vekstrate: {
      egenRate: vekstrate.egenRate, kohortRate: vekstrate.kohortRate, fraAar: vekstrate.fraAar, tilAar: vekstrate.tilAar,
      harSvar: vekstrate.harSvar, harKohort: vekstrate.harKohort, grunnlag: vekstrate.grunnlag,
    },
    turneringer: {
      antall: turneringer.antall,
      bestePlassering: turneringer.bestePlassering,
      kilder: turneringer.kilder,
      tomGrunn: turneringer.tomGrunn,
      aar: turneringer.aar.map((a) => ({ aar: a.aar, rader: a.turneringer.map((t) => ({ navn: t.navn, dato: dato(t.startDato), plassering: t.plassering, motPar: t.motPar })) })),
    },
    tester: workbench.tests.slice(0, 12).map((t) => ({ id: t.id, navn: t.name, dato: dato(t.takenAt), score: desimal(t.score) })),
  };
}

/* ─────────────────────────── Teknisk plan ─────────────────────────── */

async function lastTp(id: string): Promise<S360Tp> {
  const planer = await prisma.technicalPlan.findMany({
    where: { userId: id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, navn: true, status: true, startDato: true, sluttDato: true, updatedAt: true },
  });
  const valgt = velgPlan(planer);
  const rad = valgt ? await hentTekniskPlan({ id: valgt.id, userId: id }) : null;
  const STATUS: Record<string, string> = { DRAFT: "Utkast", ACTIVE: "Aktiv", ARCHIVED: "Arkivert" };
  return {
    planer: planer.map((p) => ({
      id: p.id, navn: p.navn, status: STATUS[p.status] ?? p.status,
      periode: `${dato(p.startDato)}–${p.sluttDato ? dato(p.sluttDato) : "åpen"}`, oppdatert: dato(p.updatedAt),
    })),
    aktiv: rad ? planVisning(rad, { loggAntall: 5 }) : null,
    aktivId: rad?.id ?? null,
  };
}

/* ───────────────────────────── Tester ───────────────────────────── */

async function lastTester(viewer: Viewer, id: string): Promise<S360Tester | null> {
  const [profil, followup, tnRader] = await Promise.all([
    loadSpillerTesterData(id, viewer),
    loadTestFollowup(id, viewer),
    prisma.testResult.findMany({
      where: { userId: id, testId: { startsWith: "tn-v3-" } },
      select: { id: true, testId: true, score: true, details: true, takenAt: true },
      orderBy: { takenAt: "desc" },
      take: 100,
    }),
  ]);
  if (!profil || !followup) return null;
  const TREND: Record<string, string> = {
    IKKE_SAMMENLIGNBAR: "Ingen sikker sammenligning med tidligere resultat.",
    LIKT: "Lik score som forrige sammenlignbare test.",
    HOYERE: "Høyere score enn forrige sammenlignbare test. Dette er ikke et nivåvarsel.",
    LAVERE: "Lavere score enn forrige sammenlignbare test. Dette er ikke et nivåvarsel.",
  };
  return {
    profil,
    testdager: followup.testdager.map((d) => ({ id: d.id, dato: dato(d.date), tittel: d.title, gjennomfort: d.status === "COMPLETED" })),
    tildelinger: followup.tildelinger.map((t) => ({ id: t.id, navn: t.test.name, frist: t.dueDate ? dato(t.dueDate) : null })),
    resultater: followup.rader.map((r) => ({
      id: r.id,
      navn: r.testNavn,
      score: r.score,
      dato: dato(r.dato),
      trend: TREND[r.trend] ?? TREND.IKKE_SAMMENLIGNBAR,
      forslag: r.forslag.map(({ ovelse, kanLeggesTil, begrunnelse }) => ({
        id: ovelse.id,
        navn: ovelsesNavn(ovelse.navn),
        beskrivelse: ovelse.beskrivelse,
        begrunnelse,
        kanLeggesTil,
        okter: followup.futureSessions
          .filter((s) => s.environment && ovelse.environment.includes(s.environment))
          .map((s) => ({ id: s.id, label: `${dato(s.date)} · ${s.title}` })),
      })),
    })),
    tn: tnHistorikkRader(tnRader).map((r) => ({
      id: r.id, navn: tnProtocol(r.protocolId)?.name ?? r.protocolId, forsok: r.count,
      score: tnFormat({ value: r.score, unit: r.unit }), dato: dato(r.takenAt),
    })),
    workbenchHref: workbenchUrl(id, "uke", {}),
  };
}

/* ───────────────────────────── IUP ───────────────────────────── */

async function lastIup(viewer: Viewer, id: string): Promise<S360Iup | null> {
  const naa = new Date();
  const idag = osloDagSomDbDato(naa);
  const mandag = new Date(idag.getTime() - ((idag.getUTCDay() + 6) % 7) * DAG);
  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(viewer), { id, role: "PLAYER" }] },
    select: {
      name: true, email: true, phone: true, hcp: true, dateOfBirth: true, homeClub: true, school: true, playingYears: true, ambition: true, primaryCoachId: true,
      groupMemberships: { where: { endedAt: null }, select: { group: { select: { name: true, program: true } } } },
      childRelations: { select: { id: true, relationship: true, parent: { select: { name: true, phone: true, email: true } } } },
      goals: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
  if (!spiller) return null;

  const [ekstra, coach, uke, fireUker, tp, tester] = await Promise.all([
    loadSpillerDashboardEkstra(id),
    spiller.primaryCoachId ? prisma.user.findUnique({ where: { id: spiller.primaryCoachId }, select: { name: true } }) : Promise.resolve(null),
    prisma.workbenchSession.findMany({
      where: { playerId: id, date: { gte: mandag, lt: new Date(mandag.getTime() + 7 * DAG) }, status: { not: "DRAFT" }, isTemplate: false },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      select: { date: true, title: true, pyramid: true, durationMinutes: true },
    }),
    prisma.workbenchSession.findMany({
      where: { playerId: id, date: { gte: new Date(idag.getTime() - 28 * DAG), lte: idag }, status: { notIn: ["DRAFT", "CANCELLED"] }, isTemplate: false },
      select: { pyramid: true, durationMinutes: true, actualMinutes: true, status: true },
    }),
    lastTp(id),
    prisma.testResult.findMany({
      where: { userId: id },
      orderBy: { takenAt: "desc" },
      take: 12,
      select: { id: true, score: true, takenAt: true, test: { select: { name: true, protocol: true } } },
    }),
  ]);

  const grupper = spiller.groupMemberships.map((m) => m.group.name);
  const ak = !erWangEllerTn(spiller.groupMemberships.map((m) => m.group.program), grupper);
  const maal = await Promise.all(spiller.goals.map(async (g) => {
    const p = await beregnGoalProgress(g, { hcp: spiller.hcp });
    return { id: g.id, kategori: g.category, tittel: g.title, frist: g.targetDate ? dato(g.targetDate) : null, pct: p.hasData ? p.pct : null };
  }));
  const gjennomforte = fireUker.filter((o) => o.status === "COMPLETED");
  const timer = (["fys", "tek", "slag", "spill", "turn"] as AkseKode[]).map((akse) => ({
    akse,
    timer: Math.round(gjennomforte.filter((o) => akseFra(o.pyramid) === akse).reduce((s, o) => s + (o.actualMinutes ?? o.durationMinutes), 0) / 6) / 10,
  }));

  return {
    ak,
    person: {
      navn: spiller.name ?? "Spiller",
      fodt: spiller.dateOfBirth ? dato(spiller.dateOfBirth) : null,
      klubb: spiller.homeClub, skole: spiller.school, hovedcoach: coach?.name ?? null,
      telefon: spiller.phone, epost: spiller.email,
      spilteAar: spiller.playingYears ? `${spiller.playingYears} år` : null,
      ambisjon: spiller.ambition, grupper,
    },
    foreldre: spiller.childRelations.map((c) => ({ id: c.id, navn: c.parent.name ?? "—", relasjon: c.relationship, kontakt: c.parent.phone ?? c.parent.email ?? null })),
    ranking: [
      { navn: "WAGR", verdi: ekstra.wagr ? `${ekstra.wagr.rank}. plass` : null, kilde: ekstra.wagr ? "WAGR · SISTE SNAPSHOT" : "WAGR · IKKE RANGERT" },
      { navn: "NGF juniorranking", verdi: null, kilde: "NGF · FINNES IKKE I APPEN ENNÅ" },
    ],
    resultatmaal: maal.filter((m) => m.kategori === "OUTCOME"),
    prosessmaal: maal.filter((m) => m.kategori !== "OUTCOME"),
    perioder: (ekstra.sesong?.perioder ?? []).map((p) => ({
      navn: p.focus ?? p.lPhase,
      uker: `Uke ${ukenummer(p.startDate)}–${ukenummer(p.endDate)}`,
      timer: p.weeklyVolMin != null || p.weeklyVolMax != null ? `${p.weeklyVolMin ?? "—"}–${p.weeklyVolMax ?? "—"} min/uke` : "—",
    })),
    turneringer: ekstra.turneringsResultater.map((t) => ({
      navn: t.navn, dato: dato(t.dato),
      resultat: [t.score != null ? String(t.score) : null, t.position != null ? `${t.position}. plass` : null].filter(Boolean).join(" · ") || "—",
    })),
    uke: uke.map((o) => ({ dag: dagLabel(o.date), tittel: o.title, meta: `${(akseFra(o.pyramid) ?? "—").toString().toUpperCase()} · ${o.durationMinutes} min` })),
    trening: fireUker.length
      ? { gjennomfort: gjennomforte.length, planlagt: fireUker.length, timer, kilde: `WORKBENCH · 4 UKER · ${dato(naa)}` }
      : null,
    tester: tester.map((t) => ({ navn: t.test.name, verdi: formaterTestVerdi({ kind: parseForScoring(t.test.protocol).kind, verdi: t.score }), kilde: `TEST · ${dato(t.takenAt)}` })),
    teknikk: tp.aktiv?.oppgaver.map((o) => ({ p: o.pNummer, tittel: o.tittel, status: o.status })) ?? [],
    teknikkKilde: tp.aktiv ? `TEKNISK PLAN · ${tp.aktiv.coach ?? "—"} · ${tp.aktiv.sistRegistrert}`.toUpperCase() : null,
    fys: ekstra.fysTester.map((t) => ({ navn: t.navn, verdi: desimal(t.score), kilde: `FYS-TEST · ${dato(t.takenAt)}` })),
  };
}

/* ─────────────────────────── Samtaler ─────────────────────────── */

async function lastSamtaler(id: string): Promise<S360Samtaler> {
  const [traader, notat, ekstra] = await Promise.all([
    prisma.coachingSession.findMany({
      where: { userId: id },
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: { id: true, kind: true, messages: true, updatedAt: true },
    }),
    prisma.coachNote.findFirst({ where: { playerId: id }, orderBy: { updatedAt: "desc" }, select: { content: true, updatedAt: true, coach: { select: { name: true } } } }),
    loadSpillerDashboardEkstra(id),
  ]);
  const TYPE: Record<string, string> = { DIRECT: "Meldinger", LIVE: "Live-økt", AI: "Coach-AI" };
  return {
    traader: traader.map((t) => ({ id: t.id, type: TYPE[t.kind] ?? t.kind, antall: Array.isArray(t.messages) ? t.messages.length : 0, sist: dato(t.updatedAt) })),
    notat: notat ? { tekst: notat.content, coach: notat.coach.name ?? "—", dato: dato(notat.updatedAt) } : null,
    videoer: ekstra.videoer.map((v, i) => ({ id: `${i}`, tittel: v.title, dato: dato(v.createdAt), kilde: v.kilde === "coach" ? "Coach" : "Spiller" })),
    caddie: { antall: ekstra.caddie.antall, sisteTittel: ekstra.caddie.sisteTittel, sist: ekstra.caddie.sisteAt ? dato(ekstra.caddie.sisteAt) : null },
  };
}

/* ───────────────────────────── Talent ───────────────────────────── */

type Dna = { fysisk?: number; teknikk?: number; taktikk?: number; mental?: number; motivasjon?: number };

async function lastTalent(id: string): Promise<S360Talent> {
  const [t, bruker] = await Promise.all([
    prisma.talentTracking.findUnique({ where: { userId: id } }),
    prisma.user.findUnique({ where: { id }, select: { preferences: true } }),
  ]);
  const akser = (v: Dna) => {
    const rad = [["Fysisk", v.fysisk], ["Teknikk", v.teknikk], ["Taktikk", v.taktikk], ["Mental", v.mental], ["Motivasjon", v.motivasjon]] as const;
    return rad.every(([, x]) => typeof x === "number") ? rad.map(([akse, x]) => ({ akse, verdi: x as number })) : null;
  };
  const prefs = bruker?.preferences as { spillerDna?: Dna } | null;
  const fraTalent = t ? akser({ fysisk: t.fysisk ?? undefined, teknikk: t.teknikk ?? undefined, taktikk: t.taktikk ?? undefined, mental: t.mental ?? undefined, motivasjon: t.motivasjon ?? undefined }) : null;
  const fraDna = !fraTalent && prefs?.spillerDna ? akser(prefs.spillerDna) : null;
  const milepaeler = Array.isArray(t?.milepaeler)
    ? (t.milepaeler as unknown[]).flatMap((m) => {
        if (!m || typeof m !== "object") return [];
        const o = m as { tittel?: unknown; dato?: unknown };
        return typeof o.tittel === "string" ? [{ tittel: o.tittel, dato: typeof o.dato === "string" ? o.dato : null }] : [];
      })
    : [];
  return {
    radar: fraTalent ?? fraDna,
    kilde: fraTalent ? `TALENTVURDERING · ${dato(t!.updatedAt)}` : fraDna ? "SPILLER-DNA · PROFIL" : "—",
    niva: t?.niva ?? null,
    region: t?.region ?? null,
    klubb: t?.klubb ?? null,
    inkludertFra: t ? kortDato(t.inkludertFra) : null,
    notater: t?.notater ?? null,
    milepaeler,
  };
}

/* ───────────────────────────── Samlet ───────────────────────────── */

export async function lastSpiller360Fane(viewer: Viewer, id: string, fane: S360Fane): Promise<S360FaneData | null> {
  switch (fane) {
    case "plan": return { fane, data: await lastPlan(viewer, id) };
    case "stats": return { fane, data: await lastStats(viewer, id) };
    case "tp": return { fane, data: await lastTp(id) };
    case "test": {
      const d = await lastTester(viewer, id);
      return d ? { fane, data: d } : null;
    }
    case "iup": {
      const d = await lastIup(viewer, id);
      return d ? { fane, data: d } : null;
    }
    case "samtaler": return { fane, data: await lastSamtaler(id) };
    case "talent": return { fane, data: await lastTalent(id) };
  }
}
