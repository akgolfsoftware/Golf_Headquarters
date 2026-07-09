// AI Golf Coach — chat under en AKTIV live treningsøkt (plan-session eller
// session-v2). Streamer svaret som text/plain (samme mønster som
// /api/coach/ai-chat) og persisterer samtalen på en CoachingSession-tråd
// med kind "LIVE" bundet til den konkrete økta.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { anthropic, AI_MODEL, isAiEnabled } from "@/lib/ai/client";
import { recallMemory, formatMemoryForPrompt } from "@/lib/ai/memory";
import { hentLiveCoachKontext } from "@/lib/ai/live-coach-context";
import { bygLiveCoachSystemPrompt, type SystemPromptInput } from "@/lib/ai-plan/coach-prompt";
import type { LiveSessionKind } from "@/lib/agents/live-coach-agent";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMelding = {
  role: "user" | "assistant";
  content: string;
  ts?: string;
};

type MeldingRad = {
  role: "user" | "assistant" | "coach" | "system";
  content: string;
  ts: string;
};

type RequestBody = {
  sessionId: string;
  kind: LiveSessionKind;
  threadId?: string | null;
  drillId?: string;
  messages: ChatMelding[];
};

const GYLDIGE_KIND: LiveSessionKind[] = ["plan-session", "session-v2"];

type EierskapResultat =
  | { ok: true; status: string; coachId: string | null }
  | { ok: false; httpStatus: number };

/** Verifiserer at brukeren eier/deltar i live-økta. Speiler live-actions sin eierskap-logikk. */
async function verifiserOkt(
  sessionId: string,
  kind: LiveSessionKind,
  userId: string,
): Promise<EierskapResultat> {
  if (kind === "plan-session") {
    const session = await prisma.trainingPlanSession.findUnique({
      where: { id: sessionId },
      select: { status: true, plan: { select: { userId: true, createdById: true } } },
    });
    if (!session) return { ok: false, httpStatus: 404 };
    if (session.plan.userId !== userId) return { ok: false, httpStatus: 403 };
    return { ok: true, status: session.status, coachId: session.plan.createdById };
  }

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      status: true,
      studentId: true,
      hostId: true,
      coachId: true,
      participants: { where: { userId }, select: { status: true } },
    },
  });
  if (!session) return { ok: false, httpStatus: 404 };

  const isOwner =
    session.studentId === userId || session.hostId === userId || session.coachId === userId;
  const isParticipant = session.participants.some((p) =>
    ["ACCEPTED", "ATTENDED"].includes(p.status),
  );
  if (!isOwner && !isParticipant) return { ok: false, httpStatus: 403 };
  return { ok: true, status: session.status, coachId: session.coachId };
}

