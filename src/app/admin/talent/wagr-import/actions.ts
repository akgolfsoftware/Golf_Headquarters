"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * Map WAGR Pts Avg til NGF-kategori (A-L).
 * Kalibrert mot Øyvinds tabell + observerte topp-spillere mai 2026.
 */
function mapTilNgfKategori(ptsAvg: number): string {
  if (ptsAvg >= 1500) return "A";
  if (ptsAvg >= 1100) return "B";
  if (ptsAvg >= 900) return "C";
  if (ptsAvg >= 700) return "D";
  if (ptsAvg >= 400) return "E";
  if (ptsAvg >= 220) return "F";
  if (ptsAvg >= 100) return "G";
  if (ptsAvg >= 50) return "H";
  return "I";
}

/**
 * Ekstrakter slug fra full WAGR-URL.
 * "https://www.wagr.com/playerprofile/mathias-aase-41993" → "mathias-aase-41993"
 */
function extractSlug(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Hvis det er en URL, hent siste path-segment
  const urlMatch = trimmed.match(/playerprofile\/([a-z0-9-]+)/i);
  if (urlMatch) return urlMatch[1];
  // Hvis det allerede er en slug (kun bokstaver/tall/bindestrek)
  if (/^[a-z0-9-]+$/i.test(trimmed)) return trimmed;
  return null;
}

type ManuellInput = {
  wagrUrl: string;
  fullName: string;
  country: string;
  rank: number;
  ptsAvg: number;
  divisor: number;
  wins?: number;
  top10s?: number;
  bestRank?: number;
  linkUserEmail?: string;
};

/**
 * Manuell import — Anders limer inn data fra WAGR-spillerprofilen.
 * Kobler til User hvis linkUserEmail finnes i basen.
 */
export async function importerWagrSpiller(input: ManuellInput): Promise<
  | { ok: true; snapshotId: string; userLinked: boolean }
  | { ok: false; feil: string }
> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const slug = extractSlug(input.wagrUrl);
  if (!slug) {
    return { ok: false, feil: "Ugyldig WAGR-URL eller slug." };
  }

  if (!input.fullName || input.fullName.length < 2) {
    return { ok: false, feil: "Mangler navn." };
  }

  if (!input.country || input.country.length !== 2) {
    return {
      ok: false,
      feil: "Land må være 2-bokstavs ISO-kode (no, us, gb, ...).",
    };
  }

  if (!Number.isFinite(input.rank) || input.rank < 1) {
    return { ok: false, feil: "Rank må være et positivt tall." };
  }

  if (!Number.isFinite(input.ptsAvg) || input.ptsAvg < 0) {
    return { ok: false, feil: "Pts Avg må være et positivt tall." };
  }

  // Sjekk om vi skal koble til eksisterende User
  let userId: string | null = null;
  if (input.linkUserEmail) {
    const eksisterende = await prisma.user.findUnique({
      where: { email: input.linkUserEmail.toLowerCase() },
      select: { id: true },
    });
    if (eksisterende) userId = eksisterende.id;
  }

  const ngfCategory = mapTilNgfKategori(input.ptsAvg);

  const snapshot = await prisma.wagrSnapshot.upsert({
    where: { wagrPlayerSlug: slug },
    update: {
      fullName: input.fullName,
      country: input.country.toLowerCase(),
      rank: input.rank,
      ptsAvg: input.ptsAvg,
      divisor: input.divisor,
      wins: input.wins ?? 0,
      top10s: input.top10s ?? 0,
      bestRank: input.bestRank ?? null,
      ngfCategory,
      userId,
      snapshotAt: new Date(),
    },
    create: {
      wagrPlayerSlug: slug,
      fullName: input.fullName,
      country: input.country.toLowerCase(),
      rank: input.rank,
      ptsAvg: input.ptsAvg,
      divisor: input.divisor,
      wins: input.wins ?? 0,
      top10s: input.top10s ?? 0,
      bestRank: input.bestRank ?? null,
      ngfCategory,
      userId,
    },
  });

  // Audit-log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "wagr.snapshot.imported",
      target: snapshot.id,
      metadata: {
        slug,
        fullName: input.fullName,
        ptsAvg: input.ptsAvg,
        ngfCategory,
        userLinked: userId !== null,
      },
    },
  });

  revalidatePath("/admin/talent/wagr-benchmark");
  revalidatePath("/admin/talent");

  return {
    ok: true,
    snapshotId: snapshot.id,
    userLinked: userId !== null,
  };
}

/**
 * Slett WAGR-snapshot. Krever COACH/ADMIN.
 */
export async function slettWagrSnapshot(id: string): Promise<void> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const snapshot = await prisma.wagrSnapshot.findUnique({ where: { id } });
  if (!snapshot) return;

  await prisma.wagrSnapshot.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "wagr.snapshot.deleted",
      target: id,
      metadata: { slug: snapshot.wagrPlayerSlug, fullName: snapshot.fullName },
    },
  });

  revalidatePath("/admin/talent/wagr-benchmark");
  redirect("/admin/talent/wagr-benchmark");
}
