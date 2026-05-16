export type TrackManShotMetrics = {
  clubSpeed: number;
  clubPath: number;
  swingDirection: number;
  lowPoint: string; // e.g. "8.6A" (A = after, B = before impact)
  faceAngle: number;
  ballSpeed: number;
  faceToPath: number;
  smashFactor: number;
  totalDistance: number;
  launchDirection: number;
};

export type TrackManClubGroup = {
  clubId: string;
  clubName: string;
  shotCount: number;
  shots: ({ shotNumber: number } & TrackManShotMetrics)[];
  average: TrackManShotMetrics;
  consistency: TrackManShotMetrics;
};

export type TrackManHtmlReport = {
  type: "multi-group";
  reportDate: string; // ISO: "2026-03-19"
  sessionName: string;
  clubs: TrackManClubGroup[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

// Matches exactly 10 numeric fields — field 4 (lowPoint) may have A/B suffix.
const METRICS_RE =
  /([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.]+[AB]?)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.]+)\s+([\d.-]+)\s+([\d.-]+)/;

function parseMetrics(src: string): TrackManShotMetrics | null {
  const m = METRICS_RE.exec(src);
  if (!m) return null;
  return {
    clubSpeed: parseFloat(m[1]),
    clubPath: parseFloat(m[2]),
    swingDirection: parseFloat(m[3]),
    lowPoint: m[4],
    faceAngle: parseFloat(m[5]),
    ballSpeed: parseFloat(m[6]),
    faceToPath: parseFloat(m[7]),
    smashFactor: parseFloat(m[8]),
    totalDistance: parseFloat(m[9]),
    launchDirection: parseFloat(m[10]),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseTrackManHtmlReport(html: string): TrackManHtmlReport {
  const text = stripHtml(html);

  // Report date — first ISO date in document
  const dateMatch = /(\d{4}-\d{2}-\d{2})/.exec(text);
  const reportDate = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);

  // Session name — between US-format date and first ISO date
  const sessionRaw = /\d{1,2}\/\d{1,2}\/\d{4}\s+(.+?)\s+\d{4}-\d{2}-\d{2}/.exec(
    text.slice(0, 600),
  );
  const sessionName = sessionRaw
    ? sessionRaw[1].replace(/\s+\w+\s+\d+\s*$/, "").trim()
    : "Trackman Multi Group";

  // Club group boundaries
  // Pattern: "{date} {clubId} [{clubName}] Hide"
  const GROUP_RE = /(\d{4}-\d{2}-\d{2})\s+(\w+)(?:\s+(\w+))?\s+Hide/g;
  const groupMatches = [...text.matchAll(GROUP_RE)];

  if (groupMatches.length === 0) {
    throw new Error(
      "Ingen køllegrupper funnet i HTML-rapporten. Kontroller at filen er en TrackMan Multi Group Report.",
    );
  }

  const clubs: TrackManClubGroup[] = groupMatches.map((match, i) => {
    const clubId = match[2];
    const clubName = match[3] ?? match[2];

    const blockStart = match.index! + match[0].length;
    const blockEnd =
      i + 1 < groupMatches.length ? groupMatches[i + 1].index! : text.length;
    const block = text.slice(blockStart, blockEnd);

    // Individual shots: "1. {10 values}" ...
    const SHOT_RE = /(\d+)\.\s+[\s\S]*?(?=\d+\.|Average|Consistency|$)/g;
    const shots: ({ shotNumber: number } & TrackManShotMetrics)[] = [];

    // Simpler: find all "N. <metrics>" blocks
    const shotLineRe = /(\d+)\.\s+([\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.]+[AB]?\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.]+\s+[\d.-]+\s+[\d.-]+)/g;
    for (const sm of block.matchAll(shotLineRe)) {
      const metrics = parseMetrics(sm[2]);
      if (metrics) {
        shots.push({ shotNumber: parseInt(sm[1], 10), ...metrics });
      }
    }

    const avgMatch = /Average\s+([\s\S]+?)(?=Consistency|$)/.exec(block);
    const average = (avgMatch && parseMetrics(avgMatch[1])) ?? {
      clubSpeed: 0, clubPath: 0, swingDirection: 0, lowPoint: "0",
      faceAngle: 0, ballSpeed: 0, faceToPath: 0, smashFactor: 0,
      totalDistance: 0, launchDirection: 0,
    };

    const conMatch = /Consistency\s+([\s\S]+?)$/.exec(block);
    const consistency = (conMatch && parseMetrics(conMatch[1])) ?? {
      clubSpeed: 0, clubPath: 0, swingDirection: 0, lowPoint: "0",
      faceAngle: 0, ballSpeed: 0, faceToPath: 0, smashFactor: 0,
      totalDistance: 0, launchDirection: 0,
    };

    void SHOT_RE; // suppress unused-var warning

    return { clubId, clubName, shotCount: shots.length, shots, average, consistency };
  });

  return { type: "multi-group", reportDate, sessionName, clubs };
}
