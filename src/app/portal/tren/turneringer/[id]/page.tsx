/**
 * PlayerHQ · Trening · Turnering — Detalj
 *
 * Detaljvisning for én enkelt turnering. Matcher Tournament-design fra
 * Claude Design (public/design/tournament.html). Bruker PortalShell fra
 * portal-layout (ikke (fullscreen)-gruppe).
 *
 * For nå: viser hardkodet Sørlandsåpent-eksempel uavhengig av [id].
 * DB-lookup mot Tournament-katalogen kan legges på senere.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TurneringDetaljClient } from "./turnering-client";

export default async function TurneringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  await requirePortalUser();

  // Forsøk å hente turnering fra katalog — feiler stille (vi viser fallback).
  let turneringNavn: string | null = null;
  try {
    const t = await prisma.tournament.findUnique({
      where: { id },
      select: { name: true },
    });
    turneringNavn = t?.name ?? null;
  } catch {
    turneringNavn = null;
  }

  return <TurneringDetaljClient tournamentName={turneringNavn} />;
}
