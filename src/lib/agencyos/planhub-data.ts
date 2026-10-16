/**
 * Laster for Plan-hub (AG-14, /admin/plan). Samler det som før lå på tre
 * sider — hubben (/admin/plan), mal-lista (/admin/plan/maler) og
 * øvelsesbanken — uten nye tabeller eller felt.
 *
 * - Uke-linja telles fra WorkbenchSession for coachens spillere i inneværende
 *   Oslo-uke (samme regel som før: «udekket» = aktiv spiller uten økt i uka).
 * - Ukemaler og program er PlanTemplate (≤ 1 uke / flere uker), med samme felt
 *   som mal-lista hadde: fordeling (zod-validert), uke-for-uke, bruk og effekt.
 * - Standardøkter er OktMal: coachens egne og de globale.
 * - Øvelser er ExerciseDefinition coachen ser i øvelsessøket ellers
 *   (`ovelse-sok.ts`): systemøvelser, egne og de som er delt med plattformen.
 */
import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { mondayOf } from "@/lib/domain/workbench/operations";
import { ukenummer } from "@/lib/uke-helpers";
import { bygUkeOversikt } from "@/lib/domain/plan-uke-oversikt";
import { PYRAMIDE_KODER, type PyramideKode } from "@/lib/domain/ak-formel-v2";
import { lesDetaljer, type PlanhubOvelse } from "./planhub-ovelse";
import type { PlanhubAksetall, PlanhubData, PlanhubMal } from "./planhub-typer";

type Bruker = { id: string; role: string };

/** Hvor mange øvelser lista viser (sist endret først). Resten finnes via søk i Workbench. */
export const OVELSE_GRENSE = 200;

// Pyramide-rekkefølge topp→base, som mal-lista.
const AKSE_ORDEN: PyramideKode[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];
const FordelingSchema = z.record(z.string(), z.number());

function tilFordeling(blob: unknown): PlanhubAksetall[] {
  const p = FordelingSchema.safeParse(blob);
  if (!p.success) return [];
  return AKSE_ORDEN.flatMap((akse) => {
    const andel = p.data[akse];
    if (typeof andel !== "number" || !Number.isFinite(andel)) return [];
    // Tillat både 0–1 og 0–100 (samme regel som readFordeling i mal-editoren).
    return [{ akse, verdi: Math.round(andel > 1 ? andel : andel * 100) }];
  });
}

function tilMinutter(sessions: ReadonlyArray<{ varighetMin: number; pyramidArea: PyramideKode }>): PlanhubAksetall[] {
  const sum = new Map<PyramideKode, number>();
  for (const s of sessions) sum.set(s.pyramidArea, (sum.get(s.pyramidArea) ?? 0) + s.varighetMin);
  return AKSE_ORDEN.filter((a) => (sum.get(a) ?? 0) > 0).map((akse) => ({ akse, verdi: sum.get(akse)! }));
}

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

function tilDatoKolonne(iso: string): Date {
  const [aar, maned, dag] = iso.split("-").map(Number);
  return new Date(Date.UTC(aar, maned - 1, dag));
}

const erPyramide = (v: string): v is PyramideKode => (PYRAMIDE_KODER as readonly string[]).includes(v);

