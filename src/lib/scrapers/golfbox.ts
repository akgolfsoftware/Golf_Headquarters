/**
 * GolfBox livescoring-klient.
 *
 * GolfBox eksponerer offentlige JSON-handlere på scores.golfbox.dk (samme data
 * som livescoring-widgetene bruker). Ingen innlogging, ingen robots-restriksjon
 * på scores.golfbox.dk. Vi henter terminliste + leaderboard for norske kunder.
 *
 * Verifisert 2026-06-01 — se docs/turnering-datakilder.md (§ VERIFISERT).
 *
 * Hver klubb OG hver tour er en numerisk CustomerId. Enumerering:
 *   GetCustomer → (filtrer NO/NGF) → GetSchedule → competition-IDer → GetLeaderboard.
 *
 * VIKTIG: responsene bruker JS-literaler (!0/!1) i stedet for true/false.
 * parseGolfBox() normaliserer dette før JSON.parse.
 */

import { z } from "zod";

const BASE = "https://scores.golfbox.dk";
const USER_AGENT = "AKGolfBot/1.0 (+akgolf.no)";

// Språk-koder GolfBox bruker (LCID). 1044 = norsk, 2057 = engelsk (UK).
export const LANG_NO = 1044;
export const LANG_EN = 2057;

// Snill mot kilden: minimum pause mellom kall.
const MIN_DELAY_MS = 400;
let lastCall = 0;

async function throttle(): Promise<void> {
  const wait = MIN_DELAY_MS - (Date.now() - lastCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
}

/**
 * GolfBox returnerer minifisert JS-aktig JSON: `!0`/`!1` i stedet for true/false.
 * Normaliser før parsing. Tokenene opptrer kun som verdier (`:!0`, `,!0`, `[!0`).
 */
export function parseGolfBox<T = unknown>(text: string): T {
  // Hopp over strenger: et turneringsnavn kan selv inneholde «:!0,».
  const normalized = text.replace(/"(?:\\.|[^"\\])*"|!([01])/g,
    (token, value: string | undefined) => value === undefined ? token : value === "0" ? "true" : "false");
  return JSON.parse(normalized) as T;
}

