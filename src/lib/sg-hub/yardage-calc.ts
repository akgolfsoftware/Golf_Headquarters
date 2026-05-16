// Aggregér per-kølle yardage-data fra TrackMan-sessions.
// Beregner stock-distanse + 3/4 + soft + carry/total + apex + ±1σ per kølle.

import { extractClubs, extractShots, type ShotData } from "./extract-shots";

export type ClubFamily = "driver" | "wood" | "iron" | "wedge" | "putter";

export type YardageRow = {
  club: string;
  family: ClubFamily;
  shotCount: number;
  // Distanse i meter
  totalAvg: number; // Snitt total distanse
  totalSigma: number; // ±1σ for total
  carryAvg: number; // Estimert carry
  threeQuarter: number; // 0.85 × total
  soft: number; // 0.78 × total
  apex: number; // Estimert apex (m) — placeholder hvis ikke i data
  ballSpeedAvg: number;
  clubSpeedAvg: number;
  smashAvg: number;
};

const CLUB_ORDER = [
  "Driver", "1W", "3W", "5W", "7W",
  "1i", "2i", "3i", "4i", "5i", "6i", "7i", "8i", "9i",
  "PW", "AW", "GW", "SW", "LW",
  "PT",
];

export function clubSortKey(club: string): number {
  const i = CLUB_ORDER.indexOf(club);
  return i === -1 ? 999 : i;
}

export function classifyClub(club: string): ClubFamily {
  const c = club.toLowerCase();
  if (c === "driver" || c === "1w") return "driver";
  if (c.endsWith("w")) return "wood";
  if (c === "pt" || c === "putter") return "putter";
  if (["pw", "aw", "gw", "sw", "lw"].includes(c)) return "wedge";
  return "iron";
}

// Carry-faktor (total → carry) basert på køllefamilie.
// Kalibreres via player-historikk hvis tilstrekkelig data finnes.
export function carryFactor(family: ClubFamily): number {
  switch (family) {
    case "driver":
      return 0.95;
    case "wood":
      return 0.93;
    case "iron":
      return 0.92;
    case "wedge":
      return 0.98;
    case "putter":
      return 1.0;
  }
}

// Apex-estimat når TrackMan ikke gir apex direkte.
// Grov heuristikk basert på køllefamilie og total distanse.
function estimateApex(family: ClubFamily, total: number): number {
  if (total <= 0) return 0;
  switch (family) {
    case "driver":
      return Math.round(total * 0.13);
    case "wood":
      return Math.round(total * 0.17);
    case "iron":
      return Math.round(total * 0.22);
    case "wedge":
      return Math.round(total * 0.30);
    case "putter":
      return 0;
  }
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function stddev(xs: number[], mu: number): number {
  if (xs.length < 2) return 0;
  const variance =
    xs.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

// Bygger en yardage-rad per kølle ut fra alle sessions.
export function buildYardageRows(
  sessions: { rawJson: unknown }[],
): YardageRow[] {
  // Samle alle unike kølleidentifikatorer
  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const club of extractClubs(s.rawJson)) {
      clubSet.add(club);
    }
  }

  const rows: YardageRow[] = [];
  for (const club of clubSet) {
    // Aggregér alle slag for denne køllen på tvers av sessions
    const shots: ShotData[] = sessions.flatMap((s) =>
      extractShots(s.rawJson, club),
    );

    // Filtrer ut feil-rader (0 = ingen data)
    const valid = shots.filter((sh) => sh.totalDistance > 0);
    if (valid.length === 0) continue;

    const totals = valid.map((sh) => sh.totalDistance);
    const ballSpeeds = valid.map((sh) => sh.ballSpeed);
    const clubSpeeds = valid.map((sh) => sh.clubSpeed);
    const smashes = valid.map((sh) => sh.smashFactor);

    const totalAvg = mean(totals);
    const totalSigma = stddev(totals, totalAvg);
    const family = classifyClub(club);
    const carry = totalAvg * carryFactor(family);
    const apex = estimateApex(family, totalAvg);

    rows.push({
      club,
      family,
      shotCount: valid.length,
      totalAvg: round1(totalAvg),
      totalSigma: round1(totalSigma),
      carryAvg: round1(carry),
      threeQuarter: round1(totalAvg * 0.85),
      soft: round1(totalAvg * 0.78),
      apex,
      ballSpeedAvg: round1(mean(ballSpeeds)),
      clubSpeedAvg: round1(mean(clubSpeeds)),
      smashAvg: Math.round(mean(smashes) * 100) / 100,
    });
  }

  rows.sort((a, b) => clubSortKey(a.club) - clubSortKey(b.club));
  return rows;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Værjustering — anvendes på distanser (carry/total/3-4/soft).
// temp °C, elevation i meter.
export function adjustForConditions(
  distance: number,
  tempC: number,
  elevationM: number,
): number {
  // Temp: distance × (1 + 0.0008 × (temp − 15))
  const tempFactor = 1 + 0.0008 * (tempC - 15);
  // Elevation: +1m carry per 100m
  const elevAdd = elevationM / 100;
  return distance * tempFactor + elevAdd;
}
