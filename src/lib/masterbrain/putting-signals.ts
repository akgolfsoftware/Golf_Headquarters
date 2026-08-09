/**
 * Putting brain — signal model (v1).
 * Maps player performance inputs → prioritized putting focus.
 * Never invents drills: callers must resolve drills from FASIT bank only.
 */

export type PuttingLeak =
  | "green_read"
  | "aim"
  | "start_line"
  | "pace"
  | "distance_control"
  | "pressure"
  | "unknown";

export type PuttingSignals = {
  /** SG: Putting (higher better; null = missing). */
  sgPutt: number | null;
  /** Make % inside 8 ft if known. */
  makePctInside8: number | null;
  /** 3-putt rate per round if known. */
  threePuttRate: number | null;
  /** Player self-report or coach note tags. */
  tags: string[];
  /** Level band A–K or free text. */
  level: string | null;
};

export type PuttingFocus = {
  primary: PuttingLeak;
  secondary: PuttingLeak | null;
  confidence: "low" | "medium" | "high";
  /** Short nb coach line — never names a drill id. */
  coachLineNb: string;
  /** Keys for FASIT lookup only — empty if bank empty. */
  fasitQueryTags: string[];
};

const LINES: Record<PuttingLeak, string> = {
  green_read: "Prioriter green-lesing før teknikk — fall og korn først.",
  aim: "Sikte og startlinje: sørg for at putteren peker der ballen skal starte.",
  start_line: "Ballstart på linjen — teknikk før lengde i økten.",
  pace: "Lengdekontroll er lekkasjen — tempo og treffpunkt.",
  distance_control: "Avstandskontroll over 20 fot — lag-putts før make-press.",
  pressure: "Prosess under press — rutine før resultat.",
  unknown: "For lite putting-data ennå — logg 1 runde eller lab-økt først.",
};

export function derivePuttingFocus(s: PuttingSignals): PuttingFocus {
  const scores: Partial<Record<PuttingLeak, number>> = {};

  if (s.sgPutt != null && s.sgPutt < -0.3) {
    scores.pace = (scores.pace ?? 0) + 2;
    scores.distance_control = (scores.distance_control ?? 0) + 1;
  }
  if (s.makePctInside8 != null && s.makePctInside8 < 0.75) {
    scores.start_line = (scores.start_line ?? 0) + 2;
    scores.aim = (scores.aim ?? 0) + 1;
  }
  if (s.threePuttRate != null && s.threePuttRate > 0.15) {
    scores.distance_control = (scores.distance_control ?? 0) + 3;
    scores.pace = (scores.pace ?? 0) + 1;
  }
  for (const tag of s.tags) {
    const t = tag.toLowerCase();
    if (t.includes("sikt") || t.includes("aim")) scores.aim = (scores.aim ?? 0) + 1;
    if (t.includes("les") || t.includes("green")) scores.green_read = (scores.green_read ?? 0) + 1;
    if (t.includes("lengd") || t.includes("pace")) scores.pace = (scores.pace ?? 0) + 1;
    if (t.includes("press")) scores.pressure = (scores.pressure ?? 0) + 1;
  }

  const ranked = (Object.entries(scores) as [PuttingLeak, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  if (ranked.length === 0) {
    return {
      primary: "unknown",
      secondary: null,
      confidence: "low",
      coachLineNb: LINES.unknown,
      fasitQueryTags: ["putting"],
    };
  }

  const primary = ranked[0][0];
  const secondary = ranked[1]?.[0] ?? null;
  const top = ranked[0][1];
  const confidence = top >= 3 ? "high" : top >= 2 ? "medium" : "low";

  return {
    primary,
    secondary,
    confidence,
    coachLineNb: LINES[primary],
    fasitQueryTags: ["putting", primary, secondary].filter(Boolean) as string[],
  };
}
