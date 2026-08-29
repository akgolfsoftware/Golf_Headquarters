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
import { holeMapProjection, holeMapVariantFor, type HoleMapVariant } from "@/components/trackman/HoleMap";

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
    variant: HoleMapVariant;
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
      // TM-09a/b/f «Analyse mini»: samme projeksjon (hullkart-anker, "mini"
      // størrelse 240×120) som hero-kartet i TrackManSessionDetail — ikke en
      // egen skala-regel for kortet.
      const variant = holeMapVariantFor(klubb);
      const ellipseReach = map.hasEllipse && map.oneSigmaEllipse ? Math.max(map.oneSigmaEllipse.semiMajor, map.oneSigmaEllipse.semiMinor) : 0;
      const { toX, toY } = holeMapProjection(map.shots.map((s) => s.point), ellipseReach, variant, "mini");
      const punkter = map.shots.map((s, i, alle) => ({
        cx: toX(s.point.lateral),
        cy: toY(s.point.distance),
        siste: i === alle.length - 1,
      }));
      const ellipse =
        map.oneSigmaEllipse && map.hasEllipse
          ? {
              cx: toX(map.oneSigmaEllipse.centerLateral),
              cy: toY(map.oneSigmaEllipse.centerDistance),
              rx: map.oneSigmaEllipse.semiMinor * (toX(1) - toX(0)),
              ry: map.oneSigmaEllipse.semiMajor * (toY(0) - toY(1)),
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
        variant,
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
        /* PH-10→PH-11: «Runder» går til runde-listen, ikke samle-historikken. */
        href: "/portal/mal/runder",
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
