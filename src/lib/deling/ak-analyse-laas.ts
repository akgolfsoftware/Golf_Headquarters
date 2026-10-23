import "server-only";
import { Prisma } from "@/generated/prisma/client";
type Tx = Pick<Prisma.TransactionClient, "$queryRaw">;

/** Samme gruppelås ved lesing og trekk. Ingen langvarig tillatelse caches. */
export async function laas(tx: Tx, gruppeId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('ak-gruppeanalyse'), hashtext(${gruppeId}))::text`;
}

export async function databasetid(tx: Tx) {
  // clock_timestamp, ikke transaksjonens now(): denne kan ha ventet på låsen.
  // Samme databaseklokke ved gi/trekk/lesing, uavhengig av appserverens klokke.
  const [tid] = await tx.$queryRaw<Array<{ naa: Date }>>`SELECT clock_timestamp() AS naa`;
  return tid.naa;
}

/**
 * Radlåser beskytter også mot eksisterende skrivere som ikke bruker analyselåsen.
 * Fast rekkefølge: gruppe → medlemskap (id) → brukere (id). Bare låste medlemmer
 * kan inngå; innmeldinger som kommer etter uttrekket blir med ved neste oppslag.
 */
export async function laasGruppemedlemskap(tx: Tx, gruppeId: string) {
  const grupper = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM groups WHERE id = ${gruppeId} FOR SHARE`;
  if (!grupper.length) return [];
  return tx.$queryRaw<Array<{ id: string; userId: string }>>`
    SELECT id, "userId" FROM group_members
    WHERE "groupId" = ${gruppeId} AND "endedAt" IS NULL ORDER BY id FOR SHARE`;
}

export async function laasBrukere(tx: Tx, ids: string[]) {
  const unike = [...new Set(ids)].sort();
  if (!unike.length) return [];
  return tx.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM users WHERE id IN (${Prisma.join(unike)}) ORDER BY id FOR SHARE`;
}

/** En tilbakekalt foresattrelasjon kan ikke endres mellom kontroll og nytt valg. */
export async function laasForesattRelasjon(tx: Tx, parentId: string, childId: string) {
  return tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM parent_relations WHERE "parentId" = ${parentId}
    AND "childId" = ${childId} ORDER BY id FOR SHARE`;
}
