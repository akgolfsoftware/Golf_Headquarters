/**
 * Data til Målsetninger og Én målsetning i nytt design. Leser bare ekte data:
 * fremdriften fra beregnGoalProgress, målingene fra runder og testresultater,
 * øktene fra WorkbenchSession. Mangler en verdi, blir den null («—»).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Goal } from "@/generated/prisma/client";
import { beregnGoalProgress, beregnGoalProgressListe, type GoalProgress } from "@/lib/portal/goals/progress";
import { lesSgMaal, SG_OMRADE_NAVN, type SgOmrade } from "@/lib/domain/maal-fremdrift";
import { lesPlanNivaa, losPlanNivaa, PLAN_NIVAA_LABEL } from "@/lib/domain/maal-plannivaa";
import { parseForScoring, type ScoringKind } from "@/lib/portal-tester/test-scoring";
import { erPeiKind, formaterTestVerdi, peiSomProsent } from "@/lib/portal-tester/format-verdi";
import {
  burdeVaert,
  formatTall,
  TEMPO_TEKST,
  tidsandel,
  vurderTempo,
  type MaalAkse,
  type MaalEnNy,
  type MaalKortNy,
  type MaalKurvePunkt,
  type MaalMaling,
  type MaalOktNy,
} from "./maal-ny";

const AKSE_NAVN: Record<string, string> = { FYS: "Fysisk", TEK: "Teknisk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering" };
const SG_FELT: Record<SgOmrade, "sgOtt" | "sgApp" | "sgArg" | "sgPutt"> = { OTT: "sgOtt", APP: "sgApp", ARG: "sgArg", PUTT: "sgPutt" };

function osloDato(d: Date, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", ...opts }).format(d);
}
const datoLang = (d: Date) => osloDato(d, { day: "numeric", month: "long", year: "numeric" });
const datoKort = (d: Date) => osloDato(d, { day: "numeric", month: "short" });
const idagIso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(d);

type TestInfo = { kind: ScoringKind; navn: string };

function akseFor(goal: Goal): { akse: MaalAkse | null; tekst: string | null } {
  if (goal.linkedPyramidArea) {
    return { akse: goal.linkedPyramidArea.toLowerCase() as MaalAkse, tekst: `${goal.linkedPyramidArea} · ${AKSE_NAVN[goal.linkedPyramidArea]}` };
  }
  const sg = goal.type === "SG_AREA" ? lesSgMaal(goal.payload) : null;
  if (sg) return { akse: "slag", tekst: `SLAG · ${SG_OMRADE_NAVN[sg.omrade]}` };
  return { akse: null, tekst: null };
}

/** Verdi i visningsenhet. Testmål: målverdien er allerede i visningsenhet (prosent for PEI). */
function formatVerdi(goal: Goal, verdi: number | null, test: TestInfo | null, erMaalverdi = false): string | null {
  if (verdi == null) return null;
  switch (goal.type) {
    case "HCP_TARGET":
      return formatTall(verdi, 1);
    case "ROUNDS_PER_MONTH":
    case "SESSION_FREQUENCY":
      return formatTall(verdi, 0);
    case "SG_AREA":
      return formatTall(verdi, 2, true);
    case "TEST_SCORE":
      if (!test) return formatTall(verdi, 1);
      if (erMaalverdi && erPeiKind(test.kind)) return `${formatTall(verdi, 2)} %`;
      return formaterTestVerdi({ kind: test.kind, verdi });
    default:
      return formatTall(verdi, 1);
  }
}

function enhetFor(goal: Goal): string {
  if (goal.type === "HCP_TARGET") return "HCP";
  if (goal.type === "ROUNDS_PER_MONTH") return "runder siste 30 dager";
  if (goal.type === "SESSION_FREQUENCY") return "økter siste 7 dager";
  if (goal.type === "SG_AREA") return "slag per runde";
  return "";
}

function kildeFor(goal: Goal, test: TestInfo | null): string | null {
  switch (goal.type) {
    case "HCP_TARGET": return "HCP i profilen din";
    case "ROUNDS_PER_MONTH": return "Registrerte runder siste 30 dager";
    case "SESSION_FREQUENCY": return "Gjennomførte økter siste 7 dager";
    case "SG_AREA": return "Snitt av de 10 siste rundene";
    case "TEST_SCORE": return test ? `Siste resultat i ${test.navn}` : null;
    default: return null;
  }
}

