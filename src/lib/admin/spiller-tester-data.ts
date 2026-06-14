/**
 * Per-spiller test-data for coach-view (/admin/spillere/[id]/tester).
 *
 * Alt er ekte fra Prisma. Vi viser DEKNING per disiplin (tester målt /
 * tilgjengelig) — IKKE en fabrikkert 0–100 ferdighetsskala. Nivå vises kun
 * der testen har ekte benchmarks (test-benchmarks); FYS uten benchmarks får
 * ingen nivå-verdikt (låst regel). Ingen «A1-snitt» eller oppdiktede tall.
 */

import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { parseBenchmarks, achievedLevel } from "./test-benchmarks";

const OMRADER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const OMRADE_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export type OmradeProfil = {
  area: PyramidArea;
  label: string;
  available: number;
  measured: number;
  coveragePct: number;
  measurements: number;
  lastDate: string | null;
  bestLevel: string | null;
};

export type SpillerTesterData = {
  player: {
    name: string;
    initials: string;
    hcp: number | null;
    homeClub: string | null;
    alder: number | null;
    tier: string;
    sistAktiv: string | null;
  };
  testsTotal: number;
  testsDone: number;
  measurements: number;
  omraderDekket: number;
  omrader: OmradeProfil[];
  sterkeste: OmradeProfil | null;
  svakeste: OmradeProfil | null;
};

function initialer(navn: string): string {
  return (
    navn
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"
  );
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function loadSpillerTesterData(playerId: string): Promise<SpillerTesterData | null> {
  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: { name: true, hcp: true, homeClub: true, dateOfBirth: true, tier: true, lastLoginAt: true },
  });
  if (!player) return null;

  const [testDefs, results] = await Promise.all([
    prisma.testDefinition.findMany({ select: { id: true, pyramidArea: true, protocol: true } }),
    prisma.testResult.findMany({
      where: { userId: playerId },
      select: { testId: true, score: true, takenAt: true },
      orderBy: { takenAt: "asc" },
    }),
  ]);

  const byTest = new Map<string, { score: number; takenAt: Date }[]>();
  for (const r of results) {
    const arr = byTest.get(r.testId);
    if (arr) arr.push({ score: r.score, takenAt: r.takenAt });
    else byTest.set(r.testId, [{ score: r.score, takenAt: r.takenAt }]);
  }

  const omrader: OmradeProfil[] = OMRADER.map((area) => {
    const inArea = testDefs.filter((t) => t.pyramidArea === area);
    let measured = 0;
    let measurements = 0;
    let last: Date | null = null;
    let best: { label: string; index: number } | null = null;
    for (const t of inArea) {
      const hist = byTest.get(t.id);
      if (!hist || hist.length === 0) continue;
      measured += 1;
      measurements += hist.length;
      const lastTaken = hist[hist.length - 1].takenAt;
      if (!last || lastTaken > last) last = lastTaken;
      const bm = parseBenchmarks(t.protocol);
      if (bm) {
        const lvl = achievedLevel(bm, hist[hist.length - 1].score);
        if (lvl && (best === null || lvl.index < best.index)) best = { label: lvl.label, index: lvl.index };
      }
    }
    return {
      area,
      label: OMRADE_LABEL[area],
      available: inArea.length,
      measured,
      coveragePct: inArea.length > 0 ? Math.round((measured / inArea.length) * 100) : 0,
      measurements,
      lastDate: last ? formatDato(last) : null,
      bestLevel: best?.label ?? null,
    };
  });

  const malt = omrader.filter((o) => o.measured > 0);
  const sterkeste =
    malt.length > 0 ? malt.reduce((a, b) => (b.coveragePct > a.coveragePct ? b : a)) : null;
  // Svakeste: lavest dekning (0-dekning teller — disse trenger mest oppmerksomhet).
  const svakeste = omrader.reduce((a, b) => (b.coveragePct < a.coveragePct ? b : a));

  const now = new Date();
  const alder =
    player.dateOfBirth != null ? now.getFullYear() - player.dateOfBirth.getFullYear() : null;

  return {
    player: {
      name: player.name,
      initials: initialer(player.name),
      hcp: player.hcp,
      homeClub: player.homeClub,
      alder,
      tier: player.tier,
      sistAktiv: player.lastLoginAt ? formatDato(player.lastLoginAt) : null,
    },
    testsTotal: testDefs.length,
    testsDone: omrader.reduce((sum, o) => sum + o.measured, 0),
    measurements: results.length,
    omraderDekket: malt.length,
    omrader,
    sterkeste,
    svakeste,
  };
}
