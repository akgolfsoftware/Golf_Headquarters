/**
 * TrackMan-økt fra delingslenke (Anders 23.10.2026): spilleren eller coachen limer inn lenken TrackMan gir
 * (tm-short.me/…), og appen henter alle slag og alle tall fra TrackMans åpne rapport.
 *
 * Slik virker lenken: tm-short.me sender videre (302) til web-dynamic-reports.trackmangolf.com med rapport-id
 * i parameteren `r`. Selve tallene ligger bak TrackMans rapport-API, som svarer uten innlogging.
 *
 * Sikkerhet: bare to vertsnavn godtas inn, videresendingen følges for hånd og bare til TrackMans egen rapportside,
 * og vi kaller bare én fast adresse hos TrackMan. Svaret valideres med zod og har tidsgrense og størrelsesgrense.
 * Spillernavn og konto-id fra TrackMan lagres aldri (personvern).
 */
import { z } from "zod";
import type { TrackManShot } from "@/lib/trackman/parse-csv";

const KORTLENKE_VERT = "tm-short.me";
const RAPPORT_VERT = "web-dynamic-reports.trackmangolf.com";
const RAPPORT_API = "https://golf-player-activities.trackmangolf.com/api/reports/getreport";
const TIDSGRENSE_MS = 10_000;
const MAKS_BYTES = 5_000_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class TrackManLenkeFeil extends Error {}

/** Rapport-id fra en direkte rapportadresse, eller null. */
export function rapportIdFraAdresse(adresse: string): string | null {
  let url: URL;
  try {
    url = new URL(adresse);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== RAPPORT_VERT) return null;
  const r = url.searchParams.get("r");
  return r && UUID.test(r) ? r : null;
}

/** Sjekker at teksten er en TrackMan-lenke appen godtar. Kaster med norsk melding ellers. */
export function tolkTrackManLenke(tekst: string): { type: "kort"; url: URL } | { type: "rapport"; id: string } {
  let url: URL;
  try {
    url = new URL(tekst.trim());
  } catch {
    throw new TrackManLenkeFeil("Det ser ikke ut som en lenke. Lim inn hele lenken fra TrackMan.");
  }
  if (url.protocol !== "https:") throw new TrackManLenkeFeil("Lenken må starte med https://.");
  if (url.hostname === KORTLENKE_VERT && /^\/[A-Za-z0-9]{3,32}$/.test(url.pathname)) return { type: "kort", url };
  const id = rapportIdFraAdresse(url.toString());
  if (id) return { type: "rapport", id };
  throw new TrackManLenkeFeil("Bare delingslenker fra TrackMan virker (tm-short.me/…).");
}

type Henter = typeof fetch;

/** Finner rapport-id-en bak en lenke. Følger bare én videresending, og bare til TrackMans rapportside. */
export async function finnRapportId(tekst: string, hent: Henter = fetch): Promise<string> {
  const tolket = tolkTrackManLenke(tekst);
  if (tolket.type === "rapport") return tolket.id;
  const svar = await hent(tolket.url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(TIDSGRENSE_MS) });
  const videre = svar.headers.get("location");
  const id = videre ? rapportIdFraAdresse(videre) : null;
  if (!id) throw new TrackManLenkeFeil("Fant ingen TrackMan-rapport bak lenken. Sjekk at lenken er riktig.");
  return id;
}

const Tall = z.number().finite().nullish();
const MaalingSchema = z
  .object({
    ClubSpeed: Tall, BallSpeed: Tall, SmashFactor: Tall, AttackAngle: Tall, ClubPath: Tall, FaceAngle: Tall,
    FaceToPath: Tall, DynamicLoft: Tall, LaunchAngle: Tall, LaunchDirection: Tall, SpinRate: Tall, SpinAxis: Tall,
    Carry: Tall, Total: Tall, CarrySide: Tall, MaxHeight: Tall, LandingAngle: Tall,
  })
  .passthrough();
