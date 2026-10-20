/**
 * Laster Tester-oversikten i AgencyOS (AG-15): spillerne coachen når, deres testresultater
 * siste år, gruppene til nedtrekket og neste testdag. Tilgang: coachScopedPlayerWhere for
 * spillere og gruppeInnsynWhere for grupper og testdager, som resten av AgencyOS.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { gruppeInnsynWhere } from "@/lib/workbench/group-scope";
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { byggTesterOversikt, type TesterOversiktData } from "./oversikt-bygg";

const AAR_MS = 365 * 86_400_000;
const DAG_MS = 86_400_000;

export type TesterGruppe = { id: string; navn: string; antall: number };
export type NesteTestdag = { dato: string; ukedag: string; sted: string | null; tittel: string; gruppe: string; deltakere: number; dagerTil: number };

export type TesterOversiktSide = TesterOversiktData & {
  grupper: TesterGruppe[];
  gruppeId: string | null;
  spillerValg: { id: string; navn: string }[];
  nesteTestdag: NesteTestdag | null;
};

const osloDag = (d: Date) => Date.parse(`${d.toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" })}T00:00:00Z`);

export async function lastTesterOversikt(viewer: { id: string; role: string }, gruppeIdInn: string | null, now = new Date()): Promise<TesterOversiktSide> {
  const grupperRaw = await prisma.group.findMany({
    where: { AND: [gruppeInnsynWhere(viewer), { arkivertAt: null }] },
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { members: { where: { role: "PLAYER", endedAt: null } } } } },
  });
  const grupper = grupperRaw.map((g) => ({ id: g.id, navn: g.name, antall: g._count.members }));
  // Bare en gruppe coachen faktisk ser kan velges; ellers hele stallen.
  const gruppeId = gruppeIdInn && grupper.some((g) => g.id === gruppeIdInn) ? gruppeIdInn : null;

  const spillere = await prisma.user.findMany({
    where: { AND: [coachScopedPlayerWhere(viewer), { role: "PLAYER", deletedAt: null }, gruppeId ? { groupMemberships: { some: { groupId: gruppeId, endedAt: null } } } : {}] },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const ider = spillere.map((s) => s.id);

  const [resultater, testdag] = await Promise.all([
    ider.length
      ? prisma.testResult.findMany({
          where: { userId: { in: ider }, takenAt: { gte: new Date(now.getTime() - AAR_MS) } },
          orderBy: { takenAt: "desc" },
          take: 5000,
          select: { id: true, userId: true, takenAt: true, score: true, details: true, testId: true, recordedById: true, witnessStatus: true, test: { select: { id: true, name: true, protocol: true } } },
        })
      : Promise.resolve([]),
    prisma.testDay.findFirst({
      where: { scheduledAt: { gte: new Date(osloDag(now)) }, status: { in: ["PLANNED", "ACTIVE"] }, group: gruppeId ? { id: gruppeId } : gruppeInnsynWhere(viewer) },
      orderBy: { scheduledAt: "asc" },
      select: { scheduledAt: true, location: true, title: true, group: { select: { name: true } }, _count: { select: { participants: true } } },
    }),
  ]);

  const data = byggTesterOversikt(
    spillere.map((s) => ({ id: s.id, navn: s.name ?? "Uten navn" })),
    resultater.map((r) => ({
      id: r.id, userId: r.userId, takenAt: r.takenAt, test: r.test, recordedById: r.recordedById, witnessStatus: r.witnessStatus,
      visning: formaterLagretTestResultat({ testId: r.testId, score: r.score, details: r.details, protocol: r.test.protocol }),
    })),
    now,
  );

  const nesteTestdag = testdag ? {
    dato: new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" }).format(testdag.scheduledAt).replace(/\.$/, ""),
    ukedag: new Intl.DateTimeFormat("nb-NO", { weekday: "long", timeZone: "Europe/Oslo" }).format(testdag.scheduledAt),
    sted: testdag.location, tittel: testdag.title, gruppe: testdag.group.name, deltakere: testdag._count.participants,
    dagerTil: Math.round((osloDag(testdag.scheduledAt) - osloDag(now)) / DAG_MS),
  } : null;

  return { ...data, grupper, gruppeId, spillerValg: spillere.map((s) => ({ id: s.id, navn: s.name ?? "Uten navn" })), nesteTestdag };
}
