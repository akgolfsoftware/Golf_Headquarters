/**
 * TrackMan sesjonsanalyse — server-side aggregering (Bag-view).
 *
 * Port-datakilde for /portal/mal/trackman (FASIT:
 * public/design-handover/playerhq/components-trackman.html).
 *
 * Aggregerer ekte `TrackManShot`-rader per kølle til metrikkene designet viser:
 * carry/total/side/spread (95 %), stabilitetsscore, full parameter-tabell
 * (RESULTAT/BALL/KLUBBLEVERING) + dispersjons-punkter for plottet.
 *
 * REGEL: aldri falske tall. Mangler data for et felt → null/utledet (designet
 * viser "—" / tomt). Stabilitet og spread regnes kun fra slag som faktisk har
 * relevant verdi, og outlier-flaggede slag ekskluderes fra trender.
 */

import type { TrackManShot } from "@/generated/prisma/client";

// ── Klubb-rekkefølge (lengst → kortest) for bag-strip og tabell ──────────────
// Matcher TrackMan-CSV club-strenger ("Driver" | "7-jern" | "PW" | "54°" osv.)
const CLUB_ORDER = [
  "Driver",
  "3W", "3-W", "4W", "4-W", "5W", "5-W", "7W", "7-W",
  "2-jern", "2I", "3-jern", "3I", "4-jern", "4I",
  "5-jern", "5I", "6-jern", "6I", "7-jern", "7I", "8-jern", "8I", "9-jern", "9I",
  "PW", "GW", "50°", "52°", "54°", "56°", "58°", "60°", "SW", "LW",
];

export type ClubCategory = "wood" | "long" | "mid" | "short" | "wedge" | "putter";

/** Stabilitetsnivå basert på score (8+ stødig, 6.5–8 inkonsistent, <6.5 jobbing). */
export type Stability = "good" | "warn" | "bad";

/** Konfidens basert på antall slag (datagrunnlag for klubben). */
export type Confidence = "high" | "medium" | "low" | "off";

export type ParamRow = {
  name: string;
  /** Formatert verdi (norsk desimal-komma). `null` → "—". */
  value: string | null;
  unit?: string;
  /** Standardavvik formatert, eller null. */
  sd: string | null;
  /** Tone for σ-pille: pos = stødig, warn = stort avvik. */
  sdTone: "pos" | "warn";
};

export type ClubAnalysis = {
  club: string;
  category: ClubCategory;
  shotCount: number;
  confidence: Confidence;
  /** Snitt carry (yd, avrundet) eller null. */
  carry: number | null;
  /** Snitt total (yd) eller null. */
  total: number | null;
  /** 95 %-spread i carry (yd) eller null. */
  spread95: number | null;
  /** Snitt side-avvik (yd, + = høyre) eller null. */
  sideMean: number | null;
  /** Stabilitetsscore 0–10 eller null hvis for lite data. */
  stability: number | null;
  stabilityTone: Stability;
  /** Andel innenfor pin-radius (5 % av carry) i prosent, eller null. */
  withinPinPct: number | null;
  params: {
    resultat: ParamRow[];
    ball: ParamRow[];
    klubb: ParamRow[];
  };
  /** Dispersjons-punkter (yd) relativt til mål: x = side, y = carry-avvik. */
  dispersion: DispersionPoint[];
};

export type DispersionPoint = {
  /** Side-avvik i yd (+ = høyre). */
  side: number;
  /** Carry-avvik fra snitt i yd (+ = lengre). */
  depth: number;
};

export type SessionFinding = {
  tone: "warn" | "good" | "act";
  /** Fet ledetekst (klubb/parameter). */
  lead: string;
  body: string;
  metaLabel: string;
};

export type SessionAnalysis = {
  sessionId: string;
  recordedAt: Date;
  shotCount: number;
  /** Antall unike køller med data. */
  clubsWithData: number;
  /** Estimert varighet i minutter (siste − første slag), eller null. */
  durationMin: number | null;
  /** Stabilitetsscore for økten samlet (0–10) eller null. */
  sessionStability: number | null;
  clubs: ClubAnalysis[];
  findings: SessionFinding[];
};

// ── Hjelpere ─────────────────────────────────────────────────────────────────

const M_TO_YD = 1.09361;

function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stddev(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = mean(xs)!;
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length;
  return Math.sqrt(variance);
}

