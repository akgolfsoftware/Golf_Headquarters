// Lar sign-off-riggen (scripts/train-lock-pixel-diff.mjs) fryse "i dag" til
// en fast dato/tid — KUN for screentest-kontoen. Uten dette kan ingen
// datoavhengig skjerm (f.eks. PH-01) noensinne pixel-matches mot en fastdatert
// Train-lock-fasit, siden ekte brukeres "i dag" alltid er ekte Date.now().
//
// Sikkerhet: header ignoreres for alle andre enn nøyaktig TEST_EPOST — en
// vanlig bruker kan ikke overstyre sin egen dato ved å sende headeren selv.
import { headers } from "next/headers";

const OVERSTYRING_HEADER = "x-screentest-naa";
const TEST_EPOST = "screentest@akgolf.test";

/**
 * Returnerer "nå" for datoberegninger i server-rendrede sider. Ekte brukere
 * (og screentest uten headeren) får alltid ekte `new Date()`.
 */
export async function hentEffektivNaa(brukerEpost: string | null | undefined): Promise<Date> {
  if (brukerEpost !== TEST_EPOST) return new Date();
  const overstyring = (await headers()).get(OVERSTYRING_HEADER);
  if (!overstyring) return new Date();
  const dato = new Date(overstyring);
  return Number.isNaN(dato.getTime()) ? new Date() : dato;
}
