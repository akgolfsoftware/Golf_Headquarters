/**
 * AgencyOS — Live-økt aktiv, coach (`/admin/live/[sessionId]/active`), v2.
 * Port av `(legacy)/live/[sessionId]/active/page.tsx` (2026-07-14, AgencyOS
 * Bølge 1.3) — samme datamodell/logikk (plan-fremdrift-proxy uendret), ny
 * v2-presentasjon i `CoachLiveActiveV2`. `active/actions.ts` bor fortsatt
 * under `(legacy)/live/` — delt server action.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { CoachLiveActiveV2 } from "@/components/admin/v2/CoachLiveActiveV2";
import type { StatusTone } from "@/components/v2";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { PLANNED: "Planlagt", IN_PROGRESS: "Aktiv", COMPLETED: "Fullført", CANCELLED: "Avlyst", SKIPPED: "Hoppet over" };
const STATUS_TONE: Record<string, StatusTone> = { IN_PROGRESS: "up", PLANNED: "info", COMPLETED: "info", CANCELLED: "down", SKIPPED: "info" };
const PRACTICE_LABEL: Record<string, string> = { BLOKK: "Blokkpraksis", RANDOM: "Tilfeldig", KONKURRANSE: "Konkurranse", SPILL_TEST: "Spilltest" };

function varighetMinutter(start: Date, slutt: Date): number {
  return Math.round((slutt.getTime() - start.getTime()) / 60000);
}

export default async function CoachLiveActivePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: { drills: { orderBy: { sortOrder: "asc" }, take: 10 } },
  });
  if (!session) notFound();

  const spiller = session.studentId
    ? await prisma.user.findUnique({ where: { id: session.studentId }, select: { id: true, name: true, hcp: true } })
    : null;

  const erAktiv = session.status === "IN_PROGRESS";
  const aktivDrillRow = session.drills[0];
  const antallDrills = session.drills.length;
  const planFremdrift = antallDrills > 0 ? Math.min(Math.round((antallDrills / 5) * 100), 100) : 0;

  return (
    <V2Shell aktiv="gjennomfore" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <CoachLiveActiveV2
        sessionId={sessionId}
        spiller={spiller ? { id: spiller.id, name: spiller.name, hcp: spiller.hcp } : null}
        erAktiv={erAktiv}
        statusLabel={STATUS_LABEL[session.status] ?? session.status}
        statusTone={STATUS_TONE[session.status] ?? "info"}
        startTid={new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(session.startTime)}
        varighetMin={varighetMinutter(session.startTime, session.endTime)}
        practiceLabel={PRACTICE_LABEL[session.practiceType] ?? session.practiceType}
        miljo={session.miljo}
        aktivDrill={aktivDrillRow ? { name: aktivDrillRow.name, notes: aktivDrillRow.notes } : null}
        antallDrills={antallDrills}
        tidIgjenMin={varighetMinutter(new Date(), session.endTime)}
        planFremdriftPct={planFremdrift}
      />
    </V2Shell>
  );
}
