/**
 * F3 scaffold: opplasting av spiller-swing-video.
 * Oppretter PlayerSwingVideo i PROCESSING — full pipeline kommer i F3.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { prisma } from "@/lib/prisma";

const UploadBody = z.object({
  videoUrl: z.string().url(),
  liveSessionId: z.string().optional(),
  liveSessionKind: z.enum(["plan-session", "session-v2"]).optional(),
  drillId: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isAwaitingGuardianConsent(user)) {
    return NextResponse.json(
      { error: "guardian_consent_required" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = UploadBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid_body" },
      { status: 400 },
    );
  }

  const video = await prisma.playerSwingVideo.create({
    data: {
      userId: user.id,
      videoUrl: parsed.data.videoUrl,
      liveSessionId: parsed.data.liveSessionId,
      liveSessionKind: parsed.data.liveSessionKind,
      drillId: parsed.data.drillId,
      status: "PROCESSING",
      consentVerified: !user.requiresGuardianConsent,
      analysis: {
        create: { status: "PENDING" },
      },
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    ok: true,
    videoId: video.id,
    status: video.status,
    pipeline: "awaiting_f3",
  });
}