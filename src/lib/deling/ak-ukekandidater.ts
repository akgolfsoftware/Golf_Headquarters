import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { canonicalJson } from "@/lib/agents/canonical-json";
import type { AkGruppeoppdrag } from "./ak-gruppeoppdrag";
import { akProfilBevisSchema } from "./ak-profil-mellomlagring";
import { akUkeDatabevisSchema, hentAkUkegrunnlag, brukSammeAkUkegrunnlag, laasOgLesSammeAkUkegrunnlag, type AkUkegrunnlag } from "./ak-ukegrunnlag";
import { lesVerifiserteAkBankkopier } from "./ak-bankkobling-lesing";
import { vurderAkUkekandidat } from "./ak-ukekandidat-vurdering";

const bevisSchema = z.object({ versjon: z.literal(1), deling: akProfilBevisSchema,
  databevis: akUkeDatabevisSchema, kandidatFingeravtrykk: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
type Tx = Prisma.TransactionClient;
type Grunnlag = Omit<AkUkegrunnlag, "deling" | "databevis">;

async function les(tx: Tx, grunnlag: Grunnlag) {
  const kopier = await lesVerifiserteAkBankkopier(tx);
  const kandidater = kopier.map(({ bank, kobling }) => ({ ...kobling, ...vurderAkUkekandidat(bank, grunnlag) }))
    .sort((a, b) => a.exerciseId < b.exerciseId ? -1 : a.exerciseId > b.exerciseId ? 1 : 0);
  return { kandidater, fingeravtrykk: createHash("sha256").update(canonicalJson([1, kandidater])).digest("hex") };
}
type Kandidater = Awaited<ReturnType<typeof les>>["kandidater"];

/** Internal advisory catalogue for ONE current player/week/grant. No names,
 * source text, raw scores or facility measurements leave the controlled basis.
 * Evidence and IDs remain server-side, never model arguments or access tokens.
 * Capture and comparison finish before any later async planner/network work.
 */
export async function hentAkUkekandidater(jobb: AkGruppeoppdrag, spillerId: unknown, uke: unknown) {
  const basis = await hentAkUkegrunnlag(jobb, spillerId, uke);
  if (!basis) return null;
  const resultat = await brukSammeAkUkegrunnlag(jobb, spillerId, basis.deling, basis.databevis,
    async (tx, grunnlag) => {
      const katalog = await les(tx, grunnlag);
      // Sharing remains locked. Check inputs again after possible bank lock
      // waits, including result inputs which are not themselves row-locked.
      const samme = await laasOgLesSammeAkUkegrunnlag(tx, { id: basis.deling.spillerId }, jobb, basis.databevis);
      return samme ? katalog : null;
    });
  if (!resultat?.verdi) return null;
  return { bevis: { versjon: 1 as const, deling: basis.deling, databevis: basis.databevis,
    kandidatFingeravtrykk: resultat.verdi.fingeravtrykk }, kandidater: resultat.verdi.kandidater };
}

/** Compare trusted SERVER-stored capture with fresh sharing/data/bank content
 * under the existing locks. Never accept a client's replacement proof. Callback
 * must use tx only, no network/nested transactions. Matching observations are
 * not sporting approval or permission to auto-apply training. No runtime caller
 * is activated here. Bank files are checked at read time, not filesystem-locked.
 */
export async function brukSammeAkUkekandidater<T>(jobb: AkGruppeoppdrag, spillerId: unknown, lagretBevis: unknown,
  bruk: (tx: Tx, kandidater: Kandidater) => Promise<T>) {
  const parsed = bevisSchema.safeParse(lagretBevis);
  if (!parsed.success) return null;
  const bevis = parsed.data;
  const resultat = await brukSammeAkUkegrunnlag(jobb, spillerId, bevis.deling, bevis.databevis, async (tx, grunnlag) => {
    const ferskt = await les(tx, grunnlag);
    if (ferskt.fingeravtrykk !== bevis.kandidatFingeravtrykk) return null;
    if (!await laasOgLesSammeAkUkegrunnlag(tx, { id: bevis.deling.spillerId }, jobb, bevis.databevis)) return null;
    return { verdi: await bruk(tx, ferskt.kandidater) };
  });
  return resultat?.verdi ?? null;
}