type Kjerne = Omit<MaalKortNy, "kildeTekst"> & { burde: string | null; startTall: number | null };

function kjerne(goal: Goal, progress: GoalProgress, test: TestInfo | null, naa: Date): Kjerne {
  const { nivaa, kilde } = losPlanNivaa(goal.payload, goal.targetDate ? idagIso(goal.targetDate) : null, idagIso(naa));
  const { akse, tekst } = akseFor(goal);
  const startTall = goal.type === "SG_AREA" ? (lesSgMaal(goal.payload)?.start ?? null) : null;
  const andel = startTall != null && goal.targetValue != null
    ? tidsandel(goal.createdAt.getTime(), goal.targetDate?.getTime() ?? null, naa.getTime())
    : null;
  const burdeTall = burdeVaert(startTall, goal.targetValue, andel);
  const burdePst = burdeTall != null && andel != null ? Math.round(andel * 100) : null;
  const pst = progress.hasData ? progress.pct : null;
  const tempo = vurderTempo({ status: progress.status, hasData: progress.hasData, pst, burdePst });
  const burde = formatVerdi(goal, burdeTall, test);

  let statusTekst = progress.detail;
  if (tempo === "nadd") statusTekst = "Målsetningen er nådd.";
  else if (tempo === "bak" && burde) statusTekst = `Bak tidsplanen. I dette tempoet burde du vært på ${burde}.`;
  else if (tempo === "foran" && burdePst != null) statusTekst = `Foran tidsplanen. ${progress.detail}`;

  return {
    id: goal.id,
    navn: goal.title,
    kategori: goal.category as "OUTCOME" | "PROCESS",
    niva: nivaa,
    nivaKilde: kilde,
    fristTekst: goal.targetDate ? `frist ${datoLang(goal.targetDate)}` : "uten frist",
    akse,
    akseTekst: tekst,
    start: formatVerdi(goal, startTall, test),
    naa: formatVerdi(goal, progress.value, test),
    maal: formatVerdi(goal, goal.targetValue, test, true),
    pst,
    burdePst,
    tempo,
    statusTekst,
    burde,
    startTall,
  };
}

async function hentTestInfo(goals: Goal[]): Promise<Map<string, TestInfo>> {
  const ider = [...new Set(goals.map((g) => g.linkedTestId).filter((x): x is string => !!x))];
  if (ider.length === 0) return new Map();
  const tester = await prisma.testDefinition.findMany({ where: { id: { in: ider } }, select: { id: true, name: true, protocol: true } });
  return new Map(tester.map((t) => [t.id, { kind: parseForScoring(t.protocol).kind, navn: t.name }]));
}

/** Kortene på Målsetninger. `aktive` teller i det store tallet; `avsluttede` vises under filteret Avsluttet. */
export async function byggMaalKort(goals: Goal[], hcp: number | null): Promise<MaalKortNy[]> {
  const naa = new Date();
  const [progresser, tester] = await Promise.all([
    beregnGoalProgressListe(goals, { hcp, now: naa }),
    hentTestInfo(goals),
  ]);
  return goals.map((g, i) => {
    const test = g.linkedTestId ? tester.get(g.linkedTestId) ?? null : null;
    const { burde: _b, startTall: _s, ...kort } = kjerne(g, progresser[i], test, naa);
    if (g.status === "ACHIEVED") {
      return { ...kort, tempo: "nadd" as const, statusTekst: g.achievedAt ? `Nådd ${datoLang(g.achievedAt)}.` : "Nådd." , kildeTekst: kildeFor(g, test) };
    }
    if (g.status === "ABANDONED") {
      return { ...kort, statusTekst: `Avsluttet${abandonGrunn(g) ? ` · ${abandonGrunn(g)}` : ""}.`, kildeTekst: kildeFor(g, test) };
    }
    return { ...kort, kildeTekst: kildeFor(g, test) };
  });
}

function abandonGrunn(goal: Goal): string | null {
  const p = goal.payload && typeof goal.payload === "object" && !Array.isArray(goal.payload) ? (goal.payload as Record<string, unknown>) : {};
  return typeof p.abandonReason === "string" && p.abandonReason.trim() ? p.abandonReason.trim() : null;
}

