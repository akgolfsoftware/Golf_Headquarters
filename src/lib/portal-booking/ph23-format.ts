/**
 * Datoformat for PH-23 Booking.
 *
 * Bookinger lagres som «naiv veggklokke»: feltene på Date-objektet (getHours osv.) er klokkeslettet på
 * veggen, se google-calendar-tid.ts. Serveren formaterer derfor med Date-ens egne felt (`naiv*`).
 * Tider som sendes til klienten er ISO-tekst uten Z (`fraNaivVeggklokke`); `iso*` leser feltene ut
 * av teksten, så server og klient gir samme klokkeslett uansett tidssone.
 */
import { startOfDay } from "@/lib/uke-helpers";

const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const nb = (d: Date, o: Intl.DateTimeFormatOptions, tz?: string) => new Intl.DateTimeFormat("nb-NO", { ...(tz ? { timeZone: tz } : {}), ...o }).format(d);

export const naivDatoLang = (d: Date) => stor(nb(d, { weekday: "long", day: "numeric", month: "long" }));
export const naivDatoKort = (d: Date) => stor(nb(d, { weekday: "short", day: "numeric", month: "short" }));
export const naivKlokke = (d: Date) => nb(d, { hour: "2-digit", minute: "2-digit" });

/** «2026-10-05T15:00:00» (uten Z) → Date med feltene i UTC, formatert i UTC. */
function fraIso(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso);
  if (!m) return new Date(iso);
  return new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +(m[4] ?? 0), +(m[5] ?? 0)));
}
export const isoDatoKort = (iso: string) => stor(nb(fraIso(iso), { weekday: "short", day: "numeric", month: "short" }, "UTC"));
export const isoKlokke = (iso: string) => nb(fraIso(iso), { hour: "2-digit", minute: "2-digit" }, "UTC");
export const isoDagMnd = (iso: string) => nb(fraIso(iso), { day: "2-digit", month: "short" }, "UTC");
/** «Klokkeslett har passert»-sammenligning mot nå, i Oslo-tid. */
export const isoTilNaa = (iso: string): number => fraIso(iso).getTime() - Date.parse(new Date().toLocaleString("sv-SE", { timeZone: "Europe/Oslo" }).replace(" ", "T") + "Z");

export function kr(ore: number): string {
  return `${new Intl.NumberFormat("nb-NO").format(Math.round(ore / 100)).replace(/ /g, " ")} kr`;
}

const UKEDAG = ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"];
export type PH23Dag = { iso: string; ukedag: string; dag: number; mnd: string; aktiv: boolean };

/** De neste `antall` dagene fra og med i dag (serverens dagsgrense, samme regel som før), med valgt dag markert. */
export function dagerFremover(antall: number, valgt: Date): PH23Dag[] {
  const idag = startOfDay(new Date());
  return Array.from({ length: antall }, (_, i) => {
    const d = new Date(idag);
    d.setDate(idag.getDate() + i);
    return {
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      ukedag: UKEDAG[d.getDay()]!,
      dag: d.getDate(),
      mnd: d.toLocaleDateString("nb-NO", { month: "short" }),
      aktiv: d.getFullYear() === valgt.getFullYear() && d.getMonth() === valgt.getMonth() && d.getDate() === valgt.getDate(),
    };
  });
}
