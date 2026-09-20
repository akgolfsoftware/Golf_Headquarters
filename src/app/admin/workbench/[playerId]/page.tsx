/**
 * AgencyOS Workbench — coach. Kroppen er WorkbenchUke (lov: 8 piller,
 * inspector 340, rust Publiser, sand, formel 8). WorkbenchV2 er ikke fasit.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { WorkbenchUke } from "@/components/workbench/WorkbenchUke";
import { loadWeek, loadSources } from "@/lib/workbench/wb-actions";
import { mondayOf } from "@/lib/domain/workbench/operations";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { CoachRosterBar } from "@/components/admin/v2/CoachRosterBar";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ uke?: string }>;
};

function ukeStartFraParam(raw?: string): string {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return mondayOf(raw);
  const off = parseWeekOffset(raw);
  const iso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + off * 7);
  return mondayOf(d.toISOString().slice(0, 10));
}

export default async function CoachWorkbenchPage({ params, searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { playerId } = await params;
  const sp = await searchParams;

  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id: playerId }] },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();

  const weekStart = ukeStartFraParam(sp.uke);
  const mode = { kind: "AGENCY" as const, subjectId: playerId, sources: [] };

  const [roster, weekRes, kilderRes] = await Promise.all([
    prisma.user.findMany({
      where: coachScopedPlayerWhere(user),
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
  ]);

  if (!weekRes.ok) {
    return (
      <V2Shell bredde="full" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
        <p style={{ padding: 24 }}>{weekRes.error}</p>
      </V2Shell>
    );
  }

  return (
    <V2Shell bredde="full" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
      <CoachRosterBar
        players={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
        currentPlayerId={playerId}
        playerName={spiller.name ?? "Ukjent"}
        coachName={user.name ?? "Coach"}
        uke={weekStart}
      />
      <WorkbenchUke
        playerId={playerId}
        spillerNavn={spiller.name ?? "Ukjent"}
        uke={weekRes.data}
        kilder={kilderRes.ok ? kilderRes.data : []}
      />
    </V2Shell>
  );
}
