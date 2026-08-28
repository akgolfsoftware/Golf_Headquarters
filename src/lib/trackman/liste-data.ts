/**
 * TM-01 TrackMan-liste — én rad per økt med median carry og smash.
 * Aldri fabrikkert. Mangler tall → «—».
 */
import { prisma } from "@/lib/prisma";
import { computeTrackManDispersionMap } from "@/lib/trackman/dispersion-map";
import { ENVIRONMENT_LABELS } from "@/lib/sg-hub/environment-labels";

export type TrackManListeRad = {
  id: string;
  klubb: string;
  slag: number;
  datoKort: string;
  undertekst: string;
  carryTekst: string;
  smashTekst: string;
};

export type TrackManListeData = {
  rader: TrackManListeRad[];
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!;
}

function komma(n: number, d: number): string {
  return n.toFixed(d).replace(".", ",");
}

function primarKlubb(shots: { club: string }[]): string {
  const ant = new Map<string, number>();
  for (const s of shots) ant.set(s.club, (ant.get(s.club) ?? 0) + 1);
  let best = shots[0]?.club ?? "—";
  let n = -1;
  for (const [k, v] of ant) {
    if (v > n) {
      n = v;
      best = k;
    }
  }
  return best;
}

export async function hentTrackManListe(userId: string): Promise<TrackManListeData> {
  const okter = await prisma.trackManSession.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: 40,
    select: {
      id: true,
      recordedAt: true,
      shotCount: true,
      environment: true,
      shots: {
        select: {
          club: true,
          carryDistance: true,
          smashFactor: true,
          side: true,
          shotNumber: true,
          id: true,
          totalDistance: true,
          launchAngle: true,
        },
      },
    },
  });

  const rader: TrackManListeRad[] = okter.map((o) => {
    const klubb = primarKlubb(o.shots);
    const egne = o.shots.filter((s) => s.club === klubb);
    const map = computeTrackManDispersionMap(
      egne.map((s) => ({
        id: s.id,
        shotNumber: s.shotNumber,
        club: s.club,
        side: s.side,
        carryDistance: s.carryDistance,
        totalDistance: s.totalDistance,
        smashFactor: s.smashFactor,
        launchAngle: s.launchAngle,
      })),
    );
    const smash = median(egne.map((s) => s.smashFactor).filter((v): v is number => v != null));
    const datoKort = o.recordedAt.toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "Europe/Oslo",
    });
    return {
      id: o.id,
      klubb,
      slag: o.shotCount || o.shots.length,
      datoKort,
      undertekst: o.environment ? `${datoKort} · ${ENVIRONMENT_LABELS[o.environment]}` : datoKort,
      carryTekst: map.medianCarry != null ? `${Math.round(map.medianCarry)} m` : "—",
      smashTekst: smash != null ? `smash ${komma(smash, 2)}` : "—",
    };
  });

  return { rader };
}
