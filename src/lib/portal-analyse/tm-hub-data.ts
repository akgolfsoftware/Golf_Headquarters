/**
 * TM-04 Analyse-hub — Broadie-SG og TrackMan side om side, aldri blandet
 * i samme tall. Mangler data → ærlig tom, aldri fabrikk.
 */
import { prisma } from "@/lib/prisma";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { fmtSg, SG_KLARSPRAK } from "@/lib/min-golf/format";
import {
  computeTrackManDispersionMap,
  generateCaddieSentence,
  type DispersionMapResult,
} from "@/lib/trackman/dispersion-map";

export type SgAkseVisning = {
  id: "OTT" | "APP" | "ARG" | "PUTT";
  etikett: string;
  tekst: string;
  verdi: number | null;
};

export type TmHubDypere = { href: string; tittel: string; meta: string };

export type TmHubData = {
  dagLabel: string;
  /** I-vindu i dag. Null = ingen logg, vis tom setning. Aldri fabrikk. */
  vindu: { i: number; av: number } | null;
  lekkasje: { setning: string; meta: string } | null;
  lekkasjeLinje: string | null;
  sgAkser: SgAkseVisning[];
  dypere: TmHubDypere[];
  trackman: {
    sessionId: string;
    klubb: string;
    datoKort: string;
    setning: string;
    meta: string;
    kpis: string;
    punkter: { cx: number; cy: number; siste: boolean }[];
    ellipse: { cx: number; cy: number; rx: number; ry: number } | null;
  } | null;
};

const AKSE: { id: SgAkseVisning["id"]; etikett: string }[] = [
  { id: "OTT", etikett: "Tee" },
  { id: "APP", etikett: "Innspill" },
  { id: "ARG", etikett: "Rundt" },
  { id: "PUTT", etikett: "Putt" },
];

