import "server-only";

import { prisma } from "@/lib/prisma";
import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { formaterTestVerdi } from "@/lib/portal-tester/format-verdi";
import { parseForScoring } from "@/lib/portal-tester/test-scoring";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import type { TurneringsRad } from "@/lib/domain/turneringshistorikk";

import {
  alderPaDato,
  delTurneringer,
  etterlevelse,
  isoTilUtcDato,
  leggTilDagerIso,
  normaliserKlasse,
  osloIso,
  sistePerTest,
  snittAv,
  snittscore,
  testMerke,
  wangUke,
  type EtterlevelseOkt,
  type UkeEtterlevelse,
  type WangUke,
} from "./wang-elever-regler";

/**
 * Datalaster for WANG Elever og Meldinger (WANG-07, 44, WG-04, WG-05).
 *
 * Tilgang: skjermen har allerede kalt `krevWangTrener()`. Her slås eleven
 * alltid opp mot `gruppe.id` fra porten (ekte gruppe eller demogruppen), aldri
 * mot en slug. En elev er en aktiv PLAYER i gruppa — det er den tilgangen som
 * finnes i dag. Tegningens «delt fra PlayerHQ med din @wang.no-adresse» har
 * ingen modell ennå (se rapporten).
 *
 * Alt som mangler er `null`. Visningen skriver «—».
 */

/** Økter som står i elevens plan. Utkast og maler vises ikke. */
const PLAN_STATUSER = ["PUBLISHED", "CHANGED_AFTER_PUBLISH", "IN_PROGRESS", "COMPLETED", "SKIPPED"];

export const FASE_NAVN: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialperiode",
  TURNERING: "Turneringsperiode",
  EVALUERING: "Evaluering",
  FERIE: "Ferie",
  RESTITUSJON: "Restitusjon",
  TESTUKE: "Testuke",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

export type WangElevGrunn = {
  id: string;
  navn: string;
  fornavn: string;
  alder: number | null;
  klasse: string | null;
  klubb: string | null;
  hcp: number | null;
  medlemSiden: Date;
};

const elevValg = {
  joinedAt: true,
  user: { select: { id: true, name: true, email: true, dateOfBirth: true, schoolYear: true, homeClub: true, hcp: true, deletedAt: true } },
} as const;

type ElevRad = {
  joinedAt: Date;
  user: { id: string; name: string; email: string; dateOfBirth: Date | null; schoolYear: string | null; homeClub: string | null; hcp: number | null; deletedAt: Date | null };
};

function tilElev(r: ElevRad, na: Date): WangElevGrunn {
  const navn = r.user.name?.trim() || r.user.email;
  return {
    id: r.user.id,
    navn,
    fornavn: navn.split(/\s+/)[0] ?? navn,
    alder: alderPaDato(r.user.dateOfBirth, na),
    klasse: normaliserKlasse(r.user.schoolYear),
    klubb: r.user.homeClub?.trim() || null,
    hcp: r.user.hcp,
    medlemSiden: r.joinedAt,
  };
}

/** Aktive elever i gruppa, sortert på navn. */
export async function hentGruppeElever(gruppeId: string, na: Date): Promise<WangElevGrunn[]> {
  const rader = await prisma.groupMember.findMany({
    where: { groupId: gruppeId, role: "PLAYER", endedAt: null, user: { deletedAt: null } },
    select: elevValg,
  });
  return rader.map((r) => tilElev(r, na)).sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
}

/** Én elev — bare hvis eleven er aktiv spiller i gruppa. Ellers `null`. */
export async function hentGruppeElev(gruppeId: string, elevId: string, na: Date): Promise<WangElevGrunn | null> {
  const r = await prisma.groupMember.findFirst({
    where: { groupId: gruppeId, userId: elevId, role: "PLAYER", endedAt: null, user: { deletedAt: null } },
    select: elevValg,
  });
  return r ? tilElev(r, na) : null;
}

/** Antall godkjente foresatte (ulike personer) til elevene. Grunnlag for mottakerlinja i WANG-13. */
export async function tellForesatte(elevIder: string[]): Promise<number> {
  if (elevIder.length === 0) return 0;
  const rader = await prisma.parentRelation.findMany({
    where: { childId: { in: elevIder }, approved: true, relationship: "Foresatt" },
    select: { parentId: true },
  });
  return new Set(rader.map((r) => r.parentId)).size;
}

