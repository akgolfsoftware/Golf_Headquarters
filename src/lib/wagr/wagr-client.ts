/**
 * WAGR (World Amateur Golf Ranking) turneringsklient.
 *
 * Verifisert 2026-08-17 med direkte nettverksavlytting (Playwright network-trace)
 * mot ekte wagr.com-sider: BÅDE spillerens turneringsliste OG hvert eventets
 * fulle runde-for-runde-leaderboard er tilgjengelig via ren fetch — ingen
 * Playwright/browser nødvendig i drift (kun brukt til selve reconen).
 *
 * To kilder:
 * 1. getPlayerEvents(profileId) — JSON-API, samme host-mønster som
 *    getPlayerRankingGraphData i src/lib/agents/wagr-sync.ts. Gir listen over
 *    turneringer en spiller har spilt (kun navn/dato/plassering, ikke runder).
 * 2. getEventLeaderboard(eventDetailsLink) — SSR-side (wagr.com/events/{slug}),
 *    __NEXT_DATA__ inneholder FULL leaderboard for arrangementet, inkl.
 *    brutto runde-for-runde-score for ALLE deltagere (ikke bare spilleren vi
 *    startet fra) — dette er hva `syncWagrResults`-scriptet bruker til å
 *    oppdage nye norske spillere organisk (event → alle norske entries).
 */

import { z } from "zod";

const USER_AGENT = "AK Golf HQ wagr-sync (kontakt: akgolfgroup@gmail.com)";
const API_BASE = "https://worldgolfranking2021api.wagr.com/api/wagr";
const SITE_BASE = "https://www.wagr.com";
const FETCH_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// getPlayerEvents — turneringsliste for én spiller
// ---------------------------------------------------------------------------

const PlayerEventSchema = z.object({
  eventId: z.number(),
  eventName: z.string(),
  weekYear: z.string().nullish(),
  finishPosition: z.string().nullish(),
  eventDetailsLink: z.string(),
});

const PlayerEventsResponseSchema = z.object({
  playerProfileEvents: z.array(PlayerEventSchema),
});

export type WagrPlayerEvent = z.infer<typeof PlayerEventSchema>;

/** Hent alle turneringer (counting events) en WAGR-spiller har registrert. */
export async function getPlayerEvents(
  wagrPlayerId: number,
  opts: { pageSize?: number } = {},
): Promise<WagrPlayerEvent[]> {
  const pageSize = opts.pageSize ?? 100;
  const url = `${API_BASE}/playerprofile/getPlayerEvents?profileId=${wagrPlayerId}&tab=Counting&pageSize=${pageSize}&pageNumber=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`wagr getPlayerEvents ${wagrPlayerId} → HTTP ${res.status}`);
  const json = await res.json();
  const parsed = PlayerEventsResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error(`wagr getPlayerEvents ${wagrPlayerId}: uventet responsformat`);
  return parsed.data.playerProfileEvents;
}

// ---------------------------------------------------------------------------
// getEventLeaderboard — full leaderboard for ett event (fra __NEXT_DATA__)
// ---------------------------------------------------------------------------

const EventDetailsSchema = z.object({
  eventName: z.string(),
  eventStartDate: z.string().nullish(),
  eventEndDate: z.string().nullish(),
  country: z.string().nullish(),
  gender: z.string().nullish(),
  organiserName: z.string().nullish(),
  strokeplayRounds: z.number().nullish(),
});

const RoundScoreSchema = z.object({
  roundNumber: z.union([z.string(), z.number()]),
  score: z.union([z.string(), z.number()]).nullable(),
});

const EventResultRowSchema = z.object({
  playerId: z.number(),
  playerName: z.string(),
  nationality: z.string().nullish(),
  finishPosition: z.string().nullish(),
  totalScore: z.union([z.string(), z.number()]).nullable(),
  points: z.union([z.string(), z.number()]).nullish(),
  roundByRoundScores: z.array(RoundScoreSchema).nullish(),
});

const EventPageDataSchema = z.object({
  props: z.object({
    pageProps: z.object({
      eventDetailsData: z.object({
        eventDetails: EventDetailsSchema,
      }),
      eventResultsData: z.object({
        eventResults: z.object({
          results: z.array(EventResultRowSchema),
        }),
      }),
    }),
  }),
});

export type WagrEventDetails = {
  eventName: string;
  startDate: Date | null;
  endDate: Date | null;
  country: string | null;
  gender: string | null;
  organiserName: string | null;
};

export type WagrEventResultRow = {
  wagrPlayerId: number;
  playerName: string;
  nationality: string | null;
  finishPosition: string | null;
  totalScore: number | null;
  /** Brutto-score per runde, indeksert fra 0 (R1, R2, …). null = ikke spilt. */
  roundScores: (number | null)[];
};

function toNumber(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function toDate(v: string | null | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Hent full leaderboard for ett WAGR-event. `eventDetailsLink` er slug-en fra
 * WagrPlayerEvent.eventDetailsLink (f.eks. "garmin-norgescup-3--270088").
 * Returnerer null hvis siden ikke finnes (404/redirect) eller mangler data.
 */
export async function getEventLeaderboard(
  eventDetailsLink: string,
): Promise<{ details: WagrEventDetails; results: WagrEventResultRow[] } | null> {
  const res = await fetch(`${SITE_BASE}/events/${eventDetailsLink}`, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "manual",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;

  const html = await res.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) return null;

  const parsed = EventPageDataSchema.safeParse(JSON.parse(match[1]));
  if (!parsed.success) return null;

  const { eventDetails } = parsed.data.props.pageProps.eventDetailsData;
  const { results } = parsed.data.props.pageProps.eventResultsData.eventResults;

  return {
    details: {
      eventName: eventDetails.eventName.trim(),
      startDate: toDate(eventDetails.eventStartDate),
      endDate: toDate(eventDetails.eventEndDate),
      country: eventDetails.country ?? null,
      gender: eventDetails.gender ?? null,
      organiserName: eventDetails.organiserName ?? null,
    },
    results: results.map((r) => ({
      wagrPlayerId: r.playerId,
      playerName: r.playerName.trim(),
      nationality: r.nationality ?? null,
      finishPosition: r.finishPosition ?? null,
      totalScore: toNumber(r.totalScore),
      roundScores: (r.roundByRoundScores ?? [])
        .sort((a, b) => Number(a.roundNumber) - Number(b.roundNumber))
        .map((rs) => toNumber(rs.score)),
    })),
  };
}

/** Deterministisk slug for en ny WAGR-spiller vi ikke har fra før: navn + wagrPlayerId. */
export function buildWagrPlayerSlug(playerName: string, wagrPlayerId: number): string {
  const base = playerName
    .toLowerCase()
    .replace(/[æä]/g, "a")
    .replace(/[øö]/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${wagrPlayerId}`;
}
