import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { coachSkrivbarPlayerWhere } from "@/lib/auth/coached";
import { kanSeLiveOkt } from "@/lib/agencyos/live-okt-data";
import { hentLydSamtykkeKart } from "@/lib/recording/lyd-samtykke";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { RecordingControls } from "@/components/admin/recording-controls";
import { RecordingChunkSchema } from "@/lib/recording/chunk-contract";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coachingopptak · AgencyOS" };

export default async function CoachingRecordingPage({ searchParams }: {
  searchParams: Promise<{ okt?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { okt: sessionId } = await searchParams;
  if (sessionId && !(await kanSeLiveOkt(user, sessionId))) notFound();
  const v2 = sessionId ? await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId }, select: { id: true, title: true, studentId: true },
  }) : null;
  const wb = sessionId && !v2 ? await prisma.workbenchSession.findUnique({
    where: { id: sessionId }, select: { id: true, title: true, playerId: true },
  }) : null;
  const playerId = v2?.studentId ?? wb?.playerId ?? null;
  if (sessionId && !playerId) notFound();
  const players = await prisma.user.findMany({
    where: { AND: [coachSkrivbarPlayerWhere(user), ...(playerId ? [{ id: playerId }] : [])] },
    select: { id: true, name: true }, orderBy: { name: "asc" }, take: 200,
  });
  if (playerId && !players.some((p) => p.id === playerId)) notFound();
  const consent = await hentLydSamtykkeKart(players.map((p) => p.id));
  const context = sessionId && playerId ? { sessionId, playerId, tittel: v2?.title ?? wb?.title ?? "" } : null;
  const recovery = await prisma.sessionRecording.findFirst({
    where: { uploadedById: user.id, status: "RECORDING", ...(sessionId ? { sessionId } : {}) },
    orderBy: { createdAt: "desc" }, select: { id: true, startedAt: true, chunks: true, durationSec: true },
  });
  const recoveryChunks = Array.isArray(recovery?.chunks) ? recovery.chunks.flatMap(value => {
    const parsed = RecordingChunkSchema.safeParse(value); return parsed.success ? [parsed.data] : [];
  }) : [];
  const recoveryExpectedChunks = Math.max(0, ...recoveryChunks.map(chunk => chunk.idx + 1));
  return <AgencyOSSkall natt navn={user.name ?? "Coach"}>
    <section className="pa-side pa-coaching-recorder">
      <Link className="pa-btn pa-btn--ghost" href={sessionId ? `/admin/agencyos/live/${sessionId}` : "/admin/agencyos/live"}>Til Live-økta</Link>
      <header><h1>Coachingopptak</h1><p>{context?.tittel ?? "Velg spilleren du skal coache."}</p></header>
      <p>Start og stopp med korte trykk. Opptaket knyttes til valgt spiller; lydsamtykke kontrolleres før det starter.</p>
      <RecordingControls recordingId={null} recoveryRecordingId={recovery?.id ?? null}
        recoveryStartedAt={recovery?.startedAt.toISOString() ?? null}
        recoveryExpectedChunks={recoveryExpectedChunks} recoveryDurationSec={recovery?.durationSec}
        spillere={players.map((p) => ({ id: p.id, navn: p.name ?? "Spiller", lydSamtykkeGitt: consent[p.id] === true }))}
        okt={context} topbar={<span>{context ? "Opptak for denne økta" : "Nytt coachingopptak"}</span>}
        stage={<div style={{ padding: 24 }}><h2>{playerId ? players[0]?.name : "Spiller og opptak"}</h2><p>Transkript og analyse vises etter behandling. Tekst og tiltak gjennomgås før de godkjennes.</p></div>} />
    </section>
  </AgencyOSSkall>;
}
