/**
 * Data-loader for PlayerHQ Hjem (/portal) — "Spotify Now Playing for trening".
 *
 * Samler all server-side henting for hjem-skjermen til én typet `HjemData`.
 * Alt kommer fra ekte Prisma. Mangler data → null/tom liste → tomstate i UI.
 * ALDRI falske tall.
 *
 * Mønster lånt fra src/app/portal/page.tsx (workbench v1) + profil-data.ts.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { getWeekProgress } from "@/components/portal/workbench/get-week-progress";
import { getCaddieInsights } from "@/lib/ai/get-workbench-insights";
import type { AiInsight } from "@/components/portal/workbench/ai-insights-row";
import type { PyramidRow } from "@/components/athletic";

export type HjemUser = {
  fornavn: string;
  initialer: string;
  tier: string;
  hcp: number | null;
  homeClub: string | null;
  avatarUrl: string | null;
};

/** Dagens økt — det "som spiller nå" i Spotify-metaforen. */
export type DagensOkt = {
  id: string;
  tittel: string;
  /** "11:00 — 12:00" */
  tidsrom: string;
  /** "60 min · 4 drills · GFGK" */
  meta: string;
  pyramide: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  href: string;
};

export type KpiCelle = {
  label: string;
  value: string;
  trend?: { value: string; tone: "positive" | "negative" | "neutral" };
};

export type NesteTee = {
  /** "FRE" */
  dagKort: string;
  /** "30" */
  datoTall: string;
  navn: string;
  sted: string;
  /** "om 4 dager" */
  naar: string;
  href: string;
};

export type HjemData = {
  user: HjemUser;
  /** "ONS 28. MAI · UKE 22" */
  datoEyebrow: string;
  /** Display-headline med italic-aksent, f.eks "Innspill er der det skjer i dag." */
  headlineNormal: string;
  headlineAksent: string | null;
  /** "SRIXON #2 OM 12 DAGER · 2 ØKTER BAK PLAN" — null hvis ingenting å vise */
  metaLinje: string | null;
  heroImageId: number;
  dagensOkt: DagensOkt | null;
  /** 4 SG-baserte KPI-celler. Tom hvis ingen runder/SG-input. */
  kpi: KpiCelle[];
  /** Pyramide-vekting siste 7 dager. Tom hvis ingen økter. */
  pyramide: PyramidRow[];
  /** Endring i pyramide-balanse, f.eks "Balansert mot ideell fordeling". */
  pyramideNote: string | null;
  nesteTee: NesteTee | null;
  innsikt: AiInsight | null;
};

const PRACTICE_TO_PYRAMID: Record<
  string,
  "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"
> = {
  BLOKK: "TEK",
  RANDOM: "SLAG",
  KONKURRANSE: "TURN",
  SPILL_TEST: "SPILL",
};

const PYRAMID_LABEL: Record<string, string> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

const PYRAMID_TONE: Record<
  string,
  "pyr-fys" | "pyr-tek" | "pyr-slag" | "pyr-spill" | "pyr-turn"
> = {
  fys: "pyr-fys",
  tek: "pyr-tek",
  slag: "pyr-slag",
  spill: "pyr-spill",
  turn: "pyr-turn",
};

const UKEDAG_KORT = ["SØN", "MAN", "TIR", "ONS", "TOR", "FRE", "LØR"];
const MND_KORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAI",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DES",
];

function ukenummer(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604_800_000);
}