const UKEDAG = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
function oktTid(dato: Date, startMinute: number): string {
  const dag = `${UKEDAG[dato.getUTCDay()]} ${dato.getUTCDate()}. ${new Intl.DateTimeFormat("nb-NO", { month: "short", timeZone: "UTC" }).format(dato)}`;
  const t = `${String(Math.floor(startMinute / 60)).padStart(2, "0")}:${String(startMinute % 60).padStart(2, "0")}`;
  return `${dag} · ${t}`;
}

/** Én målsetning: kjernen pluss målinger, kurve og økter. */
export async function byggMaalEn(goal: Goal, hcp: number | null, erEget: boolean): Promise<MaalEnNy> {
  const naa = new Date();
  const [progress, tester] = await Promise.all([beregnGoalProgress(goal, { hcp, now: naa }), hentTestInfo([goal])]);
  const test = goal.linkedTestId ? tester.get(goal.linkedTestId) ?? null : null;
  const k = kjerne(goal, progress, test, naa);

  let malinger: MaalMaling[] = [];
  let kurve: MaalEnNy["kurve"] = null;
  let malingerTom = "Ingen målinger ennå. Denne målsetningen følger du opp selv.";

  if (goal.type === "SG_AREA") {
    malingerTom = "Ingen målinger ennå. Fremdriften regnes ut når du har registrert en runde slag for slag.";
    const sg = lesSgMaal(goal.payload);
    if (sg) {
      const felt = SG_FELT[sg.omrade];
      const runder = await prisma.round.findMany({
        where: { userId: goal.userId },
        orderBy: { playedAt: "desc" },
        take: 12,
        select: { id: true, playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, course: { select: { name: true } } },
      });
      malinger = runder.slice(0, 3).map((r) => ({
        id: r.id,
        tekst: `Runde, ${r.course.name}`,
        verdi: formatTall(r[felt], 2, true) ?? "—",
        kilde: `${datoKort(r.playedAt)} · ${r[felt] == null ? "bare score, ikke slag for slag" : "slag for slag"}`,
      }));
      const punkter: MaalKurvePunkt[] = runder
        .filter((r) => r[felt] != null)
        .reverse()
        .map((r) => ({ dato: r.playedAt.toISOString(), verdi: r[felt] as number }));
      if (punkter.length >= 2) {
        kurve = {
          punkter,
          tittel: "Utviklingen",
          kilde: `SG ${SG_OMRADE_NAVN[sg.omrade]} per runde · ${punkter.length} runder slag for slag`,
        };
      }
    }
  } else if (goal.type === "TEST_SCORE" && goal.linkedTestId && test) {
    malingerTom = "Ingen målinger ennå. Fremdriften regnes ut når du har gjennomført testen.";
    const resultater = await prisma.testResult.findMany({
      where: { userId: goal.userId, testId: goal.linkedTestId },
      orderBy: { takenAt: "desc" },
      take: 12,
      select: { id: true, takenAt: true, score: true },
    });
    malinger = resultater.slice(0, 3).map((r) => ({
      id: r.id,
      tekst: test.navn,
      verdi: formaterTestVerdi({ kind: test.kind, verdi: r.score }),
      kilde: datoKort(r.takenAt),
    }));
    const punkter = resultater
      .slice()
      .reverse()
      .map((r) => ({ dato: r.takenAt.toISOString(), verdi: erPeiKind(test.kind) ? peiSomProsent(r.score) : r.score }));
    if (punkter.length >= 2) kurve = { punkter, tittel: "Utviklingen", kilde: `${test.navn} · ${punkter.length} gjennomføringer` };
  } else if (goal.type === "HCP_TARGET") {
    malingerTom = "Ingen målinger over tid ennå. HCP lagres bare som dagens tall, ikke som historikk.";
  } else if (goal.type === "ROUNDS_PER_MONTH" || goal.type === "SESSION_FREQUENCY") {
    malingerTom = "Ingen målinger over tid ennå. Fremdriften er antallet i det rullerende vinduet.";
  }

  let okter: MaalEnNy["okter"] = null;
  if (goal.type === "SESSION_FREQUENCY" && goal.linkedPyramidArea) {
    const fra = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth(), naa.getUTCDate() - 7));
    const til = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth(), naa.getUTCDate() + 14));
    const rader = await prisma.workbenchSession.findMany({
      where: {
        playerId: goal.userId,
        pyramid: goal.linkedPyramidArea,
        isTemplate: false,
        hiddenByPlayer: false,
        status: { notIn: ["DRAFT", "CANCELLED"] },
        date: { gte: fra, lte: til },
      },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      take: 4,
      select: { id: true, date: true, startMinute: true, durationMinutes: true, title: true, location: true, pyramid: true },
    });
    const liste: MaalOktNy[] = rader.map((r) => ({
      id: r.id,
      tid: oktTid(r.date, r.startMinute),
      navn: r.title,
      info: [`${r.durationMinutes} min`, ...(r.location ? [r.location] : [])],
      akse: r.pyramid.toLowerCase() as MaalAkse,
    }));
    okter = { liste, kilde: progress.detail };
  }

  const status = (["ACTIVE", "ACHIEVED", "ABANDONED"].includes(goal.status) ? goal.status : "ACTIVE") as MaalEnNy["status"];
  const grunn = abandonGrunn(goal);
  const trendTekst = status === "ACHIEVED" ? "Nådd" : status === "ABANDONED" ? "Avsluttet" : TEMPO_TEKST[k.tempo];

  return {
    id: goal.id,
    navn: goal.title,
    kategori: k.kategori,
    status,
    overlinje: `Målsetning · ${PLAN_NIVAA_LABEL[k.niva]} · ${k.fristTekst}`,
    akse: k.akse,
    akseTekst: k.akseTekst,
    naa: k.naa,
    enhet: enhetFor(goal),
    tempo: status === "ACHIEVED" ? "nadd" : k.tempo,
    trendTekst,
    fremdrift:
      k.pst != null && k.burdePst != null && k.start && k.burde && k.maal
        ? { pst: k.pst, burdePst: k.burdePst, start: k.start, burde: k.burde, maal: k.maal }
        : null,
    start: k.start,
    maal: k.maal,
    forklar: k.statusTekst,
    kildeTekst: kildeFor(goal, test),
    kurve,
    malinger,
    malingerTom,
    okter,
    avsluttTekst:
      status === "ACHIEVED"
        ? goal.achievedAt ? `Nådd ${datoLang(goal.achievedAt)}.` : "Nådd. Datoen er ikke registrert."
        : status === "ABANDONED"
          ? `Avsluttet${grunn ? `: ${grunn}` : ""}. Målingene er beholdt.`
          : null,
    erEget,
    initial: {
      title: goal.title,
      category: goal.category as "OUTCOME" | "PROCESS",
      type: goal.type,
      targetValue: goal.targetValue,
      targetDate: goal.targetDate ? idagIso(goal.targetDate) : null,
      linkedPyramidArea: goal.linkedPyramidArea,
      linkedTestId: goal.linkedTestId,
      sgOmrade: lesSgMaal(goal.payload)?.omrade ?? null,
      planNivaa: lesPlanNivaa(goal.payload),
    },
  };
}