export async function hentPlanhub(user: Bruker): Promise<PlanhubData> {
  const idagIso = osloIdag();
  const weekStartIso = mondayOf(idagIso);
  const weekStart = tilDatoKolonne(weekStartIso);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const idag = tilDatoKolonne(idagIso);

  // WorkbenchSession har ingen relasjon til User — hent coachens spiller-IDer først.
  const spillere = await prisma.user.findMany({ where: coachScopedPlayerWhere(user), select: { id: true } });
  const spillerIder = spillere.map((s) => s.id);

  const ovelseWhere = { OR: [{ source: "SYSTEM" as const }, { createdBy: user.id }, { visibility: "PLATFORM" as const }] };
  const oktMalWhere = { OR: [{ coachId: user.id }, { erGlobal: true }] };

  const [ukensOkter, dagensOkt, maler, oktMaler, ovelser, ovelserTotalt] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: { date: { gte: weekStart, lte: weekEnd }, playerId: { in: spillerIder } },
      select: { playerId: true },
    }),
    prisma.workbenchSession.findFirst({
      where: { date: idag, playerId: { in: spillerIder } },
      orderBy: { startMinute: "asc" },
      select: { playerId: true },
    }),
    prisma.planTemplate.findMany({
      orderBy: [{ usageCount: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        kategori: true,
        lPhase: true,
        varighetUker: true,
        ukentligOktAntall: true,
        usageCount: true,
        disciplinFordeling: true,
        approved: true,
        effectivenessAvg: true,
        sessions: { select: { ukeNr: true, pyramidArea: true, varighetMin: true } },
        _count: { select: { sessions: true, effectiveness: true } },
      },
    }),
    prisma.oktMal.findMany({
      where: oktMalWhere,
      orderBy: [{ bruktAntall: "desc" }, { navn: "asc" }],
      select: { id: true, navn: true, pyramide: true, durationMinutes: true, _count: { select: { driller: true } } },
    }),
    prisma.exerciseDefinition.findMany({
      where: ovelseWhere,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      take: OVELSE_GRENSE,
      select: {
        id: true,
        name: true,
        pyramidArea: true,
        omraadeKode: true,
        motorikk: true,
        belastning: true,
        press: true,
        defaultRepsSets: true,
        parametersJson: true,
      },
    }),
    prisma.exerciseDefinition.count({ where: ovelseWhere }),
  ]);

  const dekket = new Set(ukensOkter.map((o) => o.playerId));
  const workbenchSpiller = dagensOkt?.playerId ?? ukensOkter[0]?.playerId ?? spillerIder[0] ?? null;

  const tilMal = (m: (typeof maler)[number]): PlanhubMal => ({
    id: m.id,
    navn: m.name,
    beskrivelse: m.description,
    kategori: m.kategori,
    fase: m.lPhase,
    varighetUker: m.varighetUker,
    ukentligOktAntall: m.ukentligOktAntall,
    usageCount: m.usageCount,
    oktAntall: m._count.sessions,
    godkjent: m.approved,
    fordeling: tilFordeling(m.disciplinFordeling),
    minutter: tilMinutter(m.sessions),
    ukeOversikt: bygUkeOversikt(m.sessions, m.varighetUker).map((b) => ({ fraUke: b.fraUke, tilUke: b.tilUke, akse: b.omrade, oktAntall: b.oktAntall })),
    effektAvg: m.effectivenessAvg,
    effektAntall: m._count.effectiveness,
  });

  return {
    uke: {
      nr: ukenummer(weekStart),
      spillere: spillerIder.length,
      okter: ukensOkter.length,
      udekket: spillerIder.filter((id) => !dekket.has(id)).length,
    },
    workbenchHref: workbenchSpiller ? `/admin/workbench/${workbenchSpiller}?uke=${weekStartIso}` : "/admin/spillere",
    ukemaler: maler.filter((m) => m.varighetUker <= 1).map(tilMal),
    program: maler.filter((m) => m.varighetUker > 1).map(tilMal),
    standardokter: oktMaler.filter((o) => erPyramide(o.pyramide)).map((o) => ({
      id: o.id,
      navn: o.navn,
      akse: o.pyramide,
      minutter: o.durationMinutes,
      ovelseAntall: o._count.driller,
    })),
    ovelser: ovelser.map((o): PlanhubOvelse => ({
      id: o.id,
      navn: o.name,
      pyramide: o.pyramidArea,
      omraade: o.omraadeKode,
      motorikk: o.motorikk,
      belastning: o.belastning,
      press: o.press,
      mengde: o.defaultRepsSets,
      detaljer: lesDetaljer(o.parametersJson),
      parametre: o.parametersJson,
    })),
    ovelserTotalt,
  };
}