function tid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function initialerAv(navn: string): string {
  return (
    navn
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** Antall hele dager fra nå til en framtidig dato (>= 0). */
function dagerTil(dato: Date): number {
  const naa = new Date();
  naa.setHours(0, 0, 0, 0);
  const mal = new Date(dato);
  mal.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((mal.getTime() - naa.getTime()) / 86_400_000));
}

function naarTekst(dager: number): string {
  if (dager === 0) return "I dag";
  if (dager === 1) return "I morgen";
  return `Om ${dager} dager`;
}

function sgKpi(
  label: string,
  verdi: number | null | undefined,
): KpiCelle {
  if (verdi == null) return { label, value: "—" };
  const fmt = verdi.toLocaleString("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  });
  return {
    label,
    value: fmt,
    trend: {
      value: verdi >= 0 ? "Over baseline" : "Under baseline",
      tone: verdi >= 0 ? "positive" : "negative",
    },
  };
}

export async function getHjemData(userId: string): Promise<HjemData> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      tier: true,
      hcp: true,
      homeClub: true,
      avatarUrl: true,
    },
  });

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // --- Dagens økt (nåværende/neste i dag) ---
  const dagensOkter = await prisma.trainingSessionV2
    .findMany({
      where: { studentId: userId, startTime: { gte: startOfDay, lt: endOfDay } },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        practiceType: true,
        miljo: true,
        _count: { select: { drills: true } },
      },
      take: 10,
    })
    .catch(() => []);

  const valgtOkt =
    dagensOkter.find((o) => o.endTime > now) ?? dagensOkter[0] ?? null;

  const dagensOkt: DagensOkt | null = valgtOkt
    ? {
        id: valgtOkt.id,
        tittel: valgtOkt.title,
        tidsrom: `${tid(valgtOkt.startTime)} — ${tid(valgtOkt.endTime)}`,
        meta: [
          `${Math.max(
            0,
            Math.round(
              (valgtOkt.endTime.getTime() - valgtOkt.startTime.getTime()) /
                60_000,
            ),
          )} min`,
          `${valgtOkt._count.drills} drill${valgtOkt._count.drills === 1 ? "" : "s"}`,
          user.homeClub ?? "Egen økt",
        ].join(" · "),
        pyramide: PRACTICE_TO_PYRAMID[valgtOkt.practiceType] ?? "TEK",
        href: `/portal/gjennomfore/${valgtOkt.id}`,
      }
    : null;

  // --- SG-KPI: prøv siste BrukerSgInput, fall tilbake til snitt av runder ---
  const sisteSg = await prisma.brukerSgInput
    .findFirst({
      where: { userId },
      orderBy: { dato: "desc" },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    })
    .catch(() => null);

  let sgKilde = sisteSg;
  if (
    !sgKilde ||
    (sgKilde.sgOtt == null &&
      sgKilde.sgApp == null &&
      sgKilde.sgArg == null &&
      sgKilde.sgPutt == null)
  ) {
    const agg = await prisma.round
      .aggregate({
        where: { userId },
        _avg: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      })
      .catch(() => null);
    sgKilde = agg?._avg ?? null;
  }

  const kpi: KpiCelle[] = sgKilde
    ? [
        sgKpi("SG Innspill", sgKilde.sgApp),
        sgKpi("SG Driver", sgKilde.sgOtt),
        sgKpi("SG Nærspill", sgKilde.sgArg),
        sgKpi("SG Putt", sgKilde.sgPutt),
      ]
    : [];

  // Hvis alle fire er "—" → behandle som tomt (ingen ekte KPI ennå).
  const harKpi = kpi.some((k) => k.value !== "—");

  // --- Pyramide-vekting siste 7 dager ---
  const ukens = await getWeekProgress(userId).catch(() => null);
  const REKKEFOLGE = ["turn", "spill", "slag", "tek", "fys"] as const;
  const pyramide: PyramidRow[] =
    ukens && ukens.ukens_stats.okter > 0
      ? REKKEFOLGE.map((k) => {
          const andel = ukens.fordeling.actual[k];
          return {
            label: PYRAMID_LABEL[k],
            fillPercent: Math.round(andel * 100),
            value: `${Math.round(andel * 100)} %`,
            tone: PYRAMID_TONE[k],
          };
        })
      : [];

  const pyramideNote =
    pyramide.length > 0
      ? `${ukens?.ukens_stats.okter} økt${ukens?.ukens_stats.okter === 1 ? "" : "er"} siste 7 dager`
      : null;

  // --- Neste tee (framtidig turnering) ---
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  const upcoming = await prisma.tournamentEntry
    .findFirst({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
        OR: [
          { tournament: { startDate: { gte: todayMidnight } } },
          { manualDate: { gte: todayMidnight } },
        ],
      },
      include: { tournament: true },
      orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
    })
    .catch(() => null);

  const teeDato = upcoming?.tournament?.startDate ?? upcoming?.manualDate ?? null;
  const nesteTee: NesteTee | null =
    upcoming && teeDato
      ? {
          dagKort: UKEDAG_KORT[teeDato.getDay()],
          datoTall: String(teeDato.getDate()),
          navn:
            upcoming.tournament?.name ?? upcoming.manualName ?? "Turnering",
          sted:
            upcoming.tournament?.location ??
            upcoming.tournament?.country ??
            upcoming.category ??
            "Sted ikke satt",
          naar: naarTekst(dagerTil(teeDato)),
          href: "/portal/kalender",
        }
      : null;

  // --- AI-innsikt (topp 1) ---
  const insights = await getCaddieInsights(userId).catch(() => []);
  const innsikt = insights[0] ?? null;

  // --- Hero-tekst ---
  const fornavn = user.name.trim().split(/\s+/)[0] || "spiller";
  const time = now.getHours();
  const hilsen =
    time < 5
      ? "God natt"
      : time < 11
        ? "God morgen"
        : time < 17
          ? "Hei"
          : "God kveld";

  const headlineNormal = `${hilsen}, `;
  const headlineAksent = `${fornavn}.`;

  const datoEyebrow = `${UKEDAG_KORT[now.getDay()]} ${now.getDate()}. ${MND_KORT[now.getMonth()]} · UKE ${ukenummer(now)}`;

  // Meta-linje: neste tee-nedtelling + plan-status hvis tilgjengelig.
  const metaDeler: string[] = [];
  if (nesteTee && teeDato) {
    const d = dagerTil(teeDato);
    metaDeler.push(
      `${nesteTee.navn.toUpperCase()} OM ${d} DAG${d === 1 ? "" : "ER"}`,
    );
  }
  if (ukens && ukens.ukens_stats.okter > 0) {
    metaDeler.push(
      `${ukens.ukens_stats.okter} ØKT${ukens.ukens_stats.okter === 1 ? "" : "ER"} SISTE UKE`,
    );
  }
  const metaLinje = metaDeler.length > 0 ? metaDeler.join(" · ") : null;

  // Hero-bilde: stabilt per bruker (deterministisk fra navn-lengde).
  const heroImageId = ((user.name.length * 7) % 30) + 1;

  return {
    user: {
      fornavn,
      initialer: initialerAv(user.name),
      tier: user.tier,
      hcp: user.hcp,
      homeClub: user.homeClub,
      avatarUrl: user.avatarUrl,
    },
    datoEyebrow,
    headlineNormal,
    headlineAksent,
    metaLinje,
    heroImageId,
    dagensOkt,
    kpi: harKpi ? kpi : [],
    pyramide,
    pyramideNote,
    nesteTee,
    innsikt,
  };
}
