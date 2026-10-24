/**
 * Data for Spiller 360 (AG-08) i Precision Athletics.
 *
 * Bygger på de samme lasterne og den samme tilgangsporten som sidene den
 * erstatter (/admin/spillere/[id], /analyse, /tester, /plan):
 * `coachScopedPlayerWhere` for spilleren, samtykke-maskert fravær
 * (`innsynsNivaaFra`), `loadMinGolf`, `loadAnalyticsWorkbenchData`,
 * `loadSpillerTesterData`, `loadTestFollowup`,
 * `lastSpillerOversiktForViewer`, `hentTekniskPlan`. Ingen nye tabeller, ingen
 * skriving. Hver fane henter bare sine egne data.
 *
 * Tall som ikke finnes i basen blir null og vises som «—» (fireukerssjekk,
 * utviklingssjekk, Kategori C-linja i talentradaren, standardplan-effekt).
 */
import "server-only";
import { medAkProfiler } from "@/lib/deling/ak-profil-lesing";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { hentTreningsVolum } from "@/lib/training/volum";
import { summerTreningsvolum } from "@/lib/workbench/treningsvolum";
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
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { lastSpiller360Plan } from "./spiller360-plan-data";
import { lastSpiller360Iup } from "./spiller360-iup-data";
import { lastSpiller360Teknisk as lastTp } from "./spiller360-teknisk-data";
import { lastSpiller360Samtaler } from "./spiller360-samtaler-data";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";
import { ukenummer } from "@/lib/uke-helpers";
import type { SgCategory, Prisma } from "@/generated/prisma/client";
import {
  dato, datagrunnlag, desimal, kortDato, sg, snittscore,
  tellendeRunder, tilPar, type S360Fane,
} from "./spiller360-visning";
import type {
  S360FaneData, S360Stats, S360Talent, S360Tester,
} from "./spiller360-typer";

type Viewer = { id: string; role: string };

const DAG = 86_400_000;
const OMRADE_NAVN: Record<SgCategory, string> = { OTT: "Utslag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting" };
const SG_KODER: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];
const VOLUM_SELECT = {
  id: true, date: true, startMinute: true, pyramid: true, durationMinutes: true,
  actualMinutes: true, status: true, updatedAt: true, migrertFraTrainingPlanSessionId: true,
  isTemplate: true, hiddenByPlayer: true, needsPlayerApproval: true, approvalStatus: true,
} as const;

export { lastSpiller360Hode, lastSpiller360Rail } from "./spiller360-hode-data";

/* ───────────────────────────── Stats ───────────────────────────── */

async function stallSnitt(viewer: Viewer): Promise<Record<SgCategory, number | null>> {
  const grense = new Date(Date.now() - 56 * DAG);
  const agg = await prisma.round.aggregate({
    where: { playedAt: { gte: grense }, sharedWithCoach: true, user: { AND: [coachScopedPlayerWhere(viewer), { role: "PLAYER" }] } },
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
      where: { userId: id, sharedWithCoach: true },
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
      where: { userId: id, sharedWithCoach: true },
      orderBy: { playedAt: "desc" },
      take: STANDARD_VINDU * 2,
      select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    hentTurneringshistorikk(id, undefined, { medDataGolf: true }),
    hentVekstrateData(id),
    getPlayerBenchmarkGaps(id).catch(() => []),
    stallSnitt(viewer),
    hentTreningsVolum(id, UKER, naa),
    beregnKorrelasjon(id, 16),
    prisma.workbenchSession.findMany({
      where: { playerId: id, date: { gte: mandag, lt: new Date(mandag.getTime() + 7 * DAG) }, status: { not: "DRAFT" }, isTemplate: false },
      select: VOLUM_SELECT,
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

  const ukeVolum = summerTreningsvolum(ukeOkter, {
    fraDato: mandag, tilDato: new Date(mandag.getTime() + 7 * DAG), naa,
  });
  // Eksisterende UI tar tall: bare registrerte akser får en faktisk stolpe.
  // Hele plan-/ukjent-/framtidsgrunnlaget følger i volumMetadata.
  const planMotFaktisk = ukeVolum.akser.flatMap((r) => r.faktiskMinutter === null ? [] : [{
    akse: r.akse, plan: r.planlagtMinutter, faktisk: r.faktiskMinutter,
  }]);

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
      volumMetadata: ukeVolum,
      planKilde: `WORKBENCH · UKE ${ukenummer(mandag)} · FAKTISK REGISTRERT · ${ukeVolum.total.ukjentOkter} UKJENT · ${ukeVolum.total.framtidigeOkter} FRAMTIDIGE · ${dato(naa)}`,
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


/* ───────────────────────────── Talent ───────────────────────────── */

type Dna = { fysisk?: number; teknikk?: number; taktikk?: number; mental?: number; motivasjon?: number };

async function lastTalent(id: string, db: Prisma.TransactionClient): Promise<S360Talent> {
  const [t, bruker] = await Promise.all([
    db.talentTracking.findUnique({ where: { userId: id } }),
    db.user.findUnique({ where: { id }, select: { preferences: true } }),
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

export async function lastSpiller360Fane(viewer: Viewer, id: string, fane: S360Fane, iupGruppeId?: string): Promise<S360FaneData | null> {
  if (fane === "plan") {
    const data = await lastSpiller360Plan(viewer, id);
    return data ? { fane, data } : null;
  }
  if (fane === "samtaler") {
    const data = await lastSpiller360Samtaler(viewer, id);
    return data ? { fane, data } : null;
  }
  // Disse to fanene har full transaksjonsbundet kjede. Et tidligere godkjent
  // hode er ikke tilstrekkelig: direkte fanekall må kontrollere delingen på nytt.
  if (fane === "tp" || fane === "talent") {
    return medAkProfiler(viewer, async (tx, scope): Promise<S360FaneData | null> => {
      const spiller = await tx.user.findFirst({ where: { AND: [scope, { id }] }, select: { id: true } });
      if (!spiller) return null;
      return fane === "tp" ? { fane, data: await lastTp(id, tx) } : { fane, data: await lastTalent(id, tx) };
    });
  }
  // Stats/Tester har fortsatt egne eldre underlesere.
  // De må konverteres samlet før hele Spiller 360 kan regnes som sikret.
  switch (fane) {
    case "stats": return { fane, data: await lastStats(viewer, id) };
    case "test": {
      const d = await lastTester(viewer, id);
      return d ? { fane, data: d } : null;
    }
    case "iup": {
      const d = await lastSpiller360Iup(viewer, id, iupGruppeId);
      return d ? { fane, data: d } : null;
    }
  }
}
