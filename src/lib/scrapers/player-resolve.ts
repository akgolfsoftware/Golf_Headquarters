/**
 * Spiller-matching for scrapers.
 *
 * Problem: scraper-kilder (GolfBox, GJGT) gir spillernavn uten stabil id.
 * Det etablerte korpuset bruker slugs som `navn-fodselsaar` / `navn-dgId`.
 * Naiv `golfboxSlugify(navn)`-matching lager derfor dubletter.
 *
 * Løsning: match på navn (case-insensitivt) mot eksisterende PublicPlayer,
 * disambiguer på fødselsår når kilden gir det, og gjenbruk den etablerte
 * profilen (flest entries). Opprett kun når ingen match finnes.
 */

import type { PrismaClient } from "../../generated/prisma/client";

type PlayerRow = {
  id: string;
  name: string;
  slug: string;
  birthYear: number | null;
};

/** Normaliser navn for sammenligning: ascii, kun alfanumerisk. */
export function normalizePlayerName(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]/g, "");
}

export type ResolveInput = {
  name: string;
  country: string;
  tier: string;
  birthYear?: number | null;
};

/**
 * Finn eksisterende spiller eller opprett ny. Matcher på navn (insensitivt),
 * deretter fødselsår når tilgjengelig, ellers flest entries (etablert profil).
 */
export async function resolvePlayer(
  prisma: PrismaClient,
  input: ResolveInput,
): Promise<{ player: PlayerRow; created: boolean }> {
  const candidates = await prisma.publicPlayer.findMany({
    where: { name: { equals: input.name, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      slug: true,
      birthYear: true,
      _count: { select: { entries: true } },
    },
  });

  let pool = candidates;
  if (pool.length > 1 && input.birthYear) {
    const byYear = pool.filter((p) => p.birthYear === input.birthYear);
    if (byYear.length > 0) pool = byYear;
  }
  if (pool.length > 0) {
    pool.sort((a, b) => b._count.entries - a._count.entries);
    return { player: pool[0], created: false };
  }

  // Ingen match → opprett med unik slug (legg på fødselsår, så teller).
  const dashed = baseSlugDashed(input.name);
  let slug = dashed;
  let n = 2;
  while (await prisma.publicPlayer.findUnique({ where: { slug }, select: { id: true } })) {
    slug = input.birthYear && n === 2 ? `${dashed}-${input.birthYear}` : `${dashed}-${n}`;
    n++;
  }
  const player = await prisma.publicPlayer.create({
    data: {
      name: input.name,
      slug,
      country: input.country,
      tier: input.tier,
      birthYear: input.birthYear ?? null,
    },
  });
  return { player, created: true };
}

/** Bindestrek-slug (matcher øvrig konvensjon: kebab-case ascii). */
export function baseSlugDashed(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "spiller"
  );
}