export type WangSnitt ={ snitt: number | null; antall: number; kategori: string | null; kategoriNiva: string | null };

/** Snittscore og A–K-kategori på atten-hullsrunder siste 12 måneder, per elev. */
export async function hentSnittForElever(elevIder: string[], na: Date): Promise<Map<string, WangSnitt>> {
  const ut = new Map<string, WangSnitt>();
  if (elevIder.length === 0) return ut;
  const fra = new Date(na.getTime() - 365 * 86_400_000);
  const runder = await prisma.round.findMany({
    where: { userId: { in: elevIder }, playedAt: { gte: fra }, partialSave: false },
    select: { userId: true, score: true, _count: { select: { holeScores: true } } },
  });
  for (const id of elevIder) {
    const s = snittscore(runder.filter((r) => r.userId === id).map((r) => ({ score: r.score, antallHull: r._count.holeScores })));
    const band = s.snitt === null ? null : kategoriFraSnittscore(s.snitt);
    ut.set(id, { snitt: s.snitt, antall: s.antall, kategori: band?.kategori ?? null, kategoriNiva: band?.niva ?? null });
  }
  return ut;
}

type PlanOktDb = {
  id: string;
  playerId: string;
  date: Date;
  startMinute: number;
  durationMinutes: number;
  title: string;
  pyramid: string;
  status: string;
};

function tilEtterlevelse(o: PlanOktDb): EtterlevelseOkt {
  return {
    datoIso: o.date.toISOString().slice(0, 10),
    startMinutt: o.startMinute,
    varighetMin: o.durationMinutes,
    gjennomfort: o.status === "COMPLETED",
    avlyst: false,
  };
}

async function hentPlanOkter(elevIder: string[], fraIso: string, tilIso: string): Promise<PlanOktDb[]> {
  if (elevIder.length === 0) return [];
  return prisma.workbenchSession.findMany({
    where: {
      playerId: { in: elevIder },
      isTemplate: false,
      status: { in: PLAN_STATUSER },
      date: { gte: isoTilUtcDato(fraIso), lte: isoTilUtcDato(tilIso) },
    },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    select: { id: true, playerId: true, date: true, startMinute: true, durationMinutes: true, title: true, pyramid: true, status: true },
  });
}

/** Etterlevelse forrige hele uke per elev (WANG-07-lista). */
export async function hentForrigeUkeEtterlevelse(elevIder: string[], na: Date): Promise<{ uke: WangUke; perElev: Map<string, UkeEtterlevelse> }> {
  const uke = wangUke(na, -1);
  const okter = await hentPlanOkter(elevIder, uke.startIso, uke.sluttIso);
  const perElev = new Map<string, UkeEtterlevelse>();
  for (const id of elevIder) {
    perElev.set(id, etterlevelse(okter.filter((o) => o.playerId === id).map(tilEtterlevelse), uke.startIso, uke.sluttIso, na));
  }
  return { uke, perElev };
}

export type WangPlanOkt = { id: string; datoIso: string; startMinutt: number; varighetMin: number; tittel: string; omrade: string; status: string };
export type WangPlanUke = WangUke & { okter: WangPlanOkt[]; inneværende: boolean };
export type WangElevPlan = { uker: WangPlanUke[]; siste4: Array<WangUke & UkeEtterlevelse> };

/** Plan-fanen: inneværende og tre neste uker, og etterlevelse siste fire uker. */
export async function hentElevPlan(elevId: string, na: Date): Promise<WangElevPlan> {
  const fremover = [0, 1, 2, 3].map((i) => wangUke(na, i));
  const bakover = [-4, -3, -2, -1].map((i) => wangUke(na, i));
  const okter = await hentPlanOkter([elevId], bakover[0].startIso, fremover[3].sluttIso);
  const somPlan = (o: PlanOktDb): WangPlanOkt => ({
    id: o.id,
    datoIso: o.date.toISOString().slice(0, 10),
    startMinutt: o.startMinute,
    varighetMin: o.durationMinutes,
    tittel: o.title,
    omrade: o.pyramid,
    status: o.status,
  });
  return {
    uker: fremover.map((u, i) => ({
      ...u,
      inneværende: i === 0,
      okter: okter.filter((o) => {
        const d = o.date.toISOString().slice(0, 10);
        return d >= u.startIso && d <= u.sluttIso;
      }).map(somPlan),
    })),
    siste4: bakover.map((u) => ({ ...u, ...etterlevelse(okter.map(tilEtterlevelse), u.startIso, u.sluttIso, na) })),
  };
}

