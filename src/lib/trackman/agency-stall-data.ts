/**
 * TM-06 Agency TrackMan — stalldata (T9, 27.08.2026).
 *
 * Gjenbruker `computeTrackManDispersionMap` (B7, samme funksjon som TM-11)
 * per økt, slik at median/smash/side/spredning på denne listen er nøyaktig
 * de samme tallene spilleren selv ser på øktdetaljen — ingen egen
 * beregning duplisert her. Ingen fabrikerte tall: kølla med flest gyldige
 * slag brukes (samme regel som TM-11), og «spredning» vises «—» under
 * MIN_SHOTS_FOR_ELLIPSE (8 slag).
 *
 * Fasitens rikere kilde-variasjon (testdata/csv/pdf/foto) er IKKE
 * gjenskapt — `TrackManSession.source` har kun to reelle verdier
 * (csv-import/api) i skjemaet i dag. Se docs/natt/T9-DONE.md.
 */

import { prisma } from "@/lib/prisma";
import { computeTrackManDispersionMap, type DispersionMapResult } from "@/lib/trackman/dispersion-map";

export const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "CSV",
  api: "API",
};

export const ENV_LABEL: Record<string, string> = {
  SIMULATOR_INDOOR: "Simulator inne",
  NET_INDOOR: "Nett inne",
  RANGE_OUTDOOR_MAT: "Range matte",
  RANGE_OUTDOOR_GRASS: "Range gress",
  COURSE_PRACTICE: "Bane trening",
  COURSE_COMPETITION: "Bane konkurranse",
};

export type StallRad = {
  sessionId: string;
  spillerId: string;
  spillerNavn: string;
  kolle: string;
  datoLabel: string;
  kildeLabel: string;
  result: DispersionMapResult;
};

export type FeaturedKort = StallRad & {
  caddieSentence: string;
};

export type AgencyTrackmanData = {
  kpis: { label: string; value: string; tint?: boolean }[];
  featured: FeaturedKort[];
  rader: StallRad[];
  antallSpillere: number;
};

function datoLabel(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

/** Kølla med flest gyldige slag (side + carry) — samme regel som TM-11. */
function velgKolle<T extends { club: string; side: number | null; carryDistance: number | null }>(shots: T[]): { kolle: string; shots: T[] } {
  const perKolle = new Map<string, T[]>();
  for (const s of shots) {
    if (s.side == null || s.carryDistance == null) continue;
    perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), s]);
  }
  let valgt = shots[0]?.club ?? "—";
  let flest = -1;
  for (const [kolle, liste] of perKolle) {
    if (liste.length > flest) {
      flest = liste.length;
      valgt = kolle;
    }
  }
  return { kolle: valgt, shots: shots.filter((s) => s.club === valgt) };
}

export async function lastAgencyTrackmanData(): Promise<AgencyTrackmanData> {
  const sessions = await prisma.trackManSession.findMany({
    orderBy: { recordedAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, name: true } } },
  });

  const shots = sessions.length
    ? await prisma.trackManShot.findMany({
        where: { sessionId: { in: sessions.map((s) => s.id) } },
        orderBy: { shotNumber: "asc" },
        select: {
          id: true,
          sessionId: true,
          shotNumber: true,
          club: true,
          side: true,
          carryDistance: true,
          totalDistance: true,
          smashFactor: true,
          launchAngle: true,
        },
      })
    : [];

  const shotsPerSession = new Map<string, typeof shots>();
  for (const s of shots) {
    shotsPerSession.set(s.sessionId, [...(shotsPerSession.get(s.sessionId) ?? []), s]);
  }

  const rader: StallRad[] = sessions.map((s) => {
    const alleShots = shotsPerSession.get(s.id) ?? [];
    const { kolle, shots: kolleShots } = velgKolle(alleShots);
    return {
      sessionId: s.id,
      spillerId: s.user.id,
      spillerNavn: s.user.name ?? "Ukjent spiller",
      kolle,
      datoLabel: datoLabel(s.recordedAt),
      kildeLabel: SOURCE_LABEL[s.source] ?? s.source,
      result: computeTrackManDispersionMap(kolleShots),
    };
  });

  // Featured: nyeste økt per distinkt spiller, maks 4, med caddie-setning.
  const settSpillere = new Set<string>();
  const featured: FeaturedKort[] = [];
  for (const r of rader) {
    if (featured.length >= 4) break;
    if (settSpillere.has(r.spillerId)) continue;
    if (!r.result.caddieSentence) continue;
    settSpillere.add(r.spillerId);
    featured.push({ ...r, caddieSentence: r.result.caddieSentence });
  }

  const trettiSidenMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const siste30d = sessions.filter((s) => s.recordedAt.getTime() >= trettiSidenMs);
  const shots30d = siste30d.reduce((sum, s) => sum + s.shotCount, 0);
  const uniquePlayers = new Set(sessions.map((s) => s.user.id)).size;
  const snittShots = sessions.length === 0 ? 0 : Math.round(sessions.reduce((sum, s) => sum + s.shotCount, 0) / sessions.length);

  return {
    kpis: [
      { label: "Sesjoner · 30d", value: String(siste30d.length), tint: true },
      { label: "Slag · 30d", value: shots30d.toLocaleString("nb-NO") },
      { label: "Snitt slag/økt", value: String(snittShots) },
      { label: "Aktive spillere", value: String(uniquePlayers) },
    ],
    featured,
    rader,
    antallSpillere: uniquePlayers,
  };
}
