/**
 * Domenesperre for trenerflatene WANG (/team-wang, trenerdelen) og
 * Team Norway (/team-norway). Anders 28.09.2026: innlogging på WANG skal
 * være en @wang.no-adresse, Team Norway en @golfforbundet.no-adresse.
 * @olympiatoppen.no slippes IKKE inn (Anders har sagt nei).
 *
 * Ren logikk uten database — brukes av serverportene i
 * `src/app/team-wang/_data/wang-trener-tilgang.ts` og
 * `src/lib/domain/tn-flate-tilgang.ts`, og låses av `domene-sperre.test.ts`.
 *
 * Regelen:
 *   - E-posten trimmes og gjøres om til små bokstaver før sammenligning.
 *   - Adressen må ha nøyaktig én «@», en ikke-tom lokal del, og domenet etter
 *     «@» må være NØYAKTIG det tillatte domenet. «x@xwang.no» og
 *     «x@wang.no.evil.com» slipper ikke inn — heller ikke underdomener
 *     («x@elev.wang.no»).
 *   - Unntak: plattform-ADMIN i AK Golf HQ (Anders' egen konto) slipper inn
 *     på begge flatene uansett domene.
 */

import type { UserRole } from "@/generated/prisma/client";

export type Trenerflate = "wang" | "team-norway";

export const FLATE_EPOSTDOMENE: Record<Trenerflate, string> = {
  wang: "wang.no",
  "team-norway": "golfforbundet.no",
};

/** Trimmet og med små bokstaver. Tom eller manglende adresse gir null. */
export function normaliserEpost(epost: string | null | undefined): string | null {
  if (typeof epost !== "string") return null;
  const renset = epost.trim().toLowerCase();
  return renset.length > 0 ? renset : null;
}

/** Sant bare når adressen er `<noe>@<domene>` med eksakt dette domenet. */
export function harEpostdomene(epost: string | null | undefined, domene: string): boolean {
  const renset = normaliserEpost(epost);
  if (!renset) return false;
  const deler = renset.split("@");
  if (deler.length !== 2) return false;
  const [lokal, adressedomene] = deler;
  if (!lokal) return false;
  return adressedomene === domene.trim().toLowerCase();
}

export type FlatetilgangVurdering =
  | { ok: true; via: "domene" | "admin" }
  | { ok: false; grunn: "domene" };

/** Avgjør om e-post + plattformrolle slipper inn på flaten. Ingen databasekall. */
export function vurderDomenetilgang(input: {
  flate: Trenerflate;
  epost: string | null | undefined;
  plattformRolle: UserRole;
}): FlatetilgangVurdering {
  if (input.plattformRolle === "ADMIN") return { ok: true, via: "admin" };
  if (harEpostdomene(input.epost, FLATE_EPOSTDOMENE[input.flate])) return { ok: true, via: "domene" };
  return { ok: false, grunn: "domene" };
}

/** Grunnene en innloggingsskjerm kan få i `?avvist=`. */
export const AVVISNINGSGRUNNER = ["domene", "rolle"] as const;
export type Avvisningsgrunn = (typeof AVVISNINGSGRUNNER)[number];

export function lesAvvisningsgrunn(verdi: string | string[] | undefined): Avvisningsgrunn | null {
  const v = Array.isArray(verdi) ? verdi[0] : verdi;
  return AVVISNINGSGRUNNER.find((g) => g === v) ?? null;
}

/** Tydelig norsk melding til innloggingsskjermen. */
export function avvisningsmelding(flate: Trenerflate, grunn: Avvisningsgrunn): { tittel: string; tekst: string } {
  const domene = FLATE_EPOSTDOMENE[flate];
  if (flate === "wang") {
    return grunn === "domene"
      ? {
          tittel: "Denne kontoen har ikke tilgang til trenerflaten",
          tekst: `Trenerflaten for WANG er bare for sportssjef og trenere med en @${domene}-adresse. Logg ut og logg inn med WANG-kontoen din. Elever og foresatte bruker PlayerHQ.`,
        }
      : {
          tittel: "Du er ikke registrert som trener i WANG",
          tekst: `Kontoen har en @${domene}-adresse, men står ikke som sportssjef eller trener i WANG-gruppen. Be sportssjefen legge deg til under Administrasjon.`,
        };
  }
  return grunn === "domene"
    ? {
        tittel: "Denne kontoen har ikke tilgang til Team Norway",
        tekst: `Team Norway-flaten er bare for trenerteamet med en @${domene}-adresse. Logg ut og logg inn med forbundskontoen din. Spillere bruker PlayerHQ.`,
      }
    : {
        tittel: "Du er ikke registrert i trenerteamet",
        tekst: `Kontoen har en @${domene}-adresse, men står ikke som trener eller Assist Coach i Team Norway-gruppen. Be landslagssjefen legge deg til under Tilgang og samtykke.`,
      };
}

export type TrenerflateVurdering =
  | { ok: true; via: "domene" | "admin" }
  | { ok: false; grunn: Avvisningsgrunn };

/**
 * Hele porten for en trenerflate, uten database: domenet (eller ADMIN), og
 * deretter at brukeren står som trener i flatens gruppe. `gruppeRolle` er
 * `GroupMember.role` for brukerens aktive medlemskap (null = ikke medlem).
 * Bare COACH og ASSISTANT er trenerroller; en spiller med riktig domene
 * slipper ikke inn. ADMIN trenger ikke medlemskap.
 */
export function vurderTrenerflate(input: {
  flate: Trenerflate;
  epost: string | null | undefined;
  plattformRolle: UserRole;
  gruppeRolle: string | null;
}): TrenerflateVurdering {
  const domene = vurderDomenetilgang(input);
  if (!domene.ok) return domene;
  if (domene.via === "admin") return domene;
  if (input.plattformRolle !== "COACH") return { ok: false, grunn: "rolle" };
  if (input.gruppeRolle !== "COACH" && input.gruppeRolle !== "ASSISTANT") return { ok: false, grunn: "rolle" };
  return domene;
}