export type WangRunde = { id: string; datoIso: string; bane: string; score: number; sgTotal: number | null };
export type WangElevStats = {
  snitt: number | null;
  antall: number;
  kategori: string | null;
  kategoriNiva: string | null;
  sgTotal: number | null;
  sg: Array<{ navn: string; verdi: number | null }>;
  runder: WangRunde[];
};

/**
 * Stats-fanen: siste ti atten-hullsrunder. SG vises bare når runden har en
 * lagret SG-kilde (`sgSource`); ellers står feltet som «—».
 */
export async function hentElevStats(elevId: string): Promise<WangElevStats> {
  const rader = await prisma.round.findMany({
    where: { userId: elevId, partialSave: false },
    orderBy: { playedAt: "desc" },
    take: 40,
    select: {
      id: true, playedAt: true, score: true, sgSource: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true,
      course: { select: { name: true } },
      _count: { select: { holeScores: true } },
    },
  });
  const hele = rader.filter((r) => r._count.holeScores === 18).slice(0, 10);
  const medSg = hele.filter((r) => !!r.sgSource);
  const s = snittscore(hele.map((r) => ({ score: r.score, antallHull: 18 })));
  const band = s.snitt === null ? null : kategoriFraSnittscore(s.snitt);
  return {
    snitt: s.snitt,
    antall: s.antall,
    kategori: band?.kategori ?? null,
    kategoriNiva: band?.niva ?? null,
    sgTotal: snittAv(medSg.map((r) => r.sgTotal)),
    sg: [
      { navn: "Utslag", verdi: snittAv(medSg.map((r) => r.sgOtt)) },
      { navn: "Innspill", verdi: snittAv(medSg.map((r) => r.sgApp)) },
      { navn: "Nærspill", verdi: snittAv(medSg.map((r) => r.sgArg)) },
      { navn: "Putting", verdi: snittAv(medSg.map((r) => r.sgPutt)) },
    ],
    runder: hele.map((r) => ({
      id: r.id,
      datoIso: osloIso(r.playedAt),
      bane: r.course.name,
      score: r.score,
      sgTotal: r.sgSource ? r.sgTotal : null,
    })),
  };
}

export type WangTestRad = { id: string; navn: string; omrade: string; fysisk: boolean; resultat: string; datoIso: string; merke: "Kontrollert" | "Egenført"; forer: string | null };

/** Tester-fanen: siste resultat per test. */
export async function hentElevTester(elevId: string): Promise<WangTestRad[]> {
  const rader = await prisma.testResult.findMany({
    where: { userId: elevId },
    orderBy: { takenAt: "desc" },
    take: 400,
    select: {
      id: true, userId: true, testId: true, score: true, takenAt: true, recordedById: true,
      recordedBy: { select: { name: true } },
      test: { select: { name: true, pyramidArea: true, protocol: true } },
      _count: { select: { shots: true } },
    },
  });
  return sistePerTest(rader).map((r) => {
    const { kind, shots } = parseForScoring(r.test.protocol);
    const merke = testMerke(r);
    return {
      id: r.id,
      navn: r.test.name,
      omrade: r.test.pyramidArea,
      fysisk: r.test.pyramidArea === "FYS",
      resultat: formaterTestVerdi({ kind, verdi: r.score, shotsCount: shots.length }),
      datoIso: osloIso(r.takenAt),
      merke,
      forer: merke === "Kontrollert" ? r.recordedBy?.name?.trim() || null : null,
    };
  });
}

export type WangPeriode = { id: string; fase: string; navn: string; startIso: string; sluttIso: string; fokus: string | null };
export type WangPeriodeMal = { id: string; periodeId: string; akse: string; tittel: string; egentidMinUke: number; status: string; egenvurdering: number | null; trenervurdering: number | null };
export type WangElevIup = { perioder: WangPeriode[]; navarende: WangPeriode | null; mal: WangPeriodeMal[] };

