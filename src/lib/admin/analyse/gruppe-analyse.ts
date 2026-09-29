/**
 * Gruppeanalyse (AG-A03) og Etterlevelse i Precision Athletics.
 *
 * Etterlevelse = gjennomførte minutter / planlagte minutter, siste 4 uker,
 * kun forfalte økter (beslutninger.md 26.09). Regelen bor i
 * `adherencePct` (src/lib/workbench/compliance.ts) og gjenbrukes her.
 * Mangler forfalte økter, er tallet `null` og vises som «—».
 *
 * Datadekning = andel av gruppens spillere som har minst én forfalt økt i
 * vinduet. Ingen ACWR: ingen målt kilde på gruppenivå ennå (se PR-teksten).
 * Ingen rangering: rader sorteres alfabetisk, aldri etter tall.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { adherencePct, oktCompliance } from "@/lib/workbench/compliance";
import type { SessionStatus } from "@/generated/prisma/client";

export const ETTERLEVELSE_UKER = 4;
const DAG_MS = 86_400_000;

export type GruppeInn = {
  id: string;
  navn: string;
  kategori: string | null;
  spillerIds: string[];
};
export type SpillerInn = { id: string; navn: string };
export type OktInn = { userId: string; scheduledAt: Date; durationMin: number; status: SessionStatus };

export type GruppeAnalyseRad = {
  id: string;
  navn: string;
  kategori: string | null;
  antallSpillere: number;
  medPlan: number;
  /** Prosent 0–100, eller null når gruppen ikke har spillere. */
  datadekningPct: number | null;
  etterlevelsePct: number | null;
  gjennomfortMin: number;
  planlagtMin: number;
};

export type SpillerEtterlevelseRad = {
  id: string;
  navn: string;
  etterlevelsePct: number | null;
  gjennomfortMin: number;
  planlagtMin: number;
};

export type GruppeAnalyseData = {
  uker: number;
  grupper: GruppeAnalyseRad[];
  spillere: SpillerEtterlevelseRad[];
  samlet: { antallSpillere: number; etterlevelsePct: number | null };
};

function minutter(okter: OktInn[], now: Date): { gjennomfort: number; planlagt: number } {
  let gjennomfort = 0;
  let planlagt = 0;
  for (const o of okter) {
    if (oktCompliance(o, now) === "fremtidig") continue;
    planlagt += o.durationMin;
    if (o.status === "COMPLETED") gjennomfort += o.durationMin;
  }
  return { gjennomfort, planlagt };
}

const forfalt = (o: OktInn, now: Date) => oktCompliance(o, now) !== "fremtidig";
const nb = (a: string, b: string) => a.localeCompare(b, "nb");

/** Ren aggregering — testes uten database. */
export function byggGruppeAnalyse(
  grupper: GruppeInn[],
  spillere: SpillerInn[],
  okter: OktInn[],
  now: Date,
): GruppeAnalyseData {
  const perSpiller = new Map<string, OktInn[]>();
  for (const o of okter) perSpiller.set(o.userId, [...(perSpiller.get(o.userId) ?? []), o]);
  const oktFor = (id: string) => perSpiller.get(id) ?? [];

  const gruppeRader = grupper
    .map((g): GruppeAnalyseRad => {
      const ids = [...new Set(g.spillerIds)];
      const alle = ids.flatMap(oktFor);
      const { gjennomfort, planlagt } = minutter(alle, now);
      const medPlan = ids.filter((id) => oktFor(id).some((o) => forfalt(o, now))).length;
      return {
        id: g.id,
        navn: g.navn,
        kategori: g.kategori,
        antallSpillere: ids.length,
        medPlan,
        datadekningPct: ids.length === 0 ? null : Math.round((medPlan / ids.length) * 100),
        etterlevelsePct: adherencePct(alle, now),
        gjennomfortMin: gjennomfort,
        planlagtMin: planlagt,
      };
    })
    .sort((a, b) => nb(a.navn, b.navn));

  const spillerRader = spillere
    .map((s): SpillerEtterlevelseRad => {
      const { gjennomfort, planlagt } = minutter(oktFor(s.id), now);
      return { id: s.id, navn: s.navn, etterlevelsePct: adherencePct(oktFor(s.id), now), gjennomfortMin: gjennomfort, planlagtMin: planlagt };
    })
    .sort((a, b) => nb(a.navn, b.navn));

  return {
    uker: ETTERLEVELSE_UKER,
    grupper: gruppeRader,
    spillere: spillerRader,
    samlet: { antallSpillere: spillere.length, etterlevelsePct: adherencePct(spillere.flatMap((s) => oktFor(s.id)), now) },
  };
}

export async function lastGruppeAnalyse(viewer: { id: string; role: string }, now = new Date()): Promise<GruppeAnalyseData> {
  const fra = new Date(now.getTime() - ETTERLEVELSE_UKER * 7 * DAG_MS);

  const spillereRaw = await prisma.user.findMany({
    where: { AND: [coachScopedPlayerWhere(viewer), { deletedAt: null }] },
    select: { id: true, name: true },
  });
  const tillatt = new Set(spillereRaw.map((s) => s.id));

  const grupperRaw = await prisma.group.findMany({
    where: { arkivertAt: null, ...(viewer.role === "COACH" ? { coachId: viewer.id } : {}) },
    select: {
      id: true,
      name: true,
      level: true,
      members: { where: { endedAt: null, role: "PLAYER" }, select: { userId: true } },
    },
  });

  const okterRaw = await prisma.trainingPlanSession.findMany({
    where: { scheduledAt: { gte: fra, lte: now }, plan: { userId: { in: [...tillatt] } } },
    select: { scheduledAt: true, durationMin: true, status: true, plan: { select: { userId: true } } },
  });

  return byggGruppeAnalyse(
    grupperRaw.map((g) => ({
      id: g.id,
      navn: g.name,
      kategori: g.level,
      spillerIds: g.members.map((m) => m.userId).filter((id) => tillatt.has(id)),
    })),
    spillereRaw.map((s) => ({ id: s.id, navn: s.name ?? "Uten navn" })),
    okterRaw.map((o) => ({ userId: o.plan.userId, scheduledAt: o.scheduledAt, durationMin: o.durationMin, status: o.status })),
    now,
  );
}
