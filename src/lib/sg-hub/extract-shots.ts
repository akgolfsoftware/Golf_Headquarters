// Unified rawJson-parser — håndterer begge TrackMan-importformater.
// HTML-import: TrackManHtmlReport ({ type: "multi-group", clubs: [...] })
// CSV-import:  ParsedRow[] (flat Record<string, string>[])

export type ShotData = {
  shotNumber: number;
  clubSpeed: number;
  clubPath: number;
  faceAngle: number;
  faceToPath: number;
  smashFactor: number;
  ballSpeed: number;
  totalDistance: number;
};

type HtmlShot = {
  shotNumber: number;
  clubSpeed: number;
  clubPath: number;
  faceAngle: number;
  faceToPath: number;
  smashFactor: number;
  ballSpeed: number;
  totalDistance: number;
};

type HtmlClub = {
  clubId: string;
  clubName: string;
  shots: HtmlShot[];
};

type HtmlReport = {
  type: "multi-group";
  clubs: HtmlClub[];
};

function num(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return isNaN(n) ? 0 : n;
}

function isHtmlReport(raw: unknown): raw is HtmlReport {
  return (
    typeof raw === "object" &&
    raw !== null &&
    (raw as Record<string, unknown>)["type"] === "multi-group" &&
    Array.isArray((raw as Record<string, unknown>)["clubs"])
  );
}

function matchesClub(club: HtmlClub, clubId: string): boolean {
  const id = clubId.toLowerCase();
  return (
    club.clubId.toLowerCase() === id ||
    club.clubName.toLowerCase() === id
  );
}

export function extractShots(rawJson: unknown, clubId: string): ShotData[] {
  if (isHtmlReport(rawJson)) {
    const match = rawJson.clubs.find((c) => matchesClub(c, clubId));
    if (!match) return [];
    return match.shots.map((s, i) => ({
      shotNumber: s.shotNumber ?? i + 1,
      clubSpeed: s.clubSpeed,
      clubPath: s.clubPath,
      faceAngle: s.faceAngle,
      faceToPath: s.faceToPath,
      smashFactor: s.smashFactor,
      ballSpeed: s.ballSpeed,
      totalDistance: s.totalDistance,
    }));
  }

  if (Array.isArray(rawJson)) {
    const rows = rawJson as Record<string, string>[];
    const id = clubId.toLowerCase();
    return rows
      .filter((r) => {
        const club = (r["Club"] ?? r["club"] ?? r["ClubId"] ?? "").toLowerCase();
        return club === id;
      })
      .map((r, i) => ({
        shotNumber: num(r["Shot"] ?? r["ShotNumber"]) || i + 1,
        clubSpeed: num(r["Club Speed"] ?? r["ClubSpeed"]),
        clubPath: num(r["Club Path"] ?? r["ClubPath"]),
        faceAngle: num(r["Face Angle"] ?? r["FaceAngle"]),
        faceToPath: num(r["Face to Path"] ?? r["FaceToPath"]),
        smashFactor: num(r["Smash Factor"] ?? r["SmashFactor"]),
        ballSpeed: num(r["Ball Speed"] ?? r["BallSpeed"]),
        totalDistance: num(r["Total"] ?? r["TotalDistance"] ?? r["Carry"]),
      }));
  }

  return [];
}

// Hent alle unike club-ID-er på tvers av sessions
export function extractClubs(rawJson: unknown): string[] {
  if (isHtmlReport(rawJson)) {
    return rawJson.clubs.map((c) => c.clubId);
  }
  if (Array.isArray(rawJson)) {
    const rows = rawJson as Record<string, string>[];
    const clubs = new Set<string>();
    for (const r of rows) {
      const c = r["Club"] ?? r["club"] ?? r["ClubId"] ?? "";
      if (c) clubs.add(c);
    }
    return [...clubs];
  }
  return [];
}
