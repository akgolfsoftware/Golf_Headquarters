/**
 * AgencyOS — Live-økt brief, coach (`/admin/live/[sessionId]/brief`), v2.
 * Port av `(legacy)/live/[sessionId]/brief/page.tsx` (2026-07-14, AgencyOS
 * Bølge 1.3) — samme datamodell/logikk, ny v2-presentasjon i `CoachLiveBriefV2`.
 * `brief/actions.ts` bor fortsatt under `(legacy)/live/` — delt server action.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { CoachLiveBriefV2 } from "@/components/admin/v2/CoachLiveBriefV2";

export const dynamic = "force-dynamic";

const MILJO_LABEL: Record<string, string> = { M0: "Innendørs", M1: "Driving range", M2: "Korte banen", M3: "Banen", M4: "Turnering" };
const PRACTICE_LABEL: Record<string, string> = { BLOKK: "Blokkpraksis", RANDOM: "Tilfeldig", KONKURRANSE: "Konkurranse", SPILL_TEST: "Spilltest" };

export default async function CoachLiveBriefPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const session = await prisma.trainingSessionV2.findUnique({ where: { id: sessionId } });
  if (!session) notFound();

  const spiller = session.studentId
    ? await prisma.user.findUnique({ where: { id: session.studentId }, select: { id: true, name: true } })
    : null;

  const startTid = new Intl.DateTimeFormat("nb-NO", { dateStyle: "short", timeStyle: "short" }).format(session.startTime);
  const sluttTid = new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(session.endTime);

  const rawSummary: unknown = session.completedSummary;
  const summaryObj = rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary) ? (rawSummary as Record<string, unknown>) : {};
  const briefObj = summaryObj.coachBrief && typeof summaryObj.coachBrief === "object" && !Array.isArray(summaryObj.coachBrief) ? (summaryObj.coachBrief as Record<string, unknown>) : {};
  const initialBrief = typeof briefObj.melding === "string" ? briefObj.melding : "";

  return (
    <V2Shell aktiv="gjennomfore" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <CoachLiveBriefV2
        sessionId={sessionId}
        spiller={spiller}
        title={session.title}
        miljoLabel={MILJO_LABEL[session.miljo] ?? session.miljo}
        practiceLabel={PRACTICE_LABEL[session.practiceType] ?? session.practiceType}
        startTid={startTid}
        sluttTid={sluttTid}
        notes={session.notes}
        initialBrief={initialBrief}
      />
    </V2Shell>
  );
}
