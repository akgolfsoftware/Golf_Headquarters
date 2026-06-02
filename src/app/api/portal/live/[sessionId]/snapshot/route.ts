/**
 * PlayerHQ · Live-økt — auto-save-endepunkt.
 *
 * Mål for både 60s auto-save (`fetch` keepalive) og `navigator.sendBeacon` ved
 * `beforeunload` (`?pause=1`). Upsert av `TrainingPlanSession.liveSnapshot`.
 * Idempotent: ren update av samme rad. Klienten gjør content-hash dedupe.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { LiveSnapshotSchema } from "@/lib/portal-live/data";
import { Prisma } from "@/generated/prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = LiveSnapshotSchema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { status: true, plan: { select: { userId: true } } },
  });
  if (!session) return new NextResponse(null, { status: 404 });

  const isOwner = session.plan.userId === user.id;
  if (!isOwner && user.role !== "ADMIN" && user.role !== "COACH") {
    return new NextResponse(null, { status: 403 });
  }

  // Lagre kun mens økta er aktiv eller pauset.
  if (session.status !== "ACTIVE" && session.status !== "PAUSED") {
    return new NextResponse(null, { status: 409 });
  }

  const pause = new URL(req.url).searchParams.get("pause") === "1";

  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: {
      liveSnapshot: parsed.data as unknown as Prisma.InputJsonValue,
      ...(pause ? { status: "PAUSED" as const } : {}),
    },
  });

  return new NextResponse(null, { status: 204 });
}
