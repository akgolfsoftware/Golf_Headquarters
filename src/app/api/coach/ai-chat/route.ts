import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  anthropicKlient,
  bygSystemPrompt,
  COACH_MODEL,
  type ChatMelding,
} from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

type RequestBody = {
  sessionId: string | null;
  messages: ChatMelding[];
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (user.tier === "GRATIS") {
    return NextResponse.json({ error: "upgrade-required" }, { status: 402 });
  }

  // Rate-limit: 10 meldinger per minutt per bruker
  const rl = await rateLimit({
    key: `ai-chat:${user.id}`,
    max: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited", resetAt: rl.resetAt },
      {
        status: 429,
        headers: { "x-ratelimit-reset": String(rl.resetAt) },
      }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "no-messages" }, { status: 400 });
  }

  // Lengde-validering — hindrer at en angriper tømmer Anthropic-budsjettet.
  const MAX_MELDINGER = 50;
  const MAX_TEGN_PER_MELDING = 4000;
  if (body.messages.length > MAX_MELDINGER) {
    return NextResponse.json(
      { error: "too-many-messages", limit: MAX_MELDINGER },
      { status: 413 }
    );
  }
  for (const m of body.messages) {
    if (typeof m.content !== "string" || m.content.length > MAX_TEGN_PER_MELDING) {
      return NextResponse.json(
        { error: "message-too-long", limit: MAX_TEGN_PER_MELDING },
        { status: 413 }
      );
    }
  }

  // Hent kontekst for system-prompt
  const [aktivePlaner, sisteRunder] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: { userId: user.id, isActive: true },
    }),
    prisma.round.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { playedAt: "desc" },
      take: 5,
    }),
  ]);

  const systemPrompt = bygSystemPrompt({
    user,
    aktivePlaner,
    sisteRunder,
  });

  // Finn eller opprett session
  let sessionId = body.sessionId;
  if (!sessionId) {
    // Bruk første tilgjengelige COACH som "coachId" for AI-sesjoner.
    // Hvis ingen finnes, faller tilbake på user.id selv (AI-sesjoner uten coach).
    const coach = await prisma.user.findFirst({
      where: { role: "COACH" },
      select: { id: true },
    });
    const coachId = coach?.id ?? user.id;

    const ny = await prisma.coachingSession.create({
      data: {
        userId: user.id,
        coachId,
        kind: "AI",
        messages: [],
      },
    });
    sessionId = ny.id;
  }

  // Anthropic-streaming
  let klient;
  try {
    klient = anthropicKlient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "no-client" },
      { status: 500 }
    );
  }

  const apiMessages = body.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullSvar = "";
      try {
        const respons = await klient.messages.stream({
          model: COACH_MODEL,
          max_tokens: 1024,
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

        // Persistér hele samtalen
        const oppdatertHistorikk: ChatMelding[] = [
          ...body.messages,
          { role: "assistant", content: fullSvar },
        ];
        await prisma.coachingSession.update({
          where: { id: sessionId! },
          data: { messages: oppdatertHistorikk },
        });
      } catch (err) {
        const melding =
          err instanceof Error ? err.message : "AI-feil. Prøv igjen.";
        controller.enqueue(encoder.encode(`\n\n[Feil: ${melding}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-session-id": sessionId,
      "cache-control": "no-cache",
    },
  });
}
