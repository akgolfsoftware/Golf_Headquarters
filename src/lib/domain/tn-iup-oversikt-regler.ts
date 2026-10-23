/**
 * Regler for IUP › Oversikt i Team Norway (pakke d, wireframes docs/design-system/utkast-tn/trenerflate).
 * Rene funksjoner uten database; hentingen ligger i tn-iup-oversikt.ts.
 */
import { PRIORITERTE, batteritestFor, fremdrift } from "@/lib/portal-tester/testbatteri";

/** WAGR-ID fra `public_players."wagrId"` (tekst) som tall, eller null når den mangler eller er ugyldig. */
export function tilWagrId(verdi: string | null | undefined): number | null {
  if (!verdi) return null;
  const n = Number(verdi.trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Forslag som kan bli avslått og skal vises i Haster: trenerforslag i Workbench og
 * turneringsforslag i Turneringsplan (A8).
 */
export const TN_FORSLAG_TYPER = ["WORKBENCH_COACH_PROPOSAL", "TOURNAMENT_PLAN_PROPOSAL"] as const;

export type TnIupTurnering = { navn: string; /** Null = ingen dato registrert; vises «Dato —» nederst. */ dato: Date | null; merke: string };

export type TnPaameldingRad = {
  entryStatus: string;
  manualName: string | null;
  manualDate: Date | null;
  tournament: { name: string; startDate: Date } | null;
  wagrPlanEvent: { name: string; startDate: Date } | null;
};

const PAAMELDING_STATUS: Record<string, string> = { PLANNED: "Planlagt", CLAIMED_REGISTERED: "Meldt på", CONFIRMED: "Bekreftet" };

/**
 * Neste turneringer i planen. Samme regel som Turneringsplan (A9): dato fra WAGR-turneringen, ellers
 * kalenderturneringen, ellers egen oppføring; oppføringer uten dato tas med og står nederst («Dato —»);
 * bare turneringer fra og med `iDag` (UTC-midnatt).
 */
export function velgNesteTurneringer(rader: readonly TnPaameldingRad[], iDag: Date, maks = 3): TnIupTurnering[] {
  return rader
    .map((p) => ({
      navn: p.wagrPlanEvent?.name ?? p.tournament?.name ?? p.manualName ?? "Turnering",
      dato: p.wagrPlanEvent?.startDate ?? p.tournament?.startDate ?? p.manualDate ?? null,
      merke: PAAMELDING_STATUS[p.entryStatus] ?? p.entryStatus,
    }))
    .filter((t) => t.dato === null || t.dato.getTime() >= iDag.getTime())
    .sort((a, b) => (a.dato?.getTime() ?? Infinity) - (b.dato?.getTime() ?? Infinity))
    .slice(0, maks);
}

export type TnIupHasterRad = { tekst: string; merke: string };

export type TnIupHasterInn = {
  /** Spillerens TN-tester (null når de ikke er delt). Antall teller alle gyldige forsøk. */
  tester: { testId: string; protokollNavn: string; antall: number }[] | null;
  /** Forslag spilleren har avslått siste 14 dager (null når de ikke er delt). */
  avslatteForslag: { avslatt: Date }[] | null;
  lisens: { aar: number; ubetalt: boolean } | null;
  helseattestUtloper: Date | null;
  naa: Date;
};

const DAG_MANED = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
/** «19.10» i Oslo-tid. */
const DATO = {
  format: (d: Date) => {
    const deler = DAG_MANED.formatToParts(d);
    const del = (type: string) => deler.find((p) => p.type === type)?.value ?? "";
    return `${del("day").padStart(2, "0")}.${del("month").padStart(2, "0")}`;
  },
};

/**
 * «Haster» øverst i Oversikt: avslåtte forslag, prioriterte tester under minsteantallet,
 * ubetalt lisens og helseattest som er utløpt eller går ut innen 30 dager. Tom liste når ingenting haster.
 */
export function byggIupHaster(inn: TnIupHasterInn): TnIupHasterRad[] {
  const rader: TnIupHasterRad[] = [];

  for (const f of inn.avslatteForslag ?? []) {
    rader.push({ tekst: `Forslag avslått ${DATO.format(f.avslatt)}`, merke: "Svar" });
  }

  if (inn.tester) {
    const tatt = new Map<string, number>();
    for (const t of inn.tester) {
      const b = batteritestFor({ id: t.testId, name: t.protokollNavn });
      if (b) tatt.set(b.id, (tatt.get(b.id) ?? 0) + t.antall);
    }
    for (const p of PRIORITERTE) {
      const antall = tatt.get(p.id) ?? 0;
      if (p.minst != null && antall < p.minst) {
        rader.push({ tekst: `${p.navn}: ${fremdrift(p, antall)} tatt`, merke: `Mangler ${p.minst - antall}` });
      }
    }
  }

  if (inn.lisens?.ubetalt) rader.push({ tekst: `Lisens ${inn.lisens.aar} er ikke betalt`, merke: "Mangler" });

  if (inn.helseattestUtloper) {
    const dager = Math.floor((inn.helseattestUtloper.getTime() - inn.naa.getTime()) / 864e5);
    if (dager < 0) rader.push({ tekst: "Helseattesten er utløpt", merke: "Utløpt" });
    else if (dager <= 30) rader.push({ tekst: `Helseattesten går ut ${DATO.format(inn.helseattestUtloper)}`, merke: `${dager} dager` });
  }

  return rader;
}