const SlagSchema = z
  .object({
    Id: z.string(),
    Time: z.string(),
    Club: z.string().nullish(),
    Measurement: MaalingSchema,
    MeasurementDetails: z
      .object({
        ClubClassification: z.object({ ClassifiedClubType: z.string().nullish() }).passthrough().nullish(),
        ImpactLocation: z
          .object({ ClubConfiguration: z.object({ StaticLoft: Tall }).passthrough().nullish() })
          .passthrough()
          .nullish(),
      })
      .passthrough()
      .nullish(),
  })
  .passthrough();
const RapportSchema = z
  .object({
    Kind: z.string().nullish(),
    StrokeGroups: z.array(z.object({ Date: z.string().nullish(), Club: z.string().nullish(), Strokes: z.array(SlagSchema) }).passthrough()),
  })
  .passthrough();
export type TrackManApiRapport = z.infer<typeof RapportSchema>;

/** Henter rapporten fra TrackMan og validerer den. */
export async function hentTrackManRapport(rapportId: string, hent: Henter = fetch): Promise<TrackManApiRapport> {
  if (!UUID.test(rapportId)) throw new TrackManLenkeFeil("Ugyldig rapport-id.");
  const svar = await hent(RAPPORT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ReportId: rapportId }),
    redirect: "error",
    signal: AbortSignal.timeout(TIDSGRENSE_MS),
  });
  if (!svar.ok) throw new TrackManLenkeFeil("TrackMan svarte ikke. Prøv igjen om litt.");
  const tekst = await svar.text();
  if (tekst.length > MAKS_BYTES) throw new TrackManLenkeFeil("Rapporten er for stor til å hentes.");
  let json: unknown;
  try {
    json = JSON.parse(tekst);
  } catch {
    throw new TrackManLenkeFeil("TrackMan sendte et svar appen ikke kan lese.");
  }
  const tolket = RapportSchema.safeParse(json);
  if (!tolket.success) throw new TrackManLenkeFeil("TrackMan sendte et svar appen ikke kan lese.");
  return tolket.data;
}

/** TrackMans køllekoder til appens navn («4Iron» → «4-jern»). Ukjente koder står som de er. */
export function kolleNavn(kode: string | null | undefined): string {
  const k = (kode ?? "").trim();
  if (!k) return "Ukjent";
  const fast: Record<string, string> = {
    Driver: "Driver", PitchingWedge: "PW", GapWedge: "GW", SandWedge: "SW", LobWedge: "LW", Putter: "Putter",
  };
  if (fast[k]) return fast[k];
  const m = /^(\d+)(Wood|Hybrid|Iron)$/.exec(k);
  if (m) return `${m[1]}-${m[2] === "Wood" ? "tre" : m[2] === "Hybrid" ? "hybrid" : "jern"}`;
  return k;
}

/** Hvilken klasse TrackMan selv mener en køllekode hører til. */
function forventetKlasse(kode: string): string | null {
  if (kode === "Driver") return "Driver";
  if (/Wood$/.test(kode)) return "Wood";
  if (/Hybrid$/.test(kode)) return "Hybrid";
  if (/Wedge$/.test(kode)) return "Wedge";
  const m = /^(\d+)Iron$/.exec(kode);
  if (m) return Number(m[1]) <= 5 ? "LongIron" : "ShortIron";
  return null;
}

export type TrackManLenkeOkt = {
  /** Første slag, som ISO-tid. */
  startetAt: string | null;
  sluttetAt: string | null;
  slag: TrackManShot[];
  /** Rapporten uten spillernavn og konto-id-er. Lagres som rawJson. */
  rapport: unknown;
  /** Køller der TrackMans egen gjenkjenning ikke stemmer med kølla som var valgt. */
  varsler: string[];
};

const KLASSE_NAVN: Record<string, string> = {
  Driver: "driver", Wood: "fairwaykølle", Hybrid: "hybrid", LongIron: "langt jern", ShortIron: "kort jern", Wedge: "wedge",
};

