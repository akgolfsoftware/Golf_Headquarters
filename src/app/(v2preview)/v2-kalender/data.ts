/**
 * v2-kalender — server-loader. Gjenbruker auth-mønsteret (requirePortalUser) og
 * Aar-logikken (seasonPlan.periodBlocks + tournamentEntry) fra den EKTE siden
 * src/app/portal/kalender/page.tsx, og UTVIDER med ekte økt-spørringer
 * (trainingSessionV2) slik at Dag/Uke/Maaned-visningene får reelle data —
 * den ekte kalender-siden laster i dag KUN årsdata (meldt i gaps).
 *
 * Server-only. Ingen fabrikkerte tall: der data mangler bygges ærlig tom-tilstand
 * i skjermkomponenten.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { PyramidArea, PracticeType } from "@/generated/prisma/client";
import { translateMiljo } from "@/lib/portal/translate-taxonomy";
import { lesPeriodeType } from "@/app/admin/kalender/lib/periode-helpers";
import type { PeriodeType } from "@/generated/prisma/client";
import type { AkseKey } from "@/lib/v2/tokens";

// PracticeType → pyramide-akse (samme kanon som portal/actions.ts).
const PRACTICE_TO_PYRAMID: Record<PracticeType, PyramidArea> = {
  BLOKK: "TEK",
  RANDOM: "SLAG",
  KONKURRANSE: "TURN",
  SPILL_TEST: "SPILL",
};

// Periode-type → akse for Aar-båndene. Display-mapping (en periode er ikke en
// akse, men mockupen merker hvert bånd med en aksefarge). Meldt i gaps.
const PERIODE_TO_AKSE: Record<PeriodeType, AkseKey> = {
  GRUNN: "FYS",
  SPESIALISERING: "TEK",
  TURNERING: "TURN",
  EVALUERING: "SPILL",
  FERIE: "FYS",
};

const PERIODE_NAVN: Record<PeriodeType, string> = {
  GRUNN: "Grunnperiode",
  SPESIALISERING: "Spesialisering",
  TURNERING: "Konkurranse",
  EVALUERING: "Evaluering",
  FERIE: "Hvile",
};

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"] as const;
const MND_LANG = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
] as const;
const UKEDAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;
const UKEDAG_LANG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"] as const;

// ── Datotidshjelpere (server-lokal, som portal/actions.ts) ────────────────────
function startOfDay(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}
function startOfWeek(d: Date): Date {
  const s = startOfDay(d);
  const day = (s.getDay() + 6) % 7; // mandag = 0
  s.setDate(s.getDate() - day);
  return s;
}
function ukenummer(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604_800_000);
}
function toHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function timerTekst(min: number): string {
  const t = min / 60;
  const rundet = Math.round(t * 10) / 10;
  return `${rundet.toFixed(1).replace(".", ",")} t`;
}

// ── Typer (datakontrakt til KalenderV2) ───────────────────────────────────────
export type KalenderOkt = {
  id: string;
  kl: string;        // "16:00"
  slutt: string;     // "17:30"
  startTime: number; // start-time i timer (int) for tids-akse
  title: string;
  sted: string | null;
  a: AkseKey;
  naa: boolean;      // IN_PROGRESS
  done: boolean;     // COMPLETED
};

export type PeriodeBaand = {
  navn: string;
  mnd: string;       // "nov–jan"
  a: AkseKey;
  pct: number;       // 0–100 (tid forløpt)
  tone: "ok" | "naa" | null;
};

export type KalenderData = {
  spillerNavn: string;
  avatarUrl: string | null;
  ukeLabel: string;  // "Uke 26 · 23.–29. juni"

  dag: {
    label: string;       // "Onsdag 25. juni"
    totalLabel: string;  // "2 økter · 2,5 t"
    fraTime: number;
    tilTime: number;
    okter: KalenderOkt[];
  };

  uke: {
    dager: { d: string; dayNum: number; isToday: boolean; okter: KalenderOkt[] }[];
  };

  maaned: {
    label: string;        // "Juni 2026"
    totalLabel: string;   // "18 økter · 26,5 t"
    daysInMonth: number;
    ledendeTomme: number; // antall tomme celler før dag 1 (mandag-først)
    today: number | null; // dag-i-måned hvis inneværende måned
    perDag: Record<number, AkseKey[]>;
  };

  aar: {
    harData: boolean;
    subtitle: string;         // "Sesong 2026" (+ neste turnering)
    aktivPeriodeLabel: string | null;
    perioder: PeriodeBaand[];
    kpis: {
      ukerTil: string;        // uker til neste turnering, "–" om ingen
      turneringerIgjen: number;
      treningstimer: number;  // fullførte timer i år (heltall)
      gjennomforing: string | null; // % fullført av forfalte økter, null om ingen
    };
  };
};

// ── Loader ────────────────────────────────────────────────────────────────────
export async function hentKalenderData(
  spillerId: string,
  spillerNavn: string,
  avatarUrl: string | null,
): Promise<KalenderData> {
  const naa = new Date();
  const aar = naa.getFullYear();
  const aarStart = new Date(aar, 0, 1);
  const aarSlutt = new Date(aar, 11, 31, 23, 59, 59, 999);
  const dagStart = startOfDay(naa);
  const ukeStart = startOfWeek(naa);
  const mndIdx = naa.getMonth();

  const [okter, sesongplan, turneringer] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: { studentId: spillerId, startTime: { gte: aarStart, lte: aarSlutt } },
      orderBy: { startTime: "asc" },
      select: { id: true, title: true, startTime: true, endTime: true, status: true, practiceType: true, miljo: true },
    }),
    prisma.seasonPlan.findFirst({
      where: { userId: spillerId, year: aar },
      include: { periodBlocks: { orderBy: { startDate: "asc" } } },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId: spillerId,
        OR: [
          { tournament: { startDate: { gte: aarStart, lte: aarSlutt } } },
          { manualDate: { gte: aarStart, lte: aarSlutt } },
        ],
      },
      include: { tournament: { select: { name: true, startDate: true } } },
      take: 30,
    }),
  ]);

  const tilOkt = (s: (typeof okter)[number]): KalenderOkt => ({
    id: s.id,
    kl: toHHMM(s.startTime),
    slutt: toHHMM(s.endTime),
    startTime: s.startTime.getHours(),
    title: s.title,
    sted: s.miljo ? translateMiljo(s.miljo) : null,
    a: PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK",
    naa: s.status === "IN_PROGRESS",
    done: s.status === "COMPLETED",
  });

  // ── Dag ──────────────────────────────────────────────
  const dagStartMs = dagStart.getTime();
  const dagSluttMs = dagStartMs + 86_400_000;
  const dagOkter = okter.filter((s) => s.startTime.getTime() >= dagStartMs && s.startTime.getTime() < dagSluttMs).map(tilOkt);
  let fraTime = 8, tilTime = 20;
  if (dagOkter.length) {
    fraTime = Math.max(6, Math.min(...dagOkter.map((o) => o.startTime)));
    tilTime = Math.min(23, Math.max(...dagOkter.map((o) => Number(o.slutt.slice(0, 2)) + (Number(o.slutt.slice(3)) > 0 ? 1 : 0))));
    if (tilTime <= fraTime) tilTime = fraTime + 1;
  }
  const dagMin = dagOkter.reduce((sum, o) => {
    const s = okter.find((x) => x.id === o.id)!;
    return sum + Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000));
  }, 0);
  const dagLabel = `${UKEDAG_LANG[(naa.getDay() + 6) % 7]} ${naa.getDate()}. ${MND_LANG[mndIdx]}`;
  const dagTotal = dagOkter.length ? `${dagOkter.length} ${dagOkter.length === 1 ? "økt" : "økter"} · ${timerTekst(dagMin)}` : "Ingen økter";

  // ── Uke ──────────────────────────────────────────────
  const ukeDager = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ukeStart);
    d.setDate(d.getDate() + i);
    const dMs = startOfDay(d).getTime();
    const dagsOkter = okter.filter((s) => {
      const t = s.startTime.getTime();
      return t >= dMs && t < dMs + 86_400_000;
    }).map(tilOkt);
    return {
      d: `${UKEDAG_KORT[i]} ${d.getDate()}`,
      dayNum: d.getDate(),
      isToday: startOfDay(d).getTime() === dagStartMs,
      okter: dagsOkter,
    };
  });

  // ── Maaned ───────────────────────────────────────────
  const daysInMonth = new Date(aar, mndIdx + 1, 0).getDate();
  const ledendeTomme = (new Date(aar, mndIdx, 1).getDay() + 6) % 7; // mandag-først
  const perDag: Record<number, AkseKey[]> = {};
  let mndOktAntall = 0, mndMin = 0;
  for (const s of okter) {
    if (s.startTime.getMonth() !== mndIdx || s.startTime.getFullYear() !== aar) continue;
    const dag = s.startTime.getDate();
    const a = PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK";
    (perDag[dag] ??= []).push(a);
    mndOktAntall++;
    mndMin += Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000));
  }
  const mndTotal = mndOktAntall ? `${mndOktAntall} ${mndOktAntall === 1 ? "økt" : "økter"} · ${timerTekst(mndMin)}` : "Ingen økter";

  // ── Aar (periodisering + turneringer) ────────────────
  const perioder: PeriodeBaand[] = (sesongplan?.periodBlocks ?? []).map((blokk) => {
    const type = lesPeriodeType(blokk);
    const start = blokk.startDate, slutt = blokk.endDate;
    const total = slutt.getTime() - start.getTime();
    const forlopt = naa.getTime() - start.getTime();
    const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((forlopt / total) * 100))) : 0;
    const aktiv = naa >= start && naa <= slutt;
    const forbi = naa > slutt;
    return {
      navn: blokk.focus?.trim() || PERIODE_NAVN[type],
      mnd: `${MND_KORT[start.getMonth()]}–${MND_KORT[slutt.getMonth()]}`,
      a: PERIODE_TO_AKSE[type],
      pct,
      tone: aktiv ? "naa" : forbi ? "ok" : null,
    };
  });
  const aktivPeriode = (sesongplan?.periodBlocks ?? []).find((b) => naa >= b.startDate && naa <= b.endDate);
  const aktivPeriodeLabel = aktivPeriode
    ? (aktivPeriode.focus?.trim() || PERIODE_NAVN[lesPeriodeType(aktivPeriode)])
    : null;

  // Framtidige turneringer (sortert), for KPIer + subtitle
  const framtidige = turneringer
    .map((e) => ({ e, dato: e.tournament?.startDate ?? e.manualDate }))
    .filter((x): x is { e: (typeof turneringer)[number]; dato: Date } => !!x.dato && x.dato >= dagStart)
    .sort((a, b) => a.dato.getTime() - b.dato.getTime());
  const neste = framtidige[0];
  const ukerTil = neste
    ? String(Math.max(0, Math.ceil((neste.dato.getTime() - naa.getTime()) / 604_800_000)))
    : "–";
  const nesteNavn = neste?.e.tournament?.name ?? neste?.e.manualName ?? null;

  // Treningstimer i år (fullførte økter)
  const fullforteMin = okter
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000)), 0);
  const treningstimer = Math.round(fullforteMin / 60);

  // Gjennomføring: fullførte / forfalte (start <= nå, ikke avlyst) i år
  const forfalte = okter.filter((s) => s.startTime <= naa && s.status !== "CANCELLED");
  const fullforteAntall = forfalte.filter((s) => s.status === "COMPLETED").length;
  const gjennomforing = forfalte.length > 0 ? `${Math.round((fullforteAntall / forfalte.length) * 100)} %` : null;

  const harAarData = perioder.length > 0 || turneringer.length > 0;
  const subtitle = nesteNavn ? `Sesong ${aar} · mot ${nesteNavn}` : `Sesong ${aar}`;

  // Uke-label «Uke 26 · 23.–29. juni»
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 6);
  const sammeMnd = ukeStart.getMonth() === ukeSlutt.getMonth();
  const ukeLabel = `Uke ${ukenummer(naa)} · ${ukeStart.getDate()}.${sammeMnd ? "" : " " + MND_LANG[ukeStart.getMonth()]}–${ukeSlutt.getDate()}. ${MND_LANG[ukeSlutt.getMonth()]}`;

  return {
    spillerNavn,
    avatarUrl,
    ukeLabel,
    dag: { label: dagLabel, totalLabel: dagTotal, fraTime, tilTime, okter: dagOkter },
    uke: { dager: ukeDager },
    maaned: {
      label: `${MND_LANG[mndIdx].charAt(0).toUpperCase()}${MND_LANG[mndIdx].slice(1)} ${aar}`,
      totalLabel: mndTotal,
      daysInMonth,
      ledendeTomme,
      today: naa.getDate(),
      perDag,
    },
    aar: {
      harData: harAarData,
      subtitle,
      aktivPeriodeLabel,
      perioder,
      kpis: { ukerTil, turneringerIgjen: framtidige.length, treningstimer, gjennomforing },
    },
  };
}