async function fetchHandler<T>(path: string): Promise<T> {
  await throttle();
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    throw new Error(`[golfbox] ${path} → HTTP ${res.status}`);
  }
  const text = await res.text();
  const data = parseGolfBox<{ IsError?: boolean; ErrorMessage?: string }>(text);
  if (data && typeof data === "object" && data.IsError) {
    throw new Error(`[golfbox] ${path} → ${data.ErrorMessage ?? "remote error"}`);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// GetCustomer — kundeinfo (klubb eller tour)
// ---------------------------------------------------------------------------

// GetCustomer pakker info under "Customer" (GetSchedule bruker "CustomerData").
const CustomerSchema = z.object({
  Customer: z.object({
    CustomerID: z.number(),
    Name: z.string(),
    GolfUnion: z.string().nullable().optional(),
    Nationality: z.string().nullable().optional(),
  }),
});

export type GolfBoxCustomer = {
  id: number;
  name: string;
  golfUnion: string | null;
  nationality: string | null;
};

export async function getCustomer(
  customerId: number,
): Promise<GolfBoxCustomer | null> {
  try {
    const raw = await fetchHandler<unknown>(
      `/Handlers/CustomersHandler/GetCustomer/CustomerId/${customerId}/language/${LANG_NO}`,
    );
    const parsed = CustomerSchema.safeParse(raw);
    if (!parsed.success) return null;
    const c = parsed.data.Customer;
    return {
      id: c.CustomerID,
      name: c.Name,
      golfUnion: c.GolfUnion ?? null,
      nationality: c.Nationality ?? null,
    };
  } catch {
    return null; // CUSTOMER_NOT_FOUND m.m. → hopp over
  }
}

// ---------------------------------------------------------------------------
// GetSchedule — terminliste per kunde (sesong → måned → events)
// ---------------------------------------------------------------------------

const SignupInformationSchema = z
  .object({
    EnableOnlineEntry: z.boolean().optional(),
    EntryOpens: z.string().nullable().optional(),
    EntryCloses: z.string().nullable().optional(),
    EntryWindowOpen: z.boolean().optional(),
  })
  .nullable()
  .optional();

const ScheduleEntrySchema = z.object({
  ID: z.number(),
  Name: z.string(),
  Type: z.string().optional(),
  StartDate: z.string().optional(),
  EndDate: z.string().optional(),
  VenueName: z.string().nullable().optional(),
  SignupInformation: SignupInformationSchema,
});

export type GolfBoxScheduleEvent = {
  competitionId: number;
  name: string;
  type: string | null;
  startDate: Date | null;
  endDate: Date | null;
  venue: string | null;
  /** Påmeldingsfrist (UTC midnatt for datoen i feeden). */
  entryCloses: Date | null;
  entryOpens: Date | null;
};

// GolfBox-datoformat: "20260214T000000"
export function parseGolfBoxDate(s: string | undefined | null): Date | null {
  if (!s || s.length < 8) return null;
  const y = +s.slice(0, 4);
  const m = +s.slice(4, 6);
  const d = +s.slice(6, 8);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return isNaN(date.getTime()) || date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d ? null : date;
}

export async function getSchedule(
  customerId: number,
): Promise<GolfBoxScheduleEvent[]> {
  const raw = await fetchHandler<{ CompetitionData?: unknown }>(
    `/Handlers/ScheduleHandler/GetSchedule/CustomerId/${customerId}/language/${LANG_NO}`,
  );

  const events: GolfBoxScheduleEvent[] = [];
  const seasons = (raw?.CompetitionData ?? {}) as Record<string, unknown>;

  // Struktur: CompetitionData → S{år} → Months → M{n} → Entries → E{id}
  for (const season of Object.values(seasons)) {
    const months = (season as { Months?: Record<string, unknown> })?.Months;
    if (!months) continue;
    for (const month of Object.values(months)) {
      const entries = (month as { Entries?: Record<string, unknown> })?.Entries;
      if (!entries) continue;
      for (const entry of Object.values(entries)) {
        const parsed = ScheduleEntrySchema.safeParse(entry);
        if (!parsed.success) continue;
        const e = parsed.data;
        events.push({
          competitionId: e.ID,
          name: e.Name,
          type: e.Type ?? null,
          startDate: parseGolfBoxDate(e.StartDate),
          endDate: parseGolfBoxDate(e.EndDate),
          venue: e.VenueName ?? null,
          entryCloses: parseGolfBoxDate(e.SignupInformation?.EntryCloses),
          entryOpens: parseGolfBoxDate(e.SignupInformation?.EntryOpens),
        });
      }
    }
  }
  return events;
}

// ---------------------------------------------------------------------------
// GetLeaderboard — full leaderboard (per spiller: posisjon, to-par, runder)
// ---------------------------------------------------------------------------

const ScoringToParSchema = z
  .object({
    ToParText: z.string().nullable().optional(),
    ToParValue: z.number().nullable().optional(),
    TodayText: z.string().nullable().optional(),
    HoleText: z.string().nullable().optional(),
    HoleValue: z.number().nullable().optional(),
  })
  .nullable()
  .optional();

const PositionSchema = z
  .object({
    Actual: z.number().nullable().optional(),
    Calculated: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const LeaderboardEntrySchema = z.object({
  Position: PositionSchema,
  ScoringToPar: ScoringToParSchema,
  FirstName: z.string().nullable().optional(),
  LastName: z.string().nullable().optional(),
  Nationality: z.string().nullable().optional(),
  BirthYear: z.number().nullable().optional(),
  ClubName: z.string().nullable().optional(),
  Wagr: z.unknown().optional(),
  IsAnonymous: z.boolean().optional(),
  // Rounds kan være dict (keyed) eller array — hold løst, normaliser i mapping.
  Rounds: z.unknown().optional(),
});

export type GolfBoxLeaderboardEntry = {
  position: number | null;
  positionText: string | null;
  toParText: string | null;
  toParValue: number | null;
  todayText: string | null;
  thru: number | null;
  thruText: string | null;
  firstName: string;
  lastName: string;
  nationality: string | null;
  birthYear: number | null;
  clubName: string | null;
  /** Klassenavn (f.eks. «Herrer», «Junior GU16») — hvitlisten for netto vs. brutto leser dette. */
  klasseNavn: string | null;
  /** Brutto-score per runde (R1, R2, …). null der ikke spilt. */
  roundScores: (number | null)[];
  roundToPar: (number | null)[];
  roundHoles: (number | null)[];
  roundCompleted: boolean[];
  /** Klasseplassering kan bygge på netto/poeng; da vises kun brutto rundescorer. */
  grossRanking: boolean;
};

export type GolfBoxLeaderboard = {
  competitionId: number;
  roundNames: string[];
  activeRound: number | null;
  isScoringOpen: boolean;
  entries: GolfBoxLeaderboardEntry[];
  failedClasses: number[];
};

// ToParValue er skalert ×10000 i feeden (-230000 = -23). Foretrekk teksten.
function toParToNumber(
  text: string | null | undefined,
  value: number | null | undefined,
): number | null {
  if (text != null && text !== "") {
    if (/^E$/i.test(text)) return 0;
    if (/^[+-]?\d+$/.test(text.trim())) return Number(text);
  }
  if (typeof value === "number" && Number.isSafeInteger(value / 10000)) return value / 10000;
  return null;
}

/**
 * AK Golf-regel: alltid brutto (ekte slag). Aldri netto.
 * GolfBox nett-klasser ender typisk på « N» / «N» (f.eks. «Scratch N»).
 * Eksportert for tester og andre importstier.
 */
export function erNettoKlasse(klasseNavn: string | null | undefined): boolean {
  if (!klasseNavn) return false;
  const t = klasseNavn.trim();
  // Eksakt «N», ender på « N», «-N», «(N)», « Net», « Netto»
  if (/^N$/i.test(t)) return true;
  if (/(?:\s|-)N\s*$/i.test(t)) return true;
  if (/\(N\)\s*$/i.test(t)) return true;
  if (/\bnetto\b/i.test(t)) return true;
  if (/\bnet\b/i.test(t) && !/\bnett?work\b/i.test(t)) return true;
  return false;
}

/** Score for ett hull: foretrekk Score.Text, ellers Score.Value (×10000-skalert hvis stor). */
function holeScoreValue(hole: unknown): number | null {
  if (!hole || typeof hole !== "object") return null;
  const score = (hole as Record<string, unknown>).Score;
  if (!score || typeof score !== "object") return null;
  const s = score as Record<string, unknown>;
  if (typeof s.Text === "string" && s.Text !== "") {
    const n = /^\d+$/.test(s.Text.trim()) ? Number(s.Text) : null;
    if (n != null && n > 0) return n;
  }
  if (typeof s.Value === "number" && s.Value > 0) {
    // Observert rå (4 = 4 slag), men vær robust mot ×10000-skalering.
    const n = s.Value >= 1000 ? s.Value / 10000 : s.Value;
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }
  return null;
}

/**
 * Bruttosum fra hullscorene (Rounds.R{n}.HoleScores.H{1..18}.Score) — for
 * turneringer (målt: Olyo/Østlandstour) der ResultSum mangler i feeden.
 * Summerer KUN H{n}-nøkler (hopper over H-OUT/H-IN-delsummer), og kun når
 * alle listede hull har score (ellers finnes ingen komplett bruttosum).
 */
export function sumHoleScores(round: unknown): number | null {
  if (!round || typeof round !== "object") return null;
  const r = round as Record<string, unknown>;
  if (r.IsCompleted === false) return null;
  const holeScores = r.HoleScores;
  if (!holeScores || typeof holeScores !== "object") return null;
  const holes = Array.isArray(holeScores)
    ? holeScores
    : Object.entries(holeScores as Record<string, unknown>)
        .filter(([key]) => /^H\d+$/.test(key))
        .map(([, hole]) => hole);
  const planned = r.Holes && typeof r.Holes === "object" ? Object.keys(r.Holes).filter(k => /^H\d+$/.test(k)).length : null;
  if (![9, 18].includes(holes.length) || (planned && planned !== holes.length)) return null;
  // Ni registrerte hull alene beviser ikke at en 18-hullsrunde er fullført.
  if (holes.length === 9 && r.IsCompleted !== true && planned !== 9) return null;
  let sum = 0;
  for (const hole of holes) {
    const n = holeScoreValue(hole);
    if (n == null) return null; // hull uten score → ufullstendig runde, ingen sum
    sum += n;
  }
  return sum;
}

/**
 * Brutto-score for runden: ResultSum.ActualText / ActualValue.
 * Bruker ALDRI NetText/NetValue — det er handicap-justert netto.
 * Fallback: summer hullscorene (se sumHoleScores) når ResultSum mangler.
 */
export function extractRoundScore(round: unknown): number | null {
  if (!round || typeof round !== "object") return null;
  const r = round as Record<string, unknown>;
  if (r.IsCompleted === false) return null;
  const holes = sumHoleScores(round);
  if (holes != null) return holes;
  // GolfBox ScoringMethod=0 er slagspill (kontrollert i offentlig feed).
  // For øvrige spilleformer er ResultSum ikke nødvendigvis antall slag.
  if (r.ScoringMethod != null && r.ScoringMethod !== 0) return null;
  const sum = r.ResultSum as Record<string, unknown> | undefined;
  if (sum) {
    // Eksplisitt: Actual = brutto. Ikke fall tilbake til Net*.
    if (typeof sum.ActualText === "string" && sum.ActualText !== "") {
      const n = /^\d+$/.test(sum.ActualText.trim()) ? Number(sum.ActualText) : null;
      if (n != null && n > 0) return n;
    }
    if (typeof sum.ActualValue === "number" && Number.isSafeInteger(sum.ActualValue / 10000) && sum.ActualValue > 0) return sum.ActualValue / 10000;
  }
  return sumHoleScores(round);
}

/** Klassenavn fra GolfBox-class-objekt eller dict-nøkkel. */
export function golfboxKlasseNavn(cls: unknown, dictKey?: string): string {
  if (cls && typeof cls === "object") {
    const o = cls as Record<string, unknown>;
    for (const k of ["Name", "ClassName", "Title", "DisplayName"]) {
      if (typeof o[k] === "string" && (o[k] as string).trim()) {
        return (o[k] as string).trim();
      }
    }
  }
  return (dictKey ?? "").trim();
}

// Rounds kommer som dict (keyed pr. runde) eller array. Normaliser til ordnet liste.
export function orderedGolfBoxRounds(rounds: unknown): unknown[] {
  if (!rounds || typeof rounds !== "object") return [];
  const out: unknown[] = [];
  for (const [key, value] of Object.entries(rounds)) {
    const number = value && typeof value === "object" && "Number" in value ? value.Number : undefined;
    const n = typeof number === "number" ? number : /^R\d+$/.test(key) ? Number(key.slice(1)) : Array.isArray(rounds) ? Number(key) + 1 : NaN;
    if (!Number.isSafeInteger(n) || n < 1 || n > 8) continue;
    while (out.length < n) out.push(null);
    out[n - 1] = value;
  }
  return out;
}

export function golfBoxRoundDetails(round: unknown) {
  const score = extractRoundScore(round);
  const r = round && typeof round === "object" ? round as Record<string, unknown> : {};
  const holes = r.Holes && typeof r.Holes === "object" ? Object.keys(r.Holes).filter(k => /^H\d+$/.test(k)).length : null;
  const holeRows = r.HoleScores && typeof r.HoleScores === "object"
    ? Object.entries(r.HoleScores).filter(([key]) => /^H\d+$/.test(key)).map(([, value]) => value as { Par?: unknown }) : [];
  const pars = holeRows.map(h => h?.Par);
  const par = pars.length > 0 && pars.every(p => typeof p === "number" && Number.isInteger(p) && p >= 3 && p <= 6)
    && sumHoleScores(round) != null ? (pars as number[]).reduce((a, b) => a + b, 0) : null;
  const sum = r.ResultSum as { ToParText?: string; ToParValue?: number } | undefined;
  const toPar = score == null ? null : par != null ? score - par : r.ScoringMethod === 0 ? toParToNumber(sum?.ToParText, sum?.ToParValue) : null;
  return { score, toPar, holes: holes && [9, 18].includes(holes) ? holes : null, completed: score != null && r.IsCompleted === true };
}

type RawLeaderboard = {
  IsScoringOpen?: boolean;
  RoundNames?: string[];
  ActiveRoundNumber?: number | null;
  Entries?: Record<string, unknown>;
};

type RawLeaderboardResponse = {
  CompetitionData?: { Classes?: unknown };
  Classes?: Record<string, unknown>;
};

// Klasselisten i CompetitionData (default-responsen) — én rad per klasse i turneringen.
const CompetitionClassSchema = z.object({
  Id: z.number(),
  Name: z.string().nullable().optional(),
  ShortName: z.string().nullable().optional(),
  ClassType: z.string().nullable().optional(),
});

export type GolfBoxCompetitionClass = {
  id: number;
  name: string;
  shortName: string;
  classType: string | null;
};

/** Alle klasser i turneringen, fra CompetitionData.Classes i leaderboard-responsen. */
export function parseCompetitionClasses(raw: unknown): GolfBoxCompetitionClass[] {
  const list = (raw as RawLeaderboardResponse | null)?.CompetitionData?.Classes;
  if (!Array.isArray(list)) return [];
  const out: GolfBoxCompetitionClass[] = [];
  for (const item of list) {
    const parsed = CompetitionClassSchema.safeParse(item);
    if (!parsed.success) continue;
    out.push({
      id: parsed.data.Id,
      name: (parsed.data.Name ?? "").trim(),
      shortName: (parsed.data.ShortName ?? "").trim(),
      classType: parsed.data.ClassType ?? null,
    });
  }
  return out;
}

/**
 * Individuelle spillerklasser å hente (ekskluderer kun lagklasser).
 *
 * VIKTIG: en GolfBox-klasse med «Netto» i navnet er ofte en EGEN divisjon med
 * eget, ikke-overlappende feltspillere (f.eks. Østlandstour: «Damer brutto» og
 * «Damer netto» er to ulike påmeldingslister, ikke samme spillere vist to
 * ganger) — ikke en duplikat-visning av brutto-klassen. Spillere som KUN er
 * meldt på i en nettoklasse må derfor også hentes, ellers forsvinner de helt
 * fra resultatene. AK-regelen «alltid brutto, aldri netto» håndheves i stedet
 * på score-nivå av extractRoundScore (bruker kun Actual*, aldri Net*) — ikke
 * ved å utelate hele klassen her.
 */
export function velgBruttoKlasser(
  classes: GolfBoxCompetitionClass[],
): GolfBoxCompetitionClass[] {
  return classes.filter((c) => c.classType == null || c.classType === "PlayerClass");
}

type LeaderboardAccumulator = {
  roundNames: string[];
  activeRound: number | null;
  isScoringOpen: boolean;
  entries: GolfBoxLeaderboardEntry[];
  seen: Map<string, number>;
};

/** Les entries fra en Classes-dict (default- eller per-klasse-respons) inn i akkumulatoren. */
function collectClasses(
  classes: Record<string, unknown> | undefined,
  acc: LeaderboardAccumulator,
  definitions: GolfBoxCompetitionClass[] = [],
): void {
  if (!classes) return;
  for (const [key, cls] of Object.entries(classes)) {
    const definition = definitions.find(d => String(d.id) === key.replace(/^C/, ""));
    if (definition?.classType && definition.classType !== "PlayerClass") continue;
    const lb = (cls as { Leaderboard?: RawLeaderboard } | null)?.Leaderboard;
    if (!lb) continue;
    // Dict-nøkkelen er en id («C123»), ikke et navn — kun klasseobjektets egne
    // navnefelt (Name/ClassName/Title/DisplayName) er brukbare her.
    const klasseNavn = golfboxKlasseNavn(cls) || definition?.name || null;
    if (Array.isArray(lb.RoundNames) && lb.RoundNames.length > acc.roundNames.length)
      acc.roundNames = lb.RoundNames;
    if (typeof lb.ActiveRoundNumber === "number") acc.activeRound = lb.ActiveRoundNumber;
    if (lb.IsScoringOpen) acc.isScoringOpen = true;

    const rawEntries =
      lb.Entries && typeof lb.Entries === "object"
        ? Object.values(lb.Entries)
        : [];
    for (const rawEntry of rawEntries) {
      const parsed = LeaderboardEntrySchema.safeParse(rawEntry);
      if (!parsed.success) continue;
      const e = parsed.data;
      if (e.IsAnonymous) continue;
      const firstName = (e.FirstName ?? "").trim();
      const lastName = (e.LastName ?? "").trim();
      // Samme spiller kan stå i flere klasser; foretrekk brutto-resultatet.
      const dedupeKey = `${firstName}|${lastName}|${e.BirthYear ?? ""}|${e.Nationality ?? ""}|${e.ClubName ?? ""}`.toLowerCase();
      if (!firstName && !lastName) continue;
      const stp = e.ScoringToPar ?? {};
      const rounds = orderedGolfBoxRounds(e.Rounds);
      while (rounds.length < Math.min(8, lb.RoundNames?.length ?? 0)) rounds.push(null);
      const details = rounds.map(golfBoxRoundDetails);
      const grossRanking = !erNettoKlasse(klasseNavn) && !erNettoKlasse(definition?.shortName)
        && rounds.every(r => !r || typeof r !== "object" || !("ScoringMethod" in r) || r.ScoringMethod === 0);
      const previous = acc.seen.get(dedupeKey);
      if (previous !== undefined && (acc.entries[previous].grossRanking || !grossRanking)) continue;
      const result: GolfBoxLeaderboardEntry = {
        position: grossRanking && e.Position?.Actual && Number.isSafeInteger(e.Position.Actual) && e.Position.Actual > 0 ? e.Position.Actual : null,
        positionText: e.Position?.Calculated ?? null,
        toParText: grossRanking ? stp.ToParText ?? null : null,
        toParValue: grossRanking ? toParToNumber(stp.ToParText, stp.ToParValue) : null,
        todayText: stp.TodayText ?? null,
        thru: typeof stp.HoleValue === "number" ? stp.HoleValue : null,
        thruText: stp.HoleText ?? null,
        firstName,
        lastName,
        nationality: e.Nationality ?? null,
        birthYear: e.BirthYear ?? null,
        clubName: e.ClubName ?? null,
        klasseNavn,
        roundScores: details.map(d => d.score),
        roundToPar: details.map(d => d.toPar),
        roundHoles: details.map(d => d.holes),
        roundCompleted: details.map(d => d.completed),
        grossRanking,
      };
      if (previous !== undefined) acc.entries[previous] = result;
      else { acc.seen.set(dedupeKey, acc.entries.length); acc.entries.push(result); }
    }
  }
}

/**
 * Full leaderboard for turneringen — ALLE brutto-klasser, ikke bare defaulten.
 *
 * GolfBox' default-respons inneholder typisk kun ÉN klasse (noen ganger ingen,
 * kun CompetitionData). Klasselisten ligger i CompetitionData.Classes, og hver
 * klasse hentes med path-varianten …/CompetitionId/{id}/ClassId/{classId}/….
 * Uten dette manglet alle jente-/øvrige klasser for Olyo/Srixon/Østlandstour
 * (målt 25.08.2026). Hvert klasse-kall går gjennom samme throttle (400 ms).
 */
export async function getLeaderboard(
  competitionId: number,
): Promise<GolfBoxLeaderboard | null> {
  const raw = await fetchHandler<RawLeaderboardResponse>(
    `/Handlers/LeaderboardHandler/GetLeaderboard/CompetitionId/${competitionId}/language/${LANG_EN}`,
  );

  const alleKlasser = parseCompetitionClasses(raw);
  const bruttoKlasser = velgBruttoKlasser(alleKlasser);
  const defaultClasses = raw?.Classes;
  if (!defaultClasses && bruttoKlasser.length === 0) return null;

  const acc: LeaderboardAccumulator = {
    roundNames: [],
    activeRound: null,
    isScoringOpen: false,
    entries: [],
    seen: new Map(),
  };

  // Klassene default-responsen allerede dekker (nøkkel «C{classId}»).
  // Hent brutto-visninger før netto-visninger når en spiller finnes i begge.
  const sortedDefault = Object.fromEntries(Object.entries(defaultClasses ?? {}).sort((a, b) => Number(erNettoKlasse(golfboxKlasseNavn(a[1]))) - Number(erNettoKlasse(golfboxKlasseNavn(b[1])))));
  collectClasses(sortedDefault, acc, alleKlasser);
  const dekket = new Set(
    Object.entries(defaultClasses ?? {}).filter(([, value]) => hasLeaderboard(value)).map(([k]) => k.replace(/^C/, "")),
  );

  const failedClasses: number[] = [];
  for (const cls of [...bruttoKlasser].sort((a, b) => Number(erNettoKlasse(a.name)) - Number(erNettoKlasse(b.name)))) {
    if (dekket.has(String(cls.id))) continue;
    try {
      const clsRaw = await fetchHandler<RawLeaderboardResponse>(
        `/Handlers/LeaderboardHandler/GetLeaderboard/CompetitionId/${competitionId}/ClassId/${cls.id}/language/${LANG_EN}`,
      );
      if (!hasLeaderboard(clsRaw?.Classes?.[`C${cls.id}`])) failedClasses.push(cls.id);
      collectClasses(clsRaw?.Classes, acc, alleKlasser);
    } catch {
      failedClasses.push(cls.id);
    }
  }

  return {
    competitionId,
    roundNames: acc.roundNames,
    activeRound: acc.activeRound,
    isScoringOpen: acc.isScoringOpen,
    entries: acc.entries,
    failedClasses,
  };
}

function hasLeaderboard(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const lb = (value as { Leaderboard?: RawLeaderboard }).Leaderboard;
  return !!lb && lb.Entries != null && typeof lb.Entries === "object";
}
