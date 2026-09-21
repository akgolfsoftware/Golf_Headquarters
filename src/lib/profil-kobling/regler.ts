/**
 * Regler for å koble en HQ-profil til historikken i resultatdatabasen.
 * Rene funksjoner, testet uten database (mønster: src/lib/deling/samtykke-regler.ts).
 *
 * Hvorfor så strengt: golf-ID (MemberID) står åpent i GolfBox-resultatlistene.
 * Alle som kan lese en resultatliste kan altså kjenne en annen spillers golf-ID,
 * så den alene kan ikke være bevis på hvem du er. Navn og fødselsår kommer fra
 * brukerens EGEN profil på serveren, aldri fra klienten, og kandidaten må stemme
 * med dem. Stemmer den ikke, vises ingenting om eieren av golf-IDen, heller ikke
 * navnet.
 *
 * Grensen: navn og fødselsdato i profilen er selvoppgitt. Dette hindrer tilfeldig
 * og utilsiktet feilkobling, og at noen bruker en kjent golf-ID med et helt annet
 * navn. Det er ikke identitetskontroll.
 */

import type { Kandidat } from "./typer";

export type ProfilGrunnlag = { name: string; dateOfBirth: Date | null };

export type Oppslag = {
  golfId: string | null;
  navn: string | null;
  fodselsaar: number | null;
};

/** «303-579» og «303579» er samme golf-ID. Databasen sammenligner bare sifrene. */
export function normaliserGolfId(input: string | null | undefined): string | null {
  if (!input) return null;
  const siffer = input.replace(/\D/g, "");
  return siffer.length >= 4 && siffer.length <= 12 ? siffer : null;
}

/**
 * Bygg oppslaget. Navn og fødselsår hentes fra profilen; klienten kan bare
 * oppgi golf-ID. Uten golf-ID kreves fødselsår, ellers er navn alene for lite.
 */
export function byggOppslag(
  bruker: ProfilGrunnlag,
  golfIdInput?: string | null,
): { ok: true; oppslag: Oppslag } | { ok: false; feil: string } {
  const oppgitt = (golfIdInput ?? "").trim();
  const golfId = oppgitt ? normaliserGolfId(oppgitt) : null;
  if (oppgitt && !golfId) {
    return { ok: false, feil: "Golf-ID har minst fire siffer, for eksempel 303-579." };
  }
  const navn = bruker.name.trim() || null;
  const fodselsaar = bruker.dateOfBirth ? bruker.dateOfBirth.getUTCFullYear() : null;
  if (!golfId && (fodselsaar === null || navn === null)) {
    return { ok: false, feil: "Legg inn fødselsdatoen din i profilen, eller oppgi golf-ID." };
  }
  return { ok: true, oppslag: { golfId, navn, fodselsaar } };
}

function ord(navn: string): string[] {
  return navn.normalize("NFC").toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Stemmer kandidaten med brukerens egen profil? Fornavn og etternavn må være like
 * (mellomnavn ignoreres), og fødselsår må være likt når begge er kjent.
 */
export function stemmerMedProfil(
  bruker: ProfilGrunnlag,
  kandidat: Pick<Kandidat, "name" | "birth_year">,
): boolean {
  const a = ord(bruker.name);
  const b = ord(kandidat.name);
  if (a.length < 2 || b.length < 2) return false;
  if (a[0] !== b[0] || a[a.length - 1] !== b[b.length - 1]) return false;
  if (bruker.dateOfBirth && kandidat.birth_year != null) {
    if (bruker.dateOfBirth.getUTCFullYear() !== kandidat.birth_year) return false;
  }
  return true;
}

/** Bare kandidater som stemmer med profilen slipper gjennom til klienten. */
export function filtrerKandidater(bruker: ProfilGrunnlag, kandidater: Kandidat[]): Kandidat[] {
  return kandidater.filter((k) => stemmerMedProfil(bruker, k));
}
