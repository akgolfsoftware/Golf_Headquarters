/**
 * Golfstat.com (NCAA) turneringsklient.
 *
 * Verifisert 2026-08-17 med direkte fetch mot ekte golfstat.com/results.golfstat.com-
 * sider: Playwright er IKKE nødvendig i drift — hele pipelinen (turneringsindeks,
 * deltagerliste, runde-for-runde BRUTTO-score) er statisk, server-rendret HTML.
 * `robots.txt` tillater all crawling ("Disallow:" tom).
 *
 * Tre steg:
 * 1. getActiveTournamentIds() — golfstat.com sin forside har `<script src=".../
 *    miniboards/pleaderboard_{tid}.html">`-tagger for hver aktive/nylige turnering,
 *    innebygd direkte i den statiske HTML-en (ingen JS-kjøring nødvendig for å finne dem).
 * 2. getTournamentInfo(tid) — resultattittel + dato fra <title>-taggen på
 *    gsnav.cfm?pg=player&tid={tid}.
 * 3. getPlayerScores(tid) — samme side: hvert spiller-rad er en blokk avsluttet av
 *    `<div id="Player{playerId}">`, med navn/lag fra en getScorecard(...)-lenke og
 *    brutto runde-score i <round_score>-tagger. Siden er allerede rangert etter
 *    plassering, så radrekkefølgen brukes som posisjon (ingen egen posisjonskolonne
 *    i denne visningen — uavklart om liks plassering "T"-markeres et annet sted).
 */

const USER_AGENT = "AKGolfBot/1.0 (+akgolf.no)";
const HOME_BASE = "https://www.golfstat.com";
const RESULTS_BASE = "https://results.golfstat.com";
const FETCH_TIMEOUT_MS = 15_000;

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  return res.text();
}

/** Hent alle turnerings-ID-er som er lenket fra forsidens miniboard-widgeter akkurat nå. */
export async function getActiveTournamentIds(): Promise<number[]> {
  const html = await fetchText(HOME_BASE);
  if (!html) return [];
  const ids = new Set<number>();
  const re = /miniboards\/[pt]leaderboard_(\d+)\.html/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) ids.add(Number(m[1]));
  return [...ids];
}

export type GolfstatTournamentInfo = {
  name: string;
  date: Date | null;
};

/** Turneringsnavn + dato fra <title>player - {navn} - {YYYY-MM-DD}</title>. */
export async function getTournamentInfo(tid: number): Promise<GolfstatTournamentInfo | null> {
  const html = await fetchText(
    `${RESULTS_BASE}/public/leaderboards/gsnav.cfm?pg=player&tid=${tid}`,
  );
  if (!html) return null;
  const titleMatch = html.match(/<title>\s*player\s*-\s*(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})\s*<\/title>/i);
  if (!titleMatch) return null;
  const date = new Date(titleMatch[2]);
  return {
    name: titleMatch[1].trim(),
    date: isNaN(date.getTime()) ? null : date,
  };
}

export type GolfstatPlayerScore = {
  golfstatPlayerId: number;
  playerName: string;
  team: string;
  /** Rangert plassering (radrekkefølge på siden — ties vises ikke separat her). */
  position: number;
  /** Brutto-score per runde. */
  roundScores: number[];
  total: number | null;
};

/**
 * Ren parser for pg=player-HTML-en — trukket ut fra getPlayerScores() for testbarhet.
 * Verifisert mot ekte fanget HTML fra golfstat.com 2026-08-17 (Bushnell Fall
 * Invitational, tid=29253).
 */
export function parsePlayerScoresHtml(html: string): GolfstatPlayerScore[] {
  const blocks = html.split(/<div id="Player\d+"[^>]*><\/div>/);
  const rowRe =
    /getScorecard\(\d+,\s*\d+,\s*(\d+),[^)]*\)"[^>]*>([^<]+)<\/a>[\s\S]*?text-align:left;">\s*([^<\n]+?)\s*<\/div>/;

  const results: GolfstatPlayerScore[] = [];
  let position = 0;
  for (const block of blocks) {
    const rowMatch = block.match(rowRe);
    if (!rowMatch) continue;
    position++;

    const [, playerIdStr, name, team] = rowMatch;
    const roundScores = [...block.matchAll(/<round_score>(\d+)<\/round_score>/g)].map((r) =>
      Number(r[1]),
    );

    // Totalen står i den siste "width:40px"-tall-boksen etter siste round_score.
    const afterLastRound = block.split(/<round_score>\d+<\/round_score>/).pop() ?? "";
    const totalMatch = afterLastRound.match(/width:40px[^>]*>\s*(\d+)\s*<\/div>/);

    results.push({
      golfstatPlayerId: Number(playerIdStr),
      playerName: name.trim(),
      team: team.trim(),
      position,
      roundScores,
      total: totalMatch ? Number(totalMatch[1]) : null,
    });
  }
  return results;
}

/** Hent alle spilleres runde-for-runde brutto-score for én turnering. */
export async function getPlayerScores(tid: number): Promise<GolfstatPlayerScore[]> {
  const html = await fetchText(
    `${RESULTS_BASE}/public/leaderboards/gsnav.cfm?pg=player&tid=${tid}`,
  );
  if (!html) return [];
  return parsePlayerScoresHtml(html);
}
