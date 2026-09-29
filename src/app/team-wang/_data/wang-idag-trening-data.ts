import "server-only";

import type { LPhase } from "@/generated/prisma/client";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";

import { osloIso, osloMinutter, type WangOkt } from "./wang-trening-beregning";

/**
 * Datalastere for WANG-skjermene under «I dag» og «Trening». Alt leses med
 * gruppe.id fra `krevWangTrener()` — aldri med slug, slik at demogruppen
 * og den ekte gruppen gir hvert sitt riktige svar.
 *
 * Elevnavn er PII om mindreårige. Disse funksjonene kalles bare fra sider
 * bak porten `krevWangTrener()` (trener og sportssjef).
 */

export type WangElevKort = { id: string; navn: string };

/** Aktive spillere i gruppa, sortert på navn. */
export async function hentGruppeElever(gruppeId: string): Promise<WangElevKort[]> {
  const rader = await prisma.groupMember.findMany({
    where: { groupId: gruppeId, ...aktivtSpillerMedlemskapWhere() },
    select: { user: { select: { id: true, name: true, email: true } } },
  });
  return rader
    .map((r) => ({ id: r.user.id, navn: r.user.name?.trim() || "Uten navn" }))
    .sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
}

function dagSomDato(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

const oktValg = {
  id: true,
  playerId: true,
  date: true,
  startMinute: true,
  durationMinutes: true,
  title: true,
  pyramid: true,
  status: true,
  location: true,
  notes: true,
  maalsetning: true,
  actualMinutes: true,
} as const;

type OktRad = {
  id: string;
  playerId: string;
  date: Date;
  startMinute: number;
  durationMinutes: number;
  title: string;
  pyramid: string;
  status: string;
  location: string | null;
  notes: string | null;
  maalsetning: string | null;
  actualMinutes: number | null;
};

function tilOkt(r: OktRad): WangOkt {
  return {
    id: r.id,
    elevId: r.playerId,
    dato: r.date.toISOString().slice(0, 10),
    startMin: r.startMinute,
    varighetMin: r.durationMinutes,
    tittel: r.title,
    omrade: r.pyramid,
    status: r.status,
    sted: r.location,
    notat: r.notes,
    maal: r.maalsetning,
    faktiskMin: r.actualMinutes,
  };
}

/**
 * Elevenes økter mellom to kalenderdager (begge med). Maler og økter eleven
 * har skjult (avvist forslag) er ikke med — de er ikke planlagt trening.
 */
export async function hentElevOkter(elevIder: readonly string[], fraIso: string, tilIso: string): Promise<WangOkt[]> {
  if (elevIder.length === 0) return [];
  const rader = await prisma.workbenchSession.findMany({
    where: {
      playerId: { in: [...elevIder] },
      date: { gte: dagSomDato(fraIso), lte: dagSomDato(tilIso) },
      isTemplate: false,
      hiddenByPlayer: false,
    },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    select: oktValg,
  });
  return rader.map(tilOkt);
}

/** Én økt, bare hvis eleven er aktiv spiller i gruppa. */
export async function hentOktIGruppe(gruppeId: string, oktId: string): Promise<WangOkt | null> {
  const rad = await prisma.workbenchSession.findUnique({ where: { id: oktId }, select: { ...oktValg, isTemplate: true } });
  if (!rad || rad.isTemplate) return null;
  const medlem = await prisma.groupMember.findFirst({
    where: { groupId: gruppeId, userId: rad.playerId, ...aktivtSpillerMedlemskapWhere() },
    select: { id: true },
  });
  return medlem ? tilOkt(rad) : null;
}

export type WangOktBlokk = { id: string; tittel: string; beskrivelse: string | null; minutter: number };

/** Øvelsene i én økt, i rekkefølge. */
export async function hentOktInnhold(oktId: string): Promise<WangOktBlokk[]> {
  const rader = await prisma.workbenchDrill.findMany({
    where: { sessionId: oktId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, description: true, durationMinutes: true },
  });
  return rader.map((r) => ({ id: r.id, tittel: r.title, beskrivelse: r.description, minutter: r.durationMinutes }));
}

// ---------------------------------------------------------------- årsplan

export type WangPeriode = {
  id: string;
  fase: LPhase;
  fra: string;
  til: string;
  fokus: string | null;
  /** Ukevolum i minutter fra periodeplanen. */
  ukevolMin: number | null;
  ukevolMaks: number | null;
  /** Antall økter per uke per område, hvis planen har det. */
  oktbudsjett: Partial<Record<string, number>> | null;
};

export type WangHendelse = {
  id: string;
  tittel: string;
  fra: string;
  til: string;
  startMin: number;
  sluttMin: number;
  sted: string | null;
  /** SAMLING | HELDAGSSAMLING | null */
  type: string | null;
  ukentlig: boolean;
};

export type WangSkoledag = { dato: string; tittel: string; kategori: string; klassetrinn: string | null };

export type WangGruppeplan = {
  perioder: WangPeriode[];
  hendelser: WangHendelse[];
  skoledager: WangSkoledag[];
};

function lesBudsjett(v: unknown): Partial<Record<string, number>> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const ut: Partial<Record<string, number>> = {};
  for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
    if (typeof n === "number" && Number.isFinite(n)) ut[k] = n;
  }
  return Object.keys(ut).length > 0 ? ut : null;
}