/** Sjekker at økta faktisk er i gang. ACTIVE for plan-session, IN_PROGRESS for session-v2. */
function sjekkAktivStatus(kind: LiveSessionKind, status: string): number | null {
  if (status === "COMPLETED") return 409;
  const forventet = kind === "plan-session" ? "ACTIVE" : "IN_PROGRESS";
  if (status !== forventet) return 400;
  return null;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (user.tier === "GRATIS") {
    return NextResponse.json({ error: "upgrade-required" }, { status: 402 });
  }

  const rl = await rateLimit({
    key: `live-coach-chat:${user.id}`,
    max: 20,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited", resetAt: rl.resetAt },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  if (!body.sessionId || !GYLDIGE_KIND.includes(body.kind)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "no-messages" }, { status: 400 });
  }

  const MAX_MELDINGER = 50;
  const MAX_TEGN_PER_MELDING = 4000;
  if (body.messages.length > MAX_MELDINGER) {
    return NextResponse.json(
      { error: "too-many-messages", limit: MAX_MELDINGER },
      { status: 413 },
    );
  }
  for (const m of body.messages) {
    if (typeof m.content !== "string" || m.content.length > MAX_TEGN_PER_MELDING) {
      return NextResponse.json(
        { error: "message-too-long", limit: MAX_TEGN_PER_MELDING },
        { status: 413 },
      );
    }
  }

  const eierskap = await verifiserOkt(body.sessionId, body.kind, user.id);
  if (!eierskap.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: eierskap.httpStatus });
  }
  const statusFeil = sjekkAktivStatus(body.kind, eierskap.status);
  if (statusFeil !== null) {
    return NextResponse.json(
      { error: statusFeil === 409 ? "session-completed" : "session-not-active" },
      { status: statusFeil },
    );
  }

  const kontekst = await hentLiveCoachKontext({
    userId: user.id,
    sessionId: body.sessionId,
    kind: body.kind,
    drillId: body.drillId,
  });
  if (!kontekst) {
    return NextResponse.json({ error: "session-not-found" }, { status: 404 });
  }
  if (!isAiEnabled() || !anthropic) {
    return NextResponse.json({ error: "ai-disabled" }, { status: 500 });
  }

  const {
    mottaker,
    spillerNavn,
    hcp,
    ambition,
    homeClub,
    tier,
    playingYears,
    aktivePlaner,
    sisteRunder,
    sisteTester,
    ...live
  } = kontekst;
  const base: SystemPromptInput = {
    mottaker,
    spillerNavn,
    hcp,
    ambition,
    homeClub,
    tier,
    playingYears,
    aktivePlaner,
    sisteRunder,
    sisteTester,
  };
  let systemPrompt = bygLiveCoachSystemPrompt(base, live);
  const memory = await recallMemory(user.id);
  systemPrompt += formatMemoryForPrompt(memory);

  // Finn eller opprett LIVE-tråden for denne økta.
  let thread = await prisma.coachingSession.findUnique({
    where: { userId_liveSessionId: { userId: user.id, liveSessionId: body.sessionId } },
  });
  if (!thread) {
    const coachId = eierskap.coachId ?? user.id;
    thread = await prisma.coachingSession.create({
      data: {
        userId: user.id,
        coachId,
        kind: "LIVE",
        liveSessionId: body.sessionId,
        liveSessionKind: body.kind,
        messages: [],
      },
    });
  }
  const threadId = thread.id;

  const apiMessages = body.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullSvar = "";
      try {
        const respons = await anthropic!.messages.stream({
          model: AI_MODEL,
          max_tokens: 512,
          system: systemPrompt,
          messages: apiMessages,
        });

        for await (const event of respons) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const tekst = event.delta.text;
            fullSvar += tekst;
            controller.enqueue(encoder.encode(tekst));
          }
        }

        const nowISO = new Date().toISOString();
        const oppdatertHistorikk: MeldingRad[] = [
          ...body.messages.map((m) => ({
            role: m.role,
            content: m.content,
            ts: m.ts ?? nowISO,
          })),
          { role: "assistant" as const, content: fullSvar, ts: nowISO },
        ];
        await prisma.coachingSession.update({
          where: { id: threadId },
          data: { messages: oppdatertHistorikk as unknown as Prisma.InputJsonValue },
        });
      } catch (err) {
        const melding = err instanceof Error ? err.message : "AI-feil. Prøv igjen.";
        controller.enqueue(encoder.encode(`\n\n[Feil: ${melding}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-thread-id": threadId,
      "cache-control": "no-cache",
    },
  });
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const kind = url.searchParams.get("kind") as LiveSessionKind | null;
  if (!sessionId || !kind || !GYLDIGE_KIND.includes(kind)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  // Unik nøkkel er scopet til (userId, liveSessionId) — sikrer at brukeren
  // kun kan hente sin egen tråd, uten egen eierskap-sjekk mot selve økta.
  const thread = await prisma.coachingSession.findUnique({
    where: { userId_liveSessionId: { userId: user.id, liveSessionId: sessionId } },
  });

  return NextResponse.json({
    threadId: thread?.id ?? null,
    messages: thread?.messages ?? [],
  });
}
