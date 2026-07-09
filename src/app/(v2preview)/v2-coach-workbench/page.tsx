/**
 * v2-forhåndsvisning — COACH-WORKBENCH (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte coach-siden
 * (src/app/admin/spillere/[id]/workbench/page.tsx): requirePortalUser
 * (ADMIN/COACH) + roster fra Prisma + loadWorkbenchContext. Velger eksempel-
 * spiller (?spiller=<id>, ellers første i stallen). Ingen roster → ærlig tom.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  CoachWorkbenchMount,
  type CoachRosterPlayer,
} from "@/components/admin/v2/CoachWorkbenchMount";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ spiller?: string }>;
};

export default async function V2CoachWorkbenchPage({ searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const coachName = user.name ?? "Anders Kristiansen";

  const rosterRows = await prisma.user
    .findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 400,
    })
    .catch(() => []);
  const players: CoachRosterPlayer[] = rosterRows.map((p) => ({
    id: p.id,
    navn: p.name ?? "Uten navn",
  }));

  // Velg eksempel-spiller: ?spiller=<id> hvis gyldig, ellers første i stallen.
  const ønsket = (await searchParams).spiller;
  const valgt = players.find((p) => p.id === ønsket) ?? players[0] ?? null;

  // Ingen roster → tom-tilstand (ingen loader-kall).
  if (valgt === null) {
    return (
      <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={coachName}>
        <CoachWorkbenchMount
          players={[]}
          currentPlayerId={null}
          playerName=""
          coachName={coachName}
        />
      </V2Shell>
    );
  }

  const ctx = await loadWorkbenchContext(valgt.id, 0);

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={coachName}>
      <CoachWorkbenchMount
        players={players}
        currentPlayerId={valgt.id}
        playerName={valgt.navn}
        coachName={coachName}
        data={ctx?.data}
        insights={ctx?.insights ?? null}
        planStatus={ctx?.planStatus ?? null}
      />
    </V2Shell>
  );
}
