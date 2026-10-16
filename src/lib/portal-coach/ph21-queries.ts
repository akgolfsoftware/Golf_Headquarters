/**
 * Server-spørringer og actions for PH-21 Innboks & Coach-kontakt
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { hentPH21MottakerCoachId } from "./ph21-mottaker";
import { erCoachetSpiller } from "@/lib/auth/coached";
import {
  type PH21Data,
  type PH21Message,
  type PH21Question,
  type PH21Feedback,
  type PH21Video,
  type PH21Plan,
  type PH21SessionOption,
  formatVideoVarighet,
  formatPH21Dato,
} from "./ph21-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type JsonMessage = { role?: string; content?: string; ts?: string; attach?: string };

export async function getPH21Data(userId: string): Promise<PH21Data> {
  const userRow = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true },
  });
  const isCoached = (await erCoachetSpiller(userId)) || userRow?.role === "COACH" || userRow?.role === "ADMIN";

  // 1. Coach profil — samme mottaker som send-handlingen godtar.
  let coach: PH21Data["coach"] = null;
  const coachId = await hentPH21MottakerCoachId(userId);

  if (coachId) {
    const coachRow = await prisma.user.findUnique({
      where: { id: coachId },
      select: { id: true, name: true, avatarUrl: true },
    });
    if (coachRow) {
      coach = {
        id: coachRow.id,
        name: coachRow.name,
        initials: initials(coachRow.name),
        avatarUrl: coachRow.avatarUrl,
      };
    }
  }

  // 2. Meldinger
  const messages: PH21Message[] = [];
  if (coachId) {
    const thread = await prisma.coachingSession.findFirst({
      where: { userId, coachId, kind: "DIRECT" },
      orderBy: { updatedAt: "desc" },
    });
    if (thread && Array.isArray(thread.messages)) {
      const raw = thread.messages as JsonMessage[];
      for (let i = 0; i < raw.length; i++) {
        const m = raw[i];
        if (m && typeof m === "object") {
          messages.push({
            id: `${thread.id}-m${i}`,
            role: m.role === "coach" ? "coach" : "me",
            text: String(m.content ?? ""),
            t: m.ts ? formatPH21Dato(m.ts, true) : "Nylig",
            attach: m.attach ? String(m.attach) : undefined,
          });
        }
      }
    }
  }

  // Fallback meldinger hvis tomme og coachet (eller hvis tråden er helt ny)
  if (messages.length === 0 && coach) {
    messages.push({
      id: "init-welcome",
      role: "coach",
      text: "Hei! Her kan vi diskutere teknisk plan, spørsmål og tilbakemeldinger på øktene dine.",
      t: "I dag",
    });
  }

  // 3. Spørsmål
  const rawQuestions = await prisma.question.findMany({
    where: { askerUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const questions: PH21Question[] = rawQuestions.map((q) => ({
    id: q.id,
    t: q.title,
    date: formatPH21Dato(q.createdAt),
    status: q.status === "ANSWERED" ? "Besvart" : "Venter på svar",
    answer: q.answer,
  }));

  // 4. Tilbakemelding på økter
  const recentSessionsRows = await prisma.trainingSessionV2.findMany({
    where: { studentId: userId },
    select: { id: true, title: true, startTime: true, notes: true, completedSummary: true },
    orderBy: { startTime: "desc" },
    take: 10,
  });

  const recentSessions: PH21SessionOption[] = recentSessionsRows.map((s) => ({
    value: s.id,
    label: `${s.title} · ${formatPH21Dato(s.startTime)}`,
  }));

  const feedback: PH21Feedback[] = [];
  for (const s of recentSessionsRows) {
    if (s.notes) {
      feedback.push({
        id: `fb-${s.id}`,
        session: s.title,
        from: "me",
        rating: 4,
        text: s.notes,
        t: formatPH21Dato(s.startTime, true),
      });
    }
  }

  // 5. Videoer
  const rawVideos = await prisma.sessionVideo.findMany({
    where: { playerId: userId, status: "READY" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const videos: PH21Video[] = rawVideos.map((v) => ({
    id: v.id,
    title: v.title,
    len: formatVideoVarighet(v.durationSec),
    img: v.thumbnailUrl || "/images/video-placeholder.png",
    date: formatPH21Dato(v.createdAt),
    seen: true, // fallback
  }));

  // 6. Planer
  const rawPlans = await prisma.trainingPlan.findMany({
    where: { userId, createdById: { not: null } },
    include: { sessions: { select: { id: true, durationMin: true } } },
    orderBy: { startDate: "desc" },
    take: 10,
  });

  const plans: PH21Plan[] = rawPlans.map((p) => {
    const totalMin = p.sessions.reduce((acc, s) => acc + (s.durationMin || 60), 0);
    const timer = Math.round((totalMin / 60) * 10) / 10;
    return {
      id: p.id,
      title: p.name,
      sessions: p.sessions.length,
      hours: `${timer} timer`,
      sent: formatPH21Dato(p.startDate),
      status: p.isActive ? "Godtatt" : "Venter på spiller",
    };
  });

  const meFornavn = userRow?.name?.split(" ")[0] ?? "Deg";

  return {
    coach,
    meFornavn,
    messages,
    questions,
    feedback,
    videos,
    plans,
    recentSessions,
    isCoached,
  };
}
