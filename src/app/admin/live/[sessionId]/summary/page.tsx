/**
 * AgencyOS — Live-økt sammendrag, coach (`/admin/live/[sessionId]/summary`), v2.
 * Port av `(legacy)/live/[sessionId]/summary/page.tsx` (2026-07-14, AgencyOS
 * Bølge 1.3) — samme datamodell/logikk, ny v2-presentasjon i `CoachLiveSummaryV2`.
 * `summary/actions.ts` bor fortsatt under `(legacy)/live/` — delt server action.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { CoachLiveSummaryV2 } from "@/components/admin/v2/CoachLiveSummaryV2";

export const dynamic = "force-dynamic";

const MILJO_LABEL: Record<string, string> = { M0: "Innendørs", M1: "Driving range", M2: "Korte banen", M3: "Banen", M4: "Turnering" };
const PRACTICE_LABEL: Record<string, string> = { BLOKK: "Blokkpraksis", RANDOM: "Tilfeldig", KONKURRANSE: "Konkurranse", SPILL_TEST: "Spilltest" };

export default async function CoachLiveSummaryPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const session = await prisma.trainingSessionV2.findUnique({ where: { id: sessionId } });
  if (!session) notFound();

  const spiller = session.studentId
    ? await prisma.user.findUnique({ where: { id: session.studentId }, select: { id: true, name: true } })
    : null;

  const startTid = new Intl.DateTimeFormat("nb-NO", { dateStyle: "short", timeStyle: "short" }).format(session.startTime);

  const rawSummary: unknown = session.completedSummary;
  const summaryObj = rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary) ? (rawSummary as Record<string, unknown>) : {};
  const initialRating = typeof summaryObj.coachRating === "number" ? summaryObj.coachRating : null;

  return (
    <V2Shell aktiv="gjennomfore" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <CoachLiveSummaryV2
        sessionId={sessionId}
        spiller={spiller}
        title={session.title}
        startTid={startTid}
        miljoLabel={MILJO_LABEL[session.miljo] ?? session.miljo}
        practiceLabel={PRACTICE_LABEL[session.practiceType] ?? session.practiceType}
        initialRating={initialRating}
        initialNotat={session.notes ?? ""}
      />
    </V2Shell>
  );
}
