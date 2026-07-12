"use server";

import { erCoachetSpiller } from "@/lib/auth/coached";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CoachProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  initials: string;
} | null;

export type CoachMessageItem = {
  id: string;
  role: "me" | "coach";
  body: string;
  ts: string;
};

export type PlanChangeRequestItem = {
  id: string;
  changeType: "MOVE" | "DELETE" | "EDIT" | "CREATE";
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  coachNote: string | null;
  createdAt: Date;
};

export type UpcomingSessionItem = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  locationName: string | null;
  status: string;
};

export type CoachNoteItem = {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  createdAt: Date;
};

type JsonMessage = { role?: string; content?: string; ts?: string };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function resolvePrimaryCoach(playerId: string): Promise<CoachProfile> {
  // 1. Prøv aktiv program-enrollering med coach
  const enrollment = await prisma.playerEnrollment.findFirst({
    where: { userId: playerId, endedAt: null, coachId: { not: null } },
    orderBy: { enrolledAt: "desc" },
    include: { coach: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true } } },
  });

  if (enrollment?.coach) {
    return {
      ...enrollment.coach,
      initials: initials(enrollment.coach.name),
    };
  }

  // 2. Siste direkte coaching-session
  const session = await prisma.coachingSession.findFirst({
    where: { userId: playerId, kind: "DIRECT" },
    orderBy: { updatedAt: "desc" },
    include: { coach: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true } } },
  });

  if (session?.coach) {
    return { ...session.coach, initials: initials(session.coach.name) };
  }

  // 3. Fallback: første coach i systemet
  const firstCoach = await prisma.user.findFirst({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true },
    orderBy: { name: "asc" },
  });

  if (firstCoach) {
    return { ...firstCoach, initials: initials(firstCoach.name) };
  }

  return null;
}

