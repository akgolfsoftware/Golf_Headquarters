/** Felles, ren kalender-/querytolking for spiller og trener. Ingen datatilgang. */
import { parseVisning, type WbVisning } from "./visning-url";

export type PlanReferanse = {
  uke?: string;
  aar?: string;
  maned?: string;
  periode?: string;
  okt?: string;
};

export type PlanQuery = Record<string, string | string[] | undefined>;
type QueryKilde = PlanQuery | { get(name: string): string | null };
type PeriodeDatoer = { id?: string; startDate: string; endDate: string };

export function queryVerdi(query: QueryKilde, navn: string): string | undefined {
  if ("get" in query && typeof query.get === "function") return query.get(navn) ?? undefined;
  const verdi = (query as PlanQuery)[navn];
  return Array.isArray(verdi) ? verdi[0] : verdi;
}

/** Avviser normalisering av f.eks. 31. februar til en dag i mars. */
export function gyldigPlanDato(raw: string | undefined): string | undefined {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw) || raw.startsWith("0000-")) return undefined;
  const dato = new Date(`${raw}T12:00:00Z`);
  return Number.isFinite(dato.getTime()) && dato.toISOString().slice(0, 10) === raw ? raw : undefined;
}

export function osloPlanDato(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(now);
}

function flyttDager(iso: string, dager: number): string {
  const dato = new Date(`${iso}T12:00:00Z`);
  dato.setUTCDate(dato.getUTCDate() + dager);
  return dato.toISOString().slice(0, 10);
}

function mandag(iso: string): string {
  const dag = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return flyttDager(iso, dag === 0 ? -6 : 1 - dag);
}

/** Flytter kalenderuker, uavhengig av serverens tidssone og 23-/25-timersdøgn. */
export function flyttPlanUke(uke: string, antall: number): string {
  const dato = gyldigPlanDato(uke);
  if (!dato || !Number.isSafeInteger(antall)) throw new Error("Ugyldig uke eller ukeflytting");
  return flyttDager(mandag(dato), antall * 7);
}

export function planIsoUke(dato: string): { year: number; week: number } {
  const torsdag = flyttDager(mandag(dato), 3);
  const year = Number(torsdag.slice(0, 4));
  const forsteMandag = mandag(`${year}-01-04`);
  return { year, week: 1 + Math.round((Date.parse(torsdag) - Date.parse(forsteMandag)) / 604_800_000) };
}

function gyldigManed(raw?: string): string | undefined {
  return raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) && gyldigPlanDato(`${raw}-01`) ? raw : undefined;
}

function gyldigAar(raw?: string): number | undefined {
  return raw && /^\d{4}$/.test(raw) && Number(raw) >= 2000 && Number(raw) <= 2100 ? Number(raw) : undefined;
}

export type PlanKontekst = {
  visning: WbVisning;
  weekStart: string;
  monthStart: string;
  year: number;
  isoWeekYear: number;
  weekNumber: number;
  harValgtUke: boolean;
  referanse: PlanReferanse;
};

/**
 * Eksplisitt uke vinner. Uten uke beholdes dagens uke i valgt måned/periode,
 * ellers brukes starten på det valgte tidsrommet. Offset brukes én gang,
 * relativt til norsk inneværende uke, og blir deretter en absolutt dato i URL.
 * Periodegrenser må komme fra en allerede autorisert leser, aldri fra URL.
 */
export function parsePlanKontekst(
  query: QueryKilde,
  options: { now?: Date; periode?: PeriodeDatoer | null } = {},
): PlanKontekst {
  const idag = osloPlanDato(options.now);
  const rawUke = queryVerdi(query, "uke");
  const maned = gyldigManed(queryVerdi(query, "maned"));
  const aar = gyldigAar(queryVerdi(query, "aar"));
  let anker = gyldigPlanDato(rawUke);
  if (!anker && rawUke?.trim() && Number.isFinite(Number(rawUke))) {
    const offset = Math.max(-52, Math.min(52, Math.trunc(Number(rawUke))));
    anker = flyttPlanUke(idag, offset);
  }
  const harValgtUke = Boolean(anker);
  const periode = options.periode;
  const start = gyldigPlanDato(periode?.startDate);
  const slutt = gyldigPlanDato(periode?.endDate);
  if (!anker && start && slutt && start <= slutt) anker = idag >= start && idag <= slutt ? idag : start;
  if (!anker && maned) anker = idag.startsWith(maned) ? idag : `${maned}-01`;
  if (!anker && aar) anker = idag.startsWith(String(aar)) ? idag : `${aar}-01-01`;
  anker ??= idag;
  const weekStart = mandag(anker);
  const iso = planIsoUke(weekStart);
  const valgtManed = maned ?? flyttDager(weekStart, 3).slice(0, 7);
  const year = aar ?? (maned ? Number(maned.slice(0, 4)) : iso.year);
  return {
    visning: parseVisning(queryVerdi(query, "niva") ?? queryVerdi(query, "vis")),
    weekStart,
    monthStart: `${valgtManed}-01`,
    year,
    isoWeekYear: iso.year,
    weekNumber: iso.week,
    harValgtUke,
    referanse: {
      uke: weekStart,
      aar: String(year),
      maned: valgtManed,
      periode: periode?.id ?? (queryVerdi(query, "periode") || undefined),
      okt: queryVerdi(query, "okt") || undefined,
    },
  };
}