/** Norsk tallformat med komma og valgfri desimal. */
function fmt(n: number | null, decimals = 0): string | null {
  if (n === null || Number.isNaN(n)) return null;
  return n
    .toLocaleString("nb-NO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
}

/** Fortegn-prefiks for retnings-verdier (+/−). */
function fmtSigned(n: number | null, decimals = 0): string | null {
  if (n === null || Number.isNaN(n)) return null;
  const s = fmt(Math.abs(n), decimals)!;
  if (n > 0) return `+${s}`;
  if (n < 0) return `−${s}`;
  return s;
}

function categorize(club: string): ClubCategory {
  const c = club.toLowerCase();
  if (c.includes("putter") || c === "pt") return "putter";
  if (c.includes("driver") || /\bw\b/.test(c) || c.includes("wood") || /\d-?w/.test(c)) return "wood";
  if (c.includes("°") || c.includes("pw") || c.includes("gw") || c.includes("sw") || c.includes("lw") || c.includes("wedge")) return "wedge";
  // Jern 2–4 = long, 5–7 = mid, 8–9 = short
  const ironMatch = c.match(/(\d)\s*(?:-?jern|i)\b/);
  if (ironMatch) {
    const n = Number(ironMatch[1]);
    if (n <= 4) return "long";
    if (n <= 7) return "mid";
    return "short";
  }
  return "mid";
}

function clubSortIndex(club: string): number {
  const idx = CLUB_ORDER.findIndex((c) => c.toLowerCase() === club.toLowerCase());
  return idx === -1 ? 999 : idx;
}

function confidenceFor(shots: number): Confidence {
  if (shots === 0) return "off";
  if (shots >= 25) return "high";
  if (shots >= 15) return "medium";
  return "low";
}

function stabilityTone(score: number | null): Stability {
  if (score === null) return "warn";
  if (score >= 8) return "good";
  if (score >= 6.5) return "warn";
  return "bad";
}

/**
 * Stabilitetsscore 0–10 utledet fra variasjonskoeffisient (CV) i carry +
 * spinn-konsistens. Lavere relativt avvik → høyere score. Dette er en utledet
 * heuristikk fra ekte spredning, ikke et eksternt benchmark.
 */
function computeStability(carries: number[], spins: number[]): number | null {
  const carryMean = mean(carries);
  const carrySd = stddev(carries);
  if (carryMean === null || carrySd === null || carryMean === 0) return null;

  // CV for carry (typisk 0.02–0.10 for amatør). Map 0.02→10, 0.12→3.
  const carryCv = carrySd / carryMean;
  const carryScore = clamp(10 - (carryCv - 0.02) * 70, 1, 10);

  // Spinn-konsistens hvis tilgjengelig.
  const spinSd = stddev(spins);
  const spinMean = mean(spins);
  let combined = carryScore;
  if (spinSd !== null && spinMean !== null && spinMean > 0) {
    const spinCv = spinSd / spinMean;
    const spinScore = clamp(10 - (spinCv - 0.03) * 55, 1, 10);
    combined = carryScore * 0.6 + spinScore * 0.4;
  }
  return Math.round(combined * 10) / 10;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ── Hovedaggregering ──────────────────────────────────────────────────────────

type SessionInput = {
  id: string;
  recordedAt: Date;
  shotCount: number;
  shots: TrackManShot[];
};

export function analyzeSession(session: SessionInput): SessionAnalysis {
  const valid = session.shots.filter((s) => !s.outlier);

  // Gruppér per kølle
  const byClub = new Map<string, TrackManShot[]>();
  for (const shot of valid) {
    const list = byClub.get(shot.club) ?? [];
    list.push(shot);
    byClub.set(shot.club, list);
  }

  const clubs: ClubAnalysis[] = [...byClub.entries()]
    .map(([club, shots]) => buildClubAnalysis(club, shots))
    .sort((a, b) => clubSortIndex(a.club) - clubSortIndex(b.club));

  // Varighet (min) fra recordedAt-spenn
  let durationMin: number | null = null;
  if (valid.length >= 2) {
    const times = valid.map((s) => s.recordedAt.getTime());
    const span = Math.max(...times) - Math.min(...times);
    durationMin = Math.round(span / 60000);
    if (durationMin <= 0) durationMin = null;
  }

  // Øktens samlede stabilitet = snitt av køller med score
  const clubScores = clubs.map((c) => c.stability).filter((s): s is number => s !== null);
  const sessionStability = clubScores.length > 0
    ? Math.round((mean(clubScores)! ) * 10) / 10
    : null;

  return {
    sessionId: session.id,
    recordedAt: session.recordedAt,
    shotCount: session.shotCount || valid.length,
    clubsWithData: clubs.length,
    durationMin,
    sessionStability,
    clubs,
    findings: deriveFindings(clubs),
  };
}

function buildClubAnalysis(club: string, shots: TrackManShot[]): ClubAnalysis {
  const carriesYd = shots.map((s) => s.carryDistance).filter((v): v is number => v != null).map((m) => m * M_TO_YD);
  const totalsYd = shots.map((s) => s.totalDistance).filter((v): v is number => v != null).map((m) => m * M_TO_YD);
  const sidesYd = shots.map((s) => s.side).filter((v): v is number => v != null).map((m) => m * M_TO_YD);
  const spins = shots.map((s) => s.spinRate).filter((v): v is number => v != null);
  const ballSpeeds = shots.map((s) => s.ballSpeed).filter((v): v is number => v != null);
  const launches = shots.map((s) => s.launchAngle).filter((v): v is number => v != null);
  const spinAxes = shots.map((s) => s.spinAxis).filter((v): v is number => v != null);
  const apexes = shots.map((s) => s.apexHeight).filter((v): v is number => v != null);
  const landAngles = shots.map((s) => s.landAngle).filter((v): v is number => v != null);
  const clubSpeeds = shots.map((s) => s.clubSpeed).filter((v): v is number => v != null);
  const smashes = shots.map((s) => s.smashFactor).filter((v): v is number => v != null);
  const attacks = shots.map((s) => s.attackAngle).filter((v): v is number => v != null);
  const paths = shots.map((s) => s.clubPath).filter((v): v is number => v != null);
  const faceToPaths = shots.map((s) => s.faceToPath).filter((v): v is number => v != null);
  const dynLofts = shots.map((s) => s.dynamicLoft).filter((v): v is number => v != null);

  const carryMean = mean(carriesYd);
  const carrySd = stddev(carriesYd);
  const sideMean = mean(sidesYd);
  // 95 %-spread ≈ 2σ
  const spread95 = carrySd !== null ? carrySd * 2 : null;
  const stability = computeStability(carriesYd, spins);

  // Innenfor pin: andel slag der avstand fra mål < 5 % av snitt-carry
  let withinPinPct: number | null = null;
  if (carryMean !== null && carriesYd.length > 0) {
    const pinR = carryMean * 0.05;
    let within = 0;
    let counted = 0;
    for (const s of shots) {
      if (s.carryDistance == null || s.side == null) continue;
      const dCarry = s.carryDistance * M_TO_YD - carryMean;
      const dSide = s.side * M_TO_YD;
      const dist = Math.sqrt(dCarry ** 2 + dSide ** 2);
      counted++;
      if (dist <= pinR) within++;
    }
    if (counted > 0) withinPinPct = Math.round((within / counted) * 100);
  }

  // Dispersjons-punkter relativt til snitt-carry (yd)
  const dispersion: DispersionPoint[] = [];
  if (carryMean !== null) {
    for (const s of shots) {
      if (s.carryDistance == null || s.side == null) continue;
      dispersion.push({
        side: Math.round((s.side * M_TO_YD) * 10) / 10,
        depth: Math.round((s.carryDistance * M_TO_YD - carryMean) * 10) / 10,
      });
    }
  }

  const sd = (xs: number[]): ParamRow["sd"] => {
    const v = stddev(xs);
    return v === null ? null : fmt(v, v < 10 ? 1 : 0);
  };
  // σ-tone: stort relativt avvik på spinn flagges warn (designet markerer spinn ±410)
  const spinSd = stddev(spins);
  const spinMean = mean(spins);
  const spinTone: ParamRow["sdTone"] =
    spinSd !== null && spinMean !== null && spinMean > 0 && spinSd / spinMean > 0.05 ? "warn" : "pos";

  return {
    club,
    category: categorize(club),
    shotCount: shots.length,
    confidence: confidenceFor(shots.length),
    carry: carryMean !== null ? Math.round(carryMean) : null,
    total: mean(totalsYd) !== null ? Math.round(mean(totalsYd)!) : null,
    spread95: spread95 !== null ? Math.round(spread95) : null,
    sideMean: sideMean !== null ? Math.round(sideMean) : null,
    stability,
    stabilityTone: stabilityTone(stability),
    withinPinPct,
    params: {
      resultat: [
        { name: "Carry", value: fmt(carryMean), unit: "yd", sd: sd(carriesYd), sdTone: "pos" },
        { name: "Total", value: fmt(mean(totalsYd)), unit: "yd", sd: sd(totalsYd), sdTone: "pos" },
        { name: "Side", value: fmtSigned(sideMean), unit: "yd", sd: sd(sidesYd), sdTone: "pos" },
        { name: "Apex", value: fmt(mean(apexes), 1), unit: "m", sd: sd(apexes), sdTone: "pos" },
        { name: "Land-vinkel", value: fmt(mean(landAngles), 1), unit: "°", sd: sd(landAngles), sdTone: "pos" },
      ],
      ball: [
        { name: "Ballhastighet", value: fmt(mean(ballSpeeds), 1), unit: "mph", sd: sd(ballSpeeds), sdTone: "pos" },
        { name: "Launch angle", value: fmt(mean(launches), 1), unit: "°", sd: sd(launches), sdTone: "pos" },
        { name: "Spinnrate", value: fmt(spinMean), unit: "rpm", sd: sd(spins), sdTone: spinTone },
        { name: "Spinnakse", value: fmtSigned(mean(spinAxes), 1), unit: "°", sd: sd(spinAxes), sdTone: "pos" },
      ],
      klubb: [
        { name: "Club speed", value: fmt(mean(clubSpeeds), 1), unit: "mph", sd: sd(clubSpeeds), sdTone: "pos" },
        { name: "Smash factor", value: fmt(mean(smashes), 2), sd: sd(smashes), sdTone: "pos" },
        { name: "Attack angle", value: fmtSigned(mean(attacks), 1), unit: "°", sd: sd(attacks), sdTone: "pos" },
        { name: "Club path", value: fmtSigned(mean(paths), 1), unit: "°", sd: sd(paths), sdTone: "pos" },
        { name: "Face to path", value: fmtSigned(mean(faceToPaths), 1), unit: "°", sd: sd(faceToPaths), sdTone: "pos" },
        { name: "Dynamic loft", value: fmt(mean(dynLofts), 1), unit: "°", sd: sd(dynLofts), sdTone: "pos" },
      ],
    },
    dispersion,
  };
}

/**
 * Utleder inntil 3 funn fra ekte data (svakest/sterkest stabilitet + spinn-varians).
 * Returnerer tom liste hvis ikke nok data — designet skjuler panelet da.
 */
function deriveFindings(clubs: ClubAnalysis[]): SessionFinding[] {
  const scored = clubs.filter((c) => c.stability !== null && c.shotCount >= 5);
  if (scored.length === 0) return [];

  const findings: SessionFinding[] = [];

  // Svakest stabilitet → FOKUS
  const worst = [...scored].sort((a, b) => a.stability! - b.stability!)[0];
  if (worst && worst.stability! < 7) {
    const spreadTxt = worst.spread95 != null ? ` Spread ±${worst.spread95} yd` : "";
    findings.push({
      tone: "warn",
      lead: worst.club,
      body: `Stabilitet ${fmt(worst.stability, 1)}/10 — mest å hente her.${spreadTxt}. Fokuser på treffpunkt og samme tempo.`,
      metaLabel: "FOKUS",
    });
  }

  // Sterkest stabilitet → STERK
  const best = [...scored].sort((a, b) => b.stability! - a.stability!)[0];
  if (best && best.club !== worst?.club && best.stability! >= 8) {
    findings.push({
      tone: "good",
      lead: best.club,
      body: `Stabilitet ${fmt(best.stability, 1)}/10 — meget stødig. Hold setup og tempo som det er.`,
      metaLabel: "STERK",
    });
  }

  // Største spinn-varians → ACTION
  const spinFlagged = scored
    .filter((c) => c.params.ball.some((p) => p.name === "Spinnrate" && p.sdTone === "warn"))
    .sort((a, b) => (b.shotCount - a.shotCount))[0];
  if (spinFlagged && findings.length < 3) {
    findings.push({
      tone: "act",
      lead: spinFlagged.club,
      body: "Spinn-variasjonen er stor mellom slag. Prøv samme balltype og kontroller treffpunkt for jevnere tall.",
      metaLabel: "ACTION",
    });
  }

  return findings.slice(0, 3);
}