/** IUP-fanen: gruppas årsplan og elevens mål per periode. */
export async function hentElevIup(gruppeId: string, elevId: string, na: Date): Promise<WangElevIup> {
  const blokker = await prisma.groupPeriodBlock.findMany({
    where: { groupId: gruppeId },
    orderBy: { startDate: "asc" },
    select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true },
  });
  const perioder: WangPeriode[] = blokker.map((b) => ({
    id: b.id,
    fase: b.lPhase,
    navn: FASE_NAVN[b.lPhase] ?? b.lPhase,
    startIso: osloIso(b.startDate),
    sluttIso: osloIso(b.endDate),
    fokus: b.focus,
  }));
  const idag = osloIso(na);
  const navarende = perioder.find((p) => idag >= p.startIso && idag <= p.sluttIso) ?? null;
  const mal = perioder.length
    ? await prisma.groupPeriodGoal.findMany({
        where: { userId: elevId, periodBlockId: { in: perioder.map((p) => p.id) } },
        orderBy: { createdAt: "asc" },
        select: { id: true, periodBlockId: true, akse: true, tittel: true, egentidMinUke: true, status: true, egenvurdering: true, trenervurdering: true },
      })
    : [];
  return {
    perioder,
    navarende,
    mal: mal.map((m) => ({ id: m.id, periodeId: m.periodBlockId, akse: m.akse, tittel: m.tittel, egentidMinUke: m.egentidMinUke, status: m.status, egenvurdering: m.egenvurdering, trenervurdering: m.trenervurdering })),
  };
}

export type WangTurneringer = { kommende: TurneringsRad[]; siste: TurneringsRad[]; koblet: boolean; tomGrunn: string };

/** Turneringer-fanen: samme datamodul som PlayerHQ (`hentTurneringshistorikk`). */
export async function hentElevTurneringer(elevId: string, na: Date): Promise<WangTurneringer> {
  const h = await hentTurneringshistorikk(elevId);
  const alle = h.aar.flatMap((a) => a.turneringer);
  const { kommende, siste } = delTurneringer(alle, na);
  return { kommende, siste: siste.slice(0, 12), koblet: h.harHistorikk, tomGrunn: h.tomGrunn };
}

export type WangProveHendelse = { id: string; datoIso: string; slutIso: string; type: "PROVE" | "HELDAGSPROVE" | "EKSAMEN" | "FERIE" | "TURNERING" | "ANNET"; tittel: string; detalj: string | null };

/**
 * Prøveplanen (WG-04) for én elev og én måned: skolens terminliste
 * (`SchoolScheduleEntry`, for elevens trinn eller hele skolen) og elevens
 * turneringer i samme måned.
 */
export async function hentProveplan(elev: WangElevGrunn, maaned: string, na: Date): Promise<{ hendelser: WangProveHendelse[]; kommendeTurneringer: TurneringsRad[] }> {
  const fraIso = `${maaned}-01`;
  // Rutenettet dekker opptil seks uker fra første mandag før den 1.
  const tilIso = leggTilDagerIso(fraIso, 42);
  const [skole, turn] = await Promise.all([
    prisma.schoolScheduleEntry.findMany({
      where: {
        date: { gte: new Date(`${leggTilDagerIso(fraIso, -7)}T00:00:00Z`), lte: new Date(`${tilIso}T23:59:59Z`) },
        OR: elev.klasse ? [{ classYear: null }, { classYear: elev.klasse }] : [{ classYear: null }],
      },
      orderBy: { date: "asc" },
      select: { id: true, date: true, category: true, title: true, note: true },
    }),
    hentElevTurneringer(elev.id, na),
  ]);
  const skoleHendelser: WangProveHendelse[] = skole
    .filter((s) => s.category !== "TIME")
    .map((s) => {
      const type = (["PROVE", "HELDAGSPROVE", "EKSAMEN", "FERIE"] as const).find((k) => k === s.category) ?? "ANNET";
      const iso = osloIso(s.date);
      return { id: s.id, datoIso: iso, slutIso: iso, type, tittel: s.title, detalj: s.note };
    });
  const alleTurn = [...turn.kommende, ...turn.siste];
  const turnHendelser: WangProveHendelse[] = alleTurn.map((t) => {
    const iso = osloIso(t.startDato);
    return { id: `t-${t.turneringId}`, datoIso: iso, slutIso: iso, type: "TURNERING", tittel: t.navn, detalj: t.klasse ?? null };
  });
  return { hendelser: [...skoleHendelser, ...turnHendelser].sort((a, b) => a.datoIso.localeCompare(b.datoIso)), kommendeTurneringer: turn.kommende.slice(0, 8) };
}