const ACHIEVEMENT_TITLER: Record<string, string> = {
  STREAK_7: "7 dager på rad",
  STREAK_14: "14 dager på rad",
  STREAK_30: "30 dager på rad",
  FIRST_ROUND: "Første registrerte runde",
  FIRST_TEST: "Første gjennomførte test",
  SG_POSITIVE_30D: "SG positiv siste 30 dager",
  HCP_DOWN: "HCP gikk ned",
  ROUND_BEST: "Ny personlig rekord",
};

/**
 * Alt Målsetninger-siden trenger (/portal/mal og nivået Målsetninger i Workbench):
 * aktive og avsluttede målsetninger som kort, og siste milepæl.
 */
export async function hentMalsetningerSide(user: { id: string; hcp: number | null }): Promise<{
  goals: MaalKortNy[]; avsluttede: MaalKortNy[]; milepael: { tittel: string; dato: string } | null;
}> {
  const [goals, avsluttede, sisteMilepael] = await Promise.all([
    prisma.goal.findMany({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
    prisma.goal.findMany({ where: { userId: user.id, status: { in: ["ACHIEVED", "ABANDONED"] } }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.achievement.findFirst({ where: { userId: user.id }, orderBy: { earnedAt: "desc" } }),
  ]);
  const [kort, avsluttetKort] = await Promise.all([byggMaalKort(goals, user.hcp), byggMaalKort(avsluttede, user.hcp)]);
  return {
    goals: kort,
    avsluttede: avsluttetKort,
    milepael: sisteMilepael
      ? {
          tittel: ACHIEVEMENT_TITLER[sisteMilepael.kind] ?? sisteMilepael.kind,
          dato: sisteMilepael.earnedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" }),
        }
      : null,
  };
}
