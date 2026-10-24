import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { canonicalJson } from "@/lib/agents/canonical-json";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { byggAkBankkatalog } from "./ak-bankkobling-format";
import { hentMedAkProfilBevis } from "./ak-profil-mellomlagring";
import type { AkGruppeoppdrag } from "./ak-gruppeoppdrag";

const ref = z.object({ akGodkjentbank: z.object({ versjon: z.literal(1), bankId: z.string(),
  bankFingeravtrykk: z.string().regex(/^[a-f0-9]{64}$/) }).strict() });

/** Internal read-only catalog binding check. A verified copy is NOT yet a
 * qualified recommendation for this player/week. No model, import or activation.
 * Return values stay server-side; recheck sharing, row and bank before any use.
 */
export async function hentAkBankkoblinger(jobb: AkGruppeoppdrag, spillerId: unknown) {
  return hentMedAkProfilBevis(jobb, spillerId, async tx =>
    (await lesVerifiserteAkBankkopier(tx)).map(({ kobling }) => kobling));
}

/** Internal composition only after fresh locked sharing access. Use this tx,
 * never a nested/global transaction. Bank content must stay server-side. */
export async function lesVerifiserteAkBankkopier(tx: Prisma.TransactionClient) {
  const where = { source: "SYSTEM", visibility: "PLATFORM", createdBy: null, coachNotes: null,
    parametersJson: { path: ["akGodkjentbank", "versjon"], equals: 1 },
  } satisfies Prisma.ExerciseDefinitionWhereInput;
  const kandidater = await tx.exerciseDefinition.findMany({ where, select: { id: true } });
  if (!kandidater.length) return [];
  const revisjoner = await tx.$queryRaw<Array<{ id: string; revisjon: string }>>`
    SELECT id, xmin::text AS revisjon FROM exercise_definitions
    WHERE id IN (${Prisma.join(kandidater.map(k => k.id))}) ORDER BY id FOR SHARE`;
  // Re-read after locks; rows changed/deleted while waiting are not trusted.
  // Do not fetch private notes. coachNotes=null is enforced in the predicate.
  const rader = await tx.exerciseDefinition.findMany({ where: { ...where, id: { in: kandidater.map(k => k.id) } },
    select: { id: true, source: true, visibility: true, createdBy: true, name: true, description: true, kilde: true,
      pyramidArea: true, minKategori: true, maxKategori: true, environment: true, fasilitetKrav: true,
      treningstype: true, omraadeKode: true, motorikk: true, belastning: true, press: true, parametersJson: true,
      videoUrl: true, imageUrl: true, lPhase: true, lPhases: true, defaultRepsSets: true, csMin: true, csMax: true,
      durationMin: true, higherIsBetter: true, skillArea: true, minHcp: true, maxHcp: true, utstyr: true,
      intensitet: true, morad: true, prerequisites: true, tags: true, defaultSets: true, defaultReps: true,
      csTargetByKategori: true, defaultRepsUtenBall: true, defaultRepsLavFart: true, defaultRepsAuto: true, muscleGroups: true,
    } });
  // Read the source AFTER DB lock waits; a changed file/catalogue must not
  // be certified using the copy captured before waiting. No network calls.
  const katalog = byggAkBankkatalog(hentGodkjenteOvelsesbankElementer().filter(r => r.type !== "TEST"));
  const koblinger = rader.flatMap(rad => {
    const reference = ref.safeParse(rad.parametersJson);
    if (!reference.success) return [];
    const bank = katalog.find(k => k.bankId === reference.data.akGodkjentbank.bankId &&
      k.bankFingeravtrykk === reference.data.akGodkjentbank.bankFingeravtrykk);
    const { id, ...innhold } = rad;
    const revisjon = revisjoner.find(r => r.id === id)?.revisjon;
    if (!bank || !revisjon || canonicalJson({ ...innhold, coachNotes: null }) !== canonicalJson(bank.data)) return [];
    return [{ bank, kobling: { exerciseId: id, exerciseRevisjon: revisjon, bankId: bank.bankId, bankFingeravtrykk: bank.bankFingeravtrykk } }];
  });
  // Never choose the first of multiple database copies for one approved item.
  return koblinger.filter(k => koblinger.filter(r => r.kobling.bankId === k.kobling.bankId).length === 1);
}
