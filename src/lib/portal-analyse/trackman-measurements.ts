import { beregnGappingRader, type TrackManClubStats } from "./ph17-trackman-data";

export type TrackManMeasurement = {
  club: string | null; side: number | null; carryDistance: number | null;
  clubSpeed: number | null; ballSpeed: number | null; smashFactor: number | null;
  launchAngle: number | null; clubPath: number | null; faceToPath: number | null; spinRate: number | null;
};

/** Målt null er ukjent; målt nullverdi er 0. Ingen bay, fitting eller referanse oppfinnes. */
export function beregnTrackManKoller(measurements: readonly TrackManMeasurement[]) {
  const groups = new Map<string, TrackManMeasurement[]>();
  for (const shot of measurements) {
    if (!shot.club?.trim()) continue;
    const group = groups.get(shot.club) ?? []; group.push(shot); groups.set(shot.club, group);
  }
  const shots: Record<string, Array<[number, number]>> = {};
  const clubStats: Record<string, TrackManClubStats> = {};
  const gaps: Array<[string, number, number]> = [];
  for (const [club, group] of groups) {
    const avg = (key: Exclude<keyof TrackManMeasurement, "club">, decimals = 1): number | null => {
      const values = group.map((shot) => shot[key]).filter((value): value is number => value != null && Number.isFinite(value));
      if (!values.length) return null;
      const factor = 10 ** decimals;
      return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * factor) / factor;
    };
    shots[club] = group.filter((shot) => shot.side != null && shot.carryDistance != null && Number.isFinite(shot.side) && Number.isFinite(shot.carryDistance))
      .map((shot) => [shot.side!, shot.carryDistance!]);
    clubStats[club] = {
      carry: avg("carryDistance"), clubSpeed: avg("clubSpeed"), ballSpeed: avg("ballSpeed"),
      smashFactor: avg("smashFactor", 2), launchAngle: avg("launchAngle"), clubPath: avg("clubPath"),
      faceToPath: avg("faceToPath"), spinRate: avg("spinRate", 0),
    };
    const carries = group.map((shot) => shot.carryDistance).filter((value): value is number => value != null && Number.isFinite(value) && value > 0);
    if (carries.length) {
      const mean = carries.reduce((sum, value) => sum + value, 0) / carries.length;
      const spread = Math.sqrt(carries.reduce((sum, value) => sum + (value - mean) ** 2, 0) / carries.length);
      gaps.push([club, Math.round(mean * 10) / 10, Math.round(spread * 10) / 10]);
    }
  }
  gaps.sort((a, b) => b[1] - a[1]);
  return { shots, clubStats, gapping: beregnGappingRader(gaps) };
}
