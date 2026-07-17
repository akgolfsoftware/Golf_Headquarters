/**
 * AgencyOS — Stats-oversikt (admin) (/admin/stats/overview). v2-port 16. juli 2026.
 *
 * Krever ADMIN.
 * Data hentes fra: User, Tournament, PgaPlayerSeason, PublicPlayer,
 *   BrukerSgInput, BrukerSammenligning, PublicPlayerEntry, git log.
 *
 * Plausible (trafikk, topp-sider): merket som "Krever Plausible-integrasjon".
 *
 * Server component — ekte Prisma, ingen falske tall.
 */

import type { Metadata } from "next";
import { execSync } from "child_process";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminStatsOverviewV2, type AdminStatsOverviewV2Data, type SyncRad, type SyncStatus } from "@/components/admin/v2/AdminStatsOverviewV2";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Stats overview | Admin",
  description: "Admin-dashboard for AK Golf Stats.",
  robots: { index: false },
};

function hentSisteCommits(): { hash: string; melding: string }[] {
  try {
    const raw = execSync("git -C /Users/anderskristiansen/Developer/akgolf-hq log -5 --oneline", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    return raw.split("\n").map((linje) => {
      const spaceIdx = linje.indexOf(" ");
      return { hash: linje.slice(0, spaceIdx), melding: linje.slice(spaceIdx + 1) };
    });
  } catch {
    return [];
  }
}

async function hentAdminOverview() {
  const [
    totalBrukere,
    brukereSomHarSgInputs,
    totalSgInputs,
    totalSammenligninger,
    ventendeManuelleTurneringer,
    datagolfSyncStatus,
    turneeringSyncStatus,
    totalPgaSpillere,
    totalTurneringer,
    totalDeltakerRader,
    totalNorskeSpillere,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, sgInputs: { some: {} } } }),
    prisma.brukerSgInput.count(),
    prisma.brukerSammenligning.count(),
    prisma.tournament.count({ where: { sourceOrigin: "MANUAL", mergedIntoId: null } }),
    prisma.pgaPlayerSeason.findFirst({
      orderBy: { lastUpdated: "desc" },
      select: { lastUpdated: true, playerName: true },
    }),
    prisma.tournament.findFirst({
      where: { sourceOrigin: "DATAGOLF", lastSyncAt: { not: null } },
      orderBy: { lastSyncAt: "desc" },
      select: { lastSyncAt: true, name: true },
    }),
    prisma.pgaPlayerSeason.count(),
    prisma.tournament.count(),
    prisma.publicPlayerEntry.count(),
    prisma.publicPlayer.count({ where: { country: "NO" } }),
  ]);

  const sisteCommits = hentSisteCommits();
  const now = Date.now();

  function minSiden(dato: Date | null | undefined): number {
    if (!dato) return Infinity;
    return (now - new Date(dato).getTime()) / 60000;
  }

  const datagolfMinSiden = minSiden(datagolfSyncStatus?.lastUpdated);
  const turneeringMinSiden = minSiden(turneeringSyncStatus?.lastSyncAt);

  const syncRader: SyncRad[] = [
    {
      navn: "DataGolf PGA-spillerdata",
      status: (datagolfMinSiden < 1440 ? "ok" : datagolfMinSiden < 4320 ? "stale" : "error") as SyncStatus,
      tid: formaterTidSiden(datagolfSyncStatus?.lastUpdated),
      detalj: datagolfSyncStatus ? `Siste: ${datagolfSyncStatus.playerName}` : "Ingen data",
    },
    {
      navn: "Turneringer (DataGolf-sync)",
      status: (turneeringMinSiden < 1440 ? "ok" : turneeringMinSiden < 4320 ? "stale" : "error") as SyncStatus,
      tid: formaterTidSiden(turneeringSyncStatus?.lastSyncAt),
      detalj: turneeringSyncStatus ? `Siste: ${turneeringSyncStatus.name}` : "Ingen data",
    },
    {
      navn: "Manuelle turneringer (ventende)",
      status: (ventendeManuelleTurneringer === 0 ? "ok" : "warning") as SyncStatus,
      tid: "Live",
      detalj: `${ventendeManuelleTurneringer} ventende modereringer`,
    },
  ];

  return {
    totalBrukere,
    brukereSomHarSgInputs,
    totalSgInputs,
    totalSammenligninger,
    ventendeManuelleTurneringer,
    syncRader,
    totalPgaSpillere,
    totalTurneringer,
    totalDeltakerRader,
    totalNorskeSpillere,
    sisteCommits,
  };
}

function formaterTidSiden(dato: Date | null | undefined): string {
  if (!dato) return "Aldri synkronisert";
  const minSiden = Math.round((Date.now() - new Date(dato).getTime()) / 60000);
  if (minSiden < 60) return `${minSiden} min siden`;
  const timSiden = Math.round(minSiden / 60);
  if (timSiden < 24) return `${timSiden}t siden`;
  return `${Math.round(timSiden / 24)}d siden`;
}

export default async function AdminStatsOverviewPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const overview = await hentAdminOverview();
  const now = new Date();

  const data: AdminStatsOverviewV2Data = {
    ...overview,
    sistOppdatertLabel: now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
  };

  return <AdminStatsOverviewV2 data={data} />;
}
