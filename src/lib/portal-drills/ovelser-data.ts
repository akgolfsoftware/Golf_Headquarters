/**
 * PlayerHQ pakke 4: henter øvelsesbanken for spilleren (PH-13).
 * Samme tilgangsfilter som resten av øvelsesbanken (drillAccessWhere): AK Golf-banken,
 * coachens delte og private øvelser, og spillerens egne. Ingen syntetiske øvelser.
 */
import { prisma } from "@/lib/prisma";
import { drillAccessWhere, getMyCoachIds } from "./drills-data";
import { ovelseVisning, type OvelseVisning } from "./ovelser-visning";

const FELT = {
  id: true, name: true, description: true, imageUrl: true, pyramidArea: true, skillArea: true,
  omraadeKode: true, motorikk: true, press: true, durationMin: true, environment: true, utstyr: true,
  defaultSets: true, defaultReps: true, defaultRepsSets: true, source: true,
} as const;

const TRETTI_DAGER = 30 * 86_400_000;

/** Distinkte egne økter siste 30 dager per øvelse. */
async function bruktSiste30(userId: string, ider: string[]): Promise<Map<string, number>> {
  if (ider.length === 0) return new Map();
  const rader = await prisma.trainingDrillV2.findMany({
    where: { exerciseId: { in: ider }, session: { studentId: userId, startTime: { gte: new Date(Date.now() - TRETTI_DAGER) } } },
    select: { exerciseId: true, sessionId: true },
  });
  const okter = new Map<string, Set<string>>();
  for (const r of rader) {
    if (!r.exerciseId) continue;
    const s = okter.get(r.exerciseId) ?? new Set<string>();
    s.add(r.sessionId);
    okter.set(r.exerciseId, s);
  }
  return new Map([...okter].map(([id, s]) => [id, s.size]));
}

/** Alle øvelser spilleren har tilgang til. Egne øvelser først, så akse og navn. */
export async function hentOvelser(userId: string): Promise<OvelseVisning[]> {
  const coachIds = await getMyCoachIds(userId);
  const rader = await prisma.exerciseDefinition.findMany({
    where: drillAccessWhere(userId, coachIds),
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    select: FELT,
  });
  const brukt = await bruktSiste30(userId, rader.map((r) => r.id));
  const liste = rader.map((r) => ovelseVisning(r, brukt.get(r.id) ?? 0));
  return [...liste.filter((o) => o.egen), ...liste.filter((o) => !o.egen)];
}

/** Én øvelse, bare hvis spilleren har tilgang til den. */
export async function hentOvelse(userId: string, id: string): Promise<OvelseVisning | null> {
  const coachIds = await getMyCoachIds(userId);
  const rad = await prisma.exerciseDefinition.findFirst({
    where: { AND: [{ id }, drillAccessWhere(userId, coachIds)] },
    select: FELT,
  });
  if (!rad) return null;
  const brukt = await bruktSiste30(userId, [rad.id]);
  return ovelseVisning(rad, brukt.get(rad.id) ?? 0);
}