/** Gjør TrackMan-rapporten om til slag i samme form som CSV-importen (fart i m/s, avstand i meter). */
export function rapportTilOkt(rapport: TrackManApiRapport): TrackManLenkeOkt {
  const alle = rapport.StrokeGroups.flatMap((g) => g.Strokes.map((s) => ({ g, s })));
  alle.sort((a, b) => a.s.Time.localeCompare(b.s.Time));
  const slag: TrackManShot[] = alle.map(({ g, s }) => {
    const m = s.Measurement;
    return {
      club: kolleNavn(s.Club ?? g.Club),
      clubSpeedMps: m.ClubSpeed ?? null,
      ballSpeedMps: m.BallSpeed ?? null,
      smashFactor: m.SmashFactor ?? null,
      carryMeters: m.Carry ?? null,
      totalMeters: m.Total ?? null,
      launchAngleDeg: m.LaunchAngle ?? null,
      launchDirectionDeg: m.LaunchDirection ?? null,
      spinRateRpm: m.SpinRate ?? null,
      sideMeters: m.CarrySide ?? null,
      attackAngleDeg: m.AttackAngle ?? null,
      clubPathDeg: m.ClubPath ?? null,
      faceAngleDeg: m.FaceAngle ?? null,
      faceToPathDeg: m.FaceToPath ?? null,
      notes: null,
      sourceUnits: { clubSpeed: "m/s", ballSpeed: "m/s", carry: "m", total: "m", side: "m" },
    };
  });

  const varsler: string[] = [];
  for (const g of rapport.StrokeGroups) {
    const kode = (g.Club ?? "").trim();
    const forventet = forventetKlasse(kode);
    if (!forventet || g.Strokes.length === 0) continue;
    const klasser = g.Strokes.map((s) => s.MeasurementDetails?.ClubClassification?.ClassifiedClubType).filter(Boolean) as string[];
    const avvik = klasser.filter((k) => k !== forventet).length;
    if (klasser.length === 0 || avvik * 2 <= klasser.length) continue;
    const vanligst = [...new Set(klasser)].sort((a, b) => klasser.filter((k) => k === b).length - klasser.filter((k) => k === a).length)[0];
    const lofter = g.Strokes.map((s) => s.MeasurementDetails?.ImpactLocation?.ClubConfiguration?.StaticLoft).filter((v): v is number => typeof v === "number");
    const loft = lofter.length ? Math.round((lofter.sort((a, b) => a - b)[Math.floor(lofter.length / 2)] * 180) / Math.PI) : null;
    varsler.push(
      `TrackMan merket ${g.Strokes.length} slag «${kolleNavn(kode)}», men slagene ligner ${KLASSE_NAVN[vanligst] ?? vanligst}${loft ? ` (loft ${loft}°)` : ""}. Sjekk kølla.`,
    );
  }

  return {
    startetAt: alle[0]?.s.Time ?? null,
    sluttetAt: alle.at(-1)?.s.Time ?? null,
    slag,
    rapport: utenPersondata(rapport),
    varsler,
  };
}

/** Fjerner spillernavn, spiller-id, konto og klient fra rapporten før den lagres. */
export function utenPersondata(rapport: TrackManApiRapport): unknown {
  const { StrokeGroups, Kind } = rapport;
  return {
    Kind: Kind ?? null,
    kilde: "trackman-lenke",
    StrokeGroups: StrokeGroups.map(({ Date, Club, Strokes }) => ({ Date: Date ?? null, Club: Club ?? null, Strokes })),
  };
}

/** Hele veien fra lenke til økt. */
export async function hentOktFraLenke(tekst: string, hent: Henter = fetch): Promise<TrackManLenkeOkt> {
  const id = await finnRapportId(tekst, hent);
  const rapport = await hentTrackManRapport(id, hent);
  const okt = rapportTilOkt(rapport);
  if (okt.slag.length === 0) throw new TrackManLenkeFeil("Rapporten har ingen slag.");
  return okt;
}
