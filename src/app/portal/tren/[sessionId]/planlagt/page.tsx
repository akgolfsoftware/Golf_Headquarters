/**
 * PlayerHQ · Tren · Økt-detalj planlagt (/portal/tren/[sessionId]/planlagt) — v2.
 * v2-port 17. juli 2026 (Team D2): `OktPlanlagtV2` erstatter legacy-visningen,
 * ruten flyttet ut av (legacy). Auth, tilgangs-sjekk (spiller/gruppe/coach/
 * deltaker), Prisma-spørringene, timing-logikken og inviter-kandidat-uttrekket
 * er uendret — kun presentasjonslaget er nytt. «Inviter kompis»-flyten
 * (InviteFriendTrigger + modal + actions) gjenbrukes uendret som slot.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { InviteFriendTrigger } from "@/components/portal/workbench/invite-friend-trigger";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, type StatusTone } from "@/components/v2";
import {
  OktPlanlagtV2,
  type OktPlanlagtDeltaker,
} from "@/components/portal/v2/OktPlanlagtV2";
import type { ParticipationStatus } from "@/generated/prisma/client";

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLong(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "i dag";
  if (diffDays === 1) return "i går";
  if (diffDays > 1) return `${diffDays} dager siden`;
  const futureDays = Math.ceil(-diffMs / (1000 * 60 * 60 * 24));
  if (futureDays === 1) return "i morgen";
  return `om ${futureDays} dager`;
}

const STATUS_LABEL: Record<ParticipationStatus, string> = {
  INVITED: "Invitert",
  ACCEPTED: "Bekreftet",
  DECLINED: "Avslo",
  MAYBE: "Kanskje",
  ATTENDED: "Deltok",
  NO_SHOW: "Uteble",
};

const STATUS_TONE: Record<ParticipationStatus, StatusTone> = {
  INVITED: "info",
  ACCEPTED: "up",
  DECLINED: "down",
  MAYBE: "warn",
  ATTENDED: "up",
  NO_SHOW: "down",
};

export default async function OktPlanlagtPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser();
  const { sessionId } = await params;

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: {
      drills: {
        orderBy: { sortOrder: "asc" },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!session) notFound();

  // Tilgangs-sjekk: spilleren selv, gruppen, coach/admin, eller invitert deltaker
  const erDeltaker = session.participants.some((p) => p.userId === user.id);
  const harTilgang =
    session.studentId === user.id ||
    session.coachId === user.id ||
    session.hostId === user.id ||
    erDeltaker ||
    user.role === "ADMIN" ||
    user.role === "COACH";
  if (!harTilgang) notFound();

  const varighet = minutesBetween(session.startTime, session.endTime);
  const totalDrillMin = session.drills.reduce(
    (sum, d) => sum + (d.durationMinutes ?? 0),
    0,
  );

  // Timing-logikk
  const now = new Date();
  const sessionDay = new Date(session.startTime);
  sessionDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = sessionDay.getTime() === today.getTime();
  const isOverdue = session.startTime < now && !isToday;

  // Trene sammen-data: er denne brukeren host og kan invitere?
  const erHost = session.hostId === user.id;
  const kanInvitere =
    erHost &&
    session.isShared &&
    (session.maxParticipants == null ||
      session.participants.length < session.maxParticipants);

  // Hent potensielle spillere å invitere (kun hvis host og delt økt)
  type Inviterbar = {
    id: string;
    name: string;
    avatarUrl: string | undefined;
    hcp: number | null;
    gruppe: string | undefined;
  };
  let inviterbareSpillere: Inviterbar[] = [];
  if (kanInvitere) {
    const inviterte = new Set(session.participants.map((p) => p.userId));
    inviterte.add(user.id); // host kan ikke invitere seg selv
    const kandidater = await prisma.user.findMany({
      where: {
        role: "PLAYER",
        deletedAt: null,
        id: { notIn: Array.from(inviterte) },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        hcp: true,
        homeClub: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });
    inviterbareSpillere = kandidater.map((k) => ({
      id: k.id,
      name: k.name,
      avatarUrl: k.avatarUrl ?? undefined,
      hcp: k.hcp,
      gruppe: k.homeClub ?? undefined,
    }));
  }

  const deltakere: OktPlanlagtDeltaker[] = session.participants.map((p) => ({
    id: p.id,
    navn: p.user.name,
    statusLabel: STATUS_LABEL[p.status] ?? p.status,
    statusTone: STATUS_TONE[p.status] ?? "info",
  }));

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren">Tilbake</TilbakeLenke>
      <OktPlanlagtV2
        data={{
          sessionId: session.id,
          timing: isToday ? "idag" : isOverdue ? "forfalt" : "fremtid",
          datoLang: formatDateLong(session.startTime),
          tittel: session.title,
          varighet,
          startTid: formatTime(session.startTime),
          miljo: session.miljo,
          coachNotat: session.notes,
          coachNotatTid: relativeTime(session.updatedAt ?? session.startTime),
          coachNavn: "Anders Kristiansen",
          drills: session.drills.map((d) => ({
            id: d.id,
            navn: d.name,
            durationMinutes: d.durationMinutes,
            repetitions: d.repetitions,
            pyramide: d.pyramide,
          })),
          totalDrillMin,
          erDelt: session.isShared,
          deltakere,
          maxDeltakere: session.maxParticipants,
          erHost,
        }}
        inviterSlot={
          kanInvitere ? (
            <InviteFriendTrigger
              sessionId={session.id}
              hostId={user.id}
              maxParticipants={session.maxParticipants ?? 8}
              currentParticipants={session.participants.length}
              spillere={inviterbareSpillere}
              label="Inviter kompis"
            />
          ) : undefined
        }
      />
    </V2Shell>
  );
}