function skolearFor(perioder: WangPeriode[], idag: string): string {
  const aar = perioder.length > 0 ? Math.min(...perioder.map((p) => Number(p.fra.slice(0, 4)))) : Number(idag.slice(0, 4)) - (Number(idag.slice(5, 7)) < 8 ? 1 : 0);
  return `${aar}/${aar + 1}`;
}

/** Perioder, hendelser (inkludert faste ukeøkter) og skolerute for gruppa. */
export async function hentGruppeplan(gruppeId: string, idag: string): Promise<WangGruppeplan> {
  const [periodeRader, hendelseRader] = await Promise.all([
    prisma.groupPeriodBlock.findMany({
      where: { groupId: gruppeId },
      orderBy: { startDate: "asc" },
      select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true, weeklyVolMin: true, weeklyVolMax: true, weeklySessionBudget: true },
    }),
    prisma.groupSchedule.findMany({
      where: { groupId: gruppeId },
      orderBy: { startAt: "asc" },
      select: { id: true, title: true, startAt: true, endAt: true, location: true, recurring: true, kind: true },
    }),
  ]);
  const perioder: WangPeriode[] = periodeRader.map((p) => ({
    id: p.id,
    fase: p.lPhase,
    fra: p.startDate.toISOString().slice(0, 10),
    til: p.endDate.toISOString().slice(0, 10),
    fokus: p.focus,
    ukevolMin: p.weeklyVolMin,
    ukevolMaks: p.weeklyVolMax,
    oktbudsjett: lesBudsjett(p.weeklySessionBudget),
  }));
  const hendelser: WangHendelse[] = hendelseRader.map((h) => ({
    id: h.id,
    tittel: h.title,
    fra: osloIso(h.startAt),
    til: osloIso(h.endAt),
    startMin: osloMinutter(h.startAt),
    sluttMin: osloMinutter(h.endAt),
    sted: h.location,
    type: h.kind,
    ukentlig: h.recurring === "WEEKLY",
  }));
  const skoleRader = await prisma.schoolScheduleEntry.findMany({
    where: { schoolYear: skolearFor(perioder, idag) },
    orderBy: { date: "asc" },
    select: { date: true, title: true, category: true, classYear: true },
  });
  const skoledager: WangSkoledag[] = skoleRader.map((s) => ({
    dato: s.date.toISOString().slice(0, 10),
    tittel: s.title,
    kategori: s.category,
    klassetrinn: s.classYear,
  }));
  return { perioder, hendelser, skoledager };
}

/**
 * Faste ukentlige økter gjelder fra første dato og videre. Denne gir
 * forekomstene i et datointervall (begge med), for kalender og ukeplan.
 */
export function hendelserMellom(hendelser: readonly WangHendelse[], fra: string, til: string): Array<WangHendelse & { dato: string }> {
  const ut: Array<WangHendelse & { dato: string }> = [];
  for (const h of hendelser) {
    if (h.ukentlig) {
      const start = new Date(`${h.fra}T00:00:00Z`).getTime();
      for (let t = new Date(`${fra}T00:00:00Z`).getTime(); t <= new Date(`${til}T00:00:00Z`).getTime(); t += 86_400_000) {
        const dato = new Date(t).toISOString().slice(0, 10);
        if (t >= start && new Date(t).getUTCDay() === new Date(start).getUTCDay()) ut.push({ ...h, dato });
      }
    } else if (h.til >= fra && h.fra <= til) {
      ut.push({ ...h, dato: h.fra < fra ? fra : h.fra });
    }
  }
  return ut.sort((a, b) => (a.dato === b.dato ? a.startMin - b.startMin : a.dato < b.dato ? -1 : 1));
}
