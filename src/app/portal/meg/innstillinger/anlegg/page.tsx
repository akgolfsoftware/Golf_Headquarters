/**
 * PlayerHQ · Meg · Fasiliteter (/portal/meg/innstillinger/anlegg) — PH-24 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermen «Fasiliteter»).
 *
 * Spilleren ser og endrer hvilke av de 19 treningsområdene hen kan trene på (svarene fra oppstarten,
 * preferences.onboarding.fasilitetOmrader), og krysser av anlegg og utstyr hen har tilgang til. Brukes for å filtrere
 * øvelsesbanken og planforslagene. Auth-guard (samme allow-liste), oppslaget og
 * lagringen (lagreFasilitetProfil) er uendret; bare visningen er ny (PH24Fasiliteter).
 */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { PH24Fasiliteter } from "@/components/portal/precision/PH24Fasiliteter";
import { OMRADER, type Omrade } from "@/lib/onboarding/oppstart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fasiliteter · PlayerHQ" };

export default async function AnleggPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "PARENT", "COACH", "ADMIN"] });

  const [dbUser, steder] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { tilgjengeligeFasiliteter: true, preferences: true } }),
    prisma.playerFacility.findMany({ where: { userId: user.id }, select: { id: true, name: true, isIndoor: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const tilgjengelig: DrillFasilitet[] = dbUser?.tilgjengeligeFasiliteter ?? [];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH24Fasiliteter data={{ tilgjengelig, steder: steder.map((s) => ({ id: s.id, navn: s.name, inne: s.isIndoor })), omrader: lesOmrader(dbUser?.preferences) }} />
    </PlayerHQSkall>
  );
}

/** Områdene fra oppstarten, bare kjente navn. null når spilleren ikke har svart. */
function lesOmrader(preferences: unknown): Omrade[] | null {
  const onboarding = preferences && typeof preferences === "object" ? (preferences as Record<string, unknown>).onboarding : null;
  const v = onboarding && typeof onboarding === "object" ? (onboarding as Record<string, unknown>).fasilitetOmrader : null;
  if (!Array.isArray(v)) return null;
  return OMRADER.filter((o) => v.includes(o));
}