async function resolveDirectThread(playerId: string, coachId: string) {
  return prisma.coachingSession.findFirst({
    where: { userId: playerId, coachId, kind: "DIRECT" },
    orderBy: { updatedAt: "desc" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch coach profile
// ─────────────────────────────────────────────────────────────────────────────

export async function getCoachProfile(): Promise<CoachProfile> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  return resolvePrimaryCoach(user.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch messages
// ─────────────────────────────────────────────────────────────────────────────

export async function getMessages(coachId: string): Promise<CoachMessageItem[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const thread = await resolveDirectThread(user.id, coachId);
  if (!thread) return [];

  const raw = Array.isArray(thread.messages) ? (thread.messages as JsonMessage[]) : [];

  return raw
    .filter((m): m is JsonMessage => typeof m === "object" && m !== null)
    .map((m, i) => ({
      id: `${thread.id}-m${i}`,
      role: m.role === "user" ? ("me" as const) : ("coach" as const),
      body: String(m.content ?? ""),
      ts: String(m.ts ?? new Date().toISOString()),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Send message
// ─────────────────────────────────────────────────────────────────────────────

const SendMessageSchema = z.object({
  coachId: z.string().min(1),
  content: nonEmpty(4000),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

export async function sendMessage(input: SendMessageInput): Promise<void> {
  const parsed = SendMessageSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  // I0 (LÅST regel): selvbetjente (PLATFORM_ONLY uten gruppe) har ingen
  // coachrelasjon — kan ikke sende meldinger til coach.
  if (!(await erCoachetSpiller(user.id))) throw new Error("ikke-coachet");

  const coach = await prisma.user.findFirst({
    where: { id: parsed.coachId, role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
  });
  if (!coach) throw new Error("coach-not-found");

  const nyMelding: Prisma.InputJsonValue = {
    role: "user",
    content: parsed.content.trim(),
    ts: new Date().toISOString(),
  };

  const eksisterende = await resolveDirectThread(user.id, coach.id);

  if (eksisterende) {
    const eksisterendeMeldinger = Array.isArray(eksisterende.messages)
      ? (eksisterende.messages as Prisma.InputJsonValue[])
      : [];
    await prisma.coachingSession.update({
      where: { id: eksisterende.id },
      data: { messages: [...eksisterendeMeldinger, nyMelding] },
    });
  } else {
    await prisma.coachingSession.create({
      data: {
        userId: user.id,
        coachId: coach.id,
        kind: "DIRECT",
        messages: [nyMelding] as Prisma.InputJsonValue[],
      },
    });
  }

  revalidatePath("/portal/coach");
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch plan change requests
// ─────────────────────────────────────────────────────────────────────────────

export async function getPlanChangeRequests(): Promise<PlanChangeRequestItem[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const rows = await prisma.planChangeRequest.findMany({
    where: { playerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return rows.map((r) => ({
    id: r.id,
    changeType: r.changeType as PlanChangeRequestItem["changeType"],
    description: describeChangeRequest(r),
    status: r.status as PlanChangeRequestItem["status"],
    coachNote: r.coachNote,
    createdAt: r.createdAt,
  }));
}

function describeChangeRequest(
  r: Prisma.PlanChangeRequestGetPayload<{ select: { changeType: true; payload: true } }>,
) {
  const payload = (typeof r.payload === "object" && r.payload !== null ? r.payload : {}) as Record<string, unknown>;
  const note = String(payload.note ?? payload.description ?? "");
  if (note) return note;

  switch (r.changeType) {
    case "MOVE":
      return `Forespørsel om å flytte økt${payload.newDate ? ` til ${new Date(String(payload.newDate)).toLocaleDateString("nb-NO")}` : ""}`;
    case "DELETE":
      return "Forespørsel om å slette økt";
    case "EDIT":
      return "Forespørsel om å endre økt";
    case "CREATE":
      return "Forespørsel om ny økt";
    default:
      return "Planendring";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Create plan change request
// ─────────────────────────────────────────────────────────────────────────────

const CreatePlanChangeRequestSchema = z.object({
  changeType: z.enum(["MOVE", "DELETE", "EDIT", "CREATE"]),
  planId: z.string().optional(),
  sessionId: z.string().optional(),
  note: nonEmpty(1000),
});

export type CreatePlanChangeRequestInput = z.infer<typeof CreatePlanChangeRequestSchema>;

export async function createPlanChangeRequest(input: CreatePlanChangeRequestInput): Promise<void> {
  const parsed = CreatePlanChangeRequestSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const coach = await resolvePrimaryCoach(user.id);

  await prisma.planChangeRequest.create({
    data: {
      playerId: user.id,
      coachId: coach?.id ?? null,
      planId: parsed.planId ?? null,
      sessionId: parsed.sessionId ?? null,
      changeType: parsed.changeType,
      status: "PENDING",
      payload: { note: parsed.note } as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/portal/coach");
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch upcoming sessions
// ─────────────────────────────────────────────────────────────────────────────

export async function getUpcomingSessions(): Promise<UpcomingSessionItem[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const now = new Date();

  // Kombiner fremtidige bookinger med coachens treningsplan-sesjoner
  const [bookings, planSessions] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId: user.id,
        startAt: { gte: now },
        coachId: { not: null },
      },
      include: { location: { select: { name: true } }, serviceType: { select: { name: true } } },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: user.id },
        scheduledAt: { gte: now },
      },
      include: { plan: { select: { name: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
  ]);

  const mappedBookings: UpcomingSessionItem[] = bookings.map((b) => ({
    id: `booking-${b.id}`,
    title: b.serviceType?.name ?? "Coaching-time",
    startAt: b.startAt,
    endAt: b.endAt,
    locationName: b.location?.name ?? null,
    status: b.status,
  }));

  const mappedPlanSessions: UpcomingSessionItem[] = planSessions.map((s) => ({
    id: `plan-${s.id}`,
    title: s.title,
    startAt: s.scheduledAt,
    endAt: new Date(s.scheduledAt.getTime() + s.durationMin * 60_000),
    locationName: null,
    status: s.status,
  }));

  return [...mappedBookings, ...mappedPlanSessions]
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch coach notes visible to player
// ─────────────────────────────────────────────────────────────────────────────

export async function getCoachNotes(): Promise<CoachNoteItem[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const rows = await prisma.coachNote.findMany({
    where: { playerId: user.id, isPrivate: false },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return rows.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    tags: n.tags,
    createdAt: n.createdAt,
  }));
}
