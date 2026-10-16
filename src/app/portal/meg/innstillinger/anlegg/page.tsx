/**
 * PlayerHQ · Meg · Fasiliteter (/portal/meg/innstillinger/anlegg) — PH-24 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermen «Fasiliteter»).
 *
 * Spilleren krysser av anlegg og utstyr hen har tilgang til. Brukes for å filtrere
 * øvelsesbanken og planforslagene. Auth-guard (samme allow-liste), oppslaget og
 * lagringen (lagreFasilitetProfil) er uendret; bare visningen er ny (PH24Fasiliteter).
 */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { PH24Fasiliteter } from "@/components/portal/precision/PH24Fasiliteter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fasiliteter · PlayerHQ" };

export default async function AnleggPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "PARENT", "COACH", "ADMIN"] });

  const [dbUser, steder] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { tilgjengeligeFasiliteter: true } }),
    prisma.playerFacility.findMany({ where: { userId: user.id }, select: { id: true, name: true, isIndoor: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const tilgjengelig: DrillFasilitet[] = dbUser?.tilgjengeligeFasiliteter ?? [];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH24Fasiliteter data={{ tilgjengelig, steder: steder.map((s) => ({ id: s.id, navn: s.name, inne: s.isIndoor })) }} />
    </PlayerHQSkall>
  );
}