function dagLabel(d: Date): string {
  const t = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export async function hentAnalyseHub(userId: string): Promise<TmHubData> {
  const na = new Date();
  const oslo = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(na);
  const [aar, maned] = oslo.split("-").map(Number);
  const manedStart = new Date(Date.UTC(aar, (maned ?? 1) - 1, 1));

  const minGolf = await loadMinGolf(userId);
  const [runderIManed, tmAntall] = await Promise.all([
    prisma.round.count({ where: { userId, playedAt: { gte: manedStart } } }),
    prisma.trackManSession.count({ where: { userId } }),
  ]);
  const kat = minGolf.sgStatus.kategorier;
  const sgAkser: SgAkseVisning[] = AKSE.map((a) => {
    const funnet = kat.find((k) => k.akse === a.id);
    return {
      id: a.id,
      etikett: a.etikett,
      tekst: funnet ? fmtSg(funnet.sg) : "—",
      verdi: funnet?.sg ?? null,
    };
  });

  const lekkasje = minGolf.nesteFokus
    ? {
        setning: `${SG_KLARSPRAK[minGolf.nesteFokus.akse]} ${minGolf.nesteFokus.sgTap} er lekkasjen.`,
        meta: `SG siste runder · ${minGolf.nesteFokus.grunnlag}`,
      }
    : null;

  const sesjon = await prisma.trackManSession.findFirst({
    where: { userId },
    orderBy: { recordedAt: "desc" },
  });

  let trackman: TmHubData["trackman"] = null;
  if (sesjon) {
    const shots = await prisma.trackManShot.findMany({
      where: { sessionId: sesjon.id },
      orderBy: { shotNumber: "asc" },
      select: {
        id: true,
        shotNumber: true,
        club: true,
        side: true,
        carryDistance: true,
        totalDistance: true,
        smashFactor: true,
        launchAngle: true,
      },
    });
    type Slag = {
      id: string;
      shotNumber: number;
      club: string;
      side: number | null;
      carryDistance: number | null;
      totalDistance: number | null;
      smashFactor: number | null;
      launchAngle: number | null;
    };
    const slag: Slag[] = shots;
    if (slag.length > 0) {
      const per = new Map<string, Slag[]>();
      for (const s of slag) {
        if (s.side == null || s.carryDistance == null) continue;
        per.set(s.club, [...(per.get(s.club) ?? []), s]);
      }
      let klubb = slag[0].club;
      let flest = -1;
      for (const [k, liste] of per) {
        if (liste.length > flest) {
          flest = liste.length;
          klubb = k;
        }
      }
      const egne = slag.filter((s) => s.club === klubb);
      const map: DispersionMapResult = computeTrackManDispersionMap(egne);
      const setning =
        map.caddieSentence ??
        generateCaddieSentence(map.offlineBias, map.n) ??
        `${map.n} slag registrert${map.medianCarry != null ? ` · ${Math.round(map.medianCarry)} m` : ""}.`;
      const sides = egne.map((s) => s.side).filter((v): v is number => v != null);
      const carries = egne.map((s) => s.carryDistance).filter((v): v is number => v != null);
      const maxSide = Math.max(15, ...sides.map((v) => Math.abs(v)), 1);
      const minC = Math.min(...carries, 130);
      const maxC = Math.max(...carries, 170);
      const spanC = Math.max(20, maxC - minC);
      const punkter = egne
        .filter((s) => s.side != null && s.carryDistance != null)
        .map((s, i, alle) => ({
          cx: 120 + ((s.side ?? 0) / maxSide) * 90,
          cy: 150 - (((s.carryDistance ?? 0) - minC) / spanC) * 130,
          siste: i === alle.length - 1,
        }));
      const ellipse =
        map.oneSigmaEllipse && map.hasEllipse
          ? {
              cx: 120 + (map.oneSigmaEllipse.centerLateral / maxSide) * 90,
              cy: 150 - (((map.meanCarry ?? minC) - minC) / spanC) * 130,
              rx: Math.max(8, (map.oneSigmaEllipse.semiMinor / maxSide) * 90),
              ry: Math.max(6, (map.oneSigmaEllipse.semiMajor / spanC) * 130),
            }
          : null;
      const datoKort = sesjon.recordedAt.toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "Europe/Oslo",
      });
      const kpis = [
        map.medianCarry != null ? `Median ${Math.round(map.medianCarry)} m` : null,
        map.meanSmash != null ? `smash ${map.meanSmash.toFixed(2).replace(".", ",")}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      const bias =
        map.offlineBias != null
          ? `Klynge ${map.offlineBias > 0 ? "høyre" : "venstre"} · ${map.offlineBias > 0 ? "+" : ""}${map.offlineBias.toFixed(1).replace(".", ",")} m · ${map.n} slag`
          : `${map.n} slag`;
      trackman = {
        sessionId: sesjon.id,
        klubb,
        datoKort,
        setning,
        meta: bias,
        kpis,
        punkter,
        ellipse,
      };
    }
  }

  const manedsnavn = new Intl.DateTimeFormat("nb-NO", { month: "long", timeZone: "Europe/Oslo" }).format(na);

  return {
    dagLabel: dagLabel(na),
    vindu: null,
    lekkasje,
    lekkasjeLinje: minGolf.nesteFokus
      ? `Lekkasje: ${SG_KLARSPRAK[minGolf.nesteFokus.akse]}`
      : null,
    sgAkser,
    dypere: [
      {
        href: "/portal/analysere/historikk",
        tittel: "Runder",
        meta: runderIManed > 0 ? `${runderIManed} i ${manedsnavn}` : "Ingen i denne måneden",
      },
      {
        href: "/portal/analysere/trackman",
        tittel: "TrackMan",
        meta: tmAntall === 0 ? "Ingen økter" : `${tmAntall} ${tmAntall === 1 ? "økt" : "økter"}`,
      },
      {
        href: "/portal/tren/tester",
        tittel: "Tester",
        meta: "TN-batteriet",
      },
    ],
    trackman,
  };
}
