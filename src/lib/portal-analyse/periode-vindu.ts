/**
 * Tidsvinduer for Analyse-filteret (2026-07-27).
 *
 * Spilleren velger År · Måned · Periode · Uke · Dag, og hvert valg blir et
 * {fra, til}-vindu som treningshistorikken filtreres på. All dato-matte går
 * via uke-helpers, som er Oslo-korrekt — Vercel kjører UTC, og en rå
 * getDay()/setHours() ville lagt grensene på feil kalenderdag.
 *
 * «Periode» er spillerens egen treningsperiode fra årsplanen (PeriodBlock).
 * Finnes ingen aktiv periode, faller valget tilbake til måned — aldri en tom
 * skjerm uten forklaring.
 */
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  ukenummer,
} from "@/lib/uke-helpers";

export const PERIODE_VALG = ["dag", "uke", "maned", "periode", "aar"] as const;
export type PeriodeValg = (typeof PERIODE_VALG)[number];

export const PERIODE_LABEL: Record<PeriodeValg, string> = {
  dag: "Dag",
  uke: "Uke",
  maned: "Måned",
  periode: "Periode",
  aar: "År",
};

/** Aktiv treningsperiode fra årsplanen, når den finnes. */
export type AktivPeriode = {
  startDate: Date;
  endDate: Date;
  /** Klarspråk-navn, f.eks. «Grunnperiode». */
  navn?: string | null;
};

export type PeriodeVindu = {
  fra: Date;
  til: Date;
  /** Hva brukeren ser: «Uke 31», «August 2026», «Grunnperiode» … */
  label: string;
  /** Satt når «periode» ble valgt uten aktiv periode — vi viste måned i stedet. */
  fallback?: "ingen-periode";
};

const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

function stortForbokstav(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Regner ut vinduet for et periodevalg.
 *
 * @param valg     hva spilleren trykket på
 * @param naa      referansetidspunkt (som regel «nå»)
 * @param periode  spillerens aktive treningsperiode, om noen
 */
export function beregnPeriodeVindu(
  valg: PeriodeValg,
  naa: Date,
  periode?: AktivPeriode | null,
): PeriodeVindu {
  switch (valg) {
    case "dag":
      return {
        fra: startOfDay(naa),
        til: endOfDay(naa),
        label: naa.toLocaleDateString("nb-NO", {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: "Europe/Oslo",
        }),
      };

    case "uke":
      return {
        fra: startOfWeek(naa),
        til: endOfWeek(naa),
        label: `Uke ${ukenummer(naa)}`,
      };

    case "maned":
      return {
        fra: startOfMonth(naa),
        til: endOfMonth(naa),
        label: stortForbokstav(
          `${MANEDER[Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", month: "numeric" }).format(naa)) - 1]} ${new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric" }).format(naa)}`,
        ),
      };

    case "periode": {
      if (!periode) {
        // Ingen årsplan-periode å vise — fall tilbake til måned, og si fra.
        const m = beregnPeriodeVindu("maned", naa);
        return { ...m, fallback: "ingen-periode" };
      }
      return {
        fra: startOfDay(periode.startDate),
        til: endOfDay(periode.endDate),
        label: periode.navn?.trim() || "Perioden",
      };
    }

    case "aar":
    default:
      return {
        fra: startOfYear(naa),
        til: endOfYear(naa),
        label: new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Oslo",
          year: "numeric",
        }).format(naa),
      };
  }
}

/** Trygg lesing av ?periode= fra URL. Ukjent verdi gir «maned». */
export function tolkPeriodeValg(raa: string | null | undefined): PeriodeValg {
  return PERIODE_VALG.includes(raa as PeriodeValg) ? (raa as PeriodeValg) : "maned";
}
