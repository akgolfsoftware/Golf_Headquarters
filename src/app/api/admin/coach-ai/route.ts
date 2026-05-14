import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { anthropicKlient, COACH_MODEL } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { bygCoachSystemPrompt } from "@/lib/ai-plan/coach-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

type PlayerContext = {
  hcp: number | null;
  ambition: string | null;
  homeClub: string | null;
  tier: string;
  playingYears: number | null;
  sisteRunder: { dato: string; bane: string; score: number; sgTotal: number | null }[];
  aktivPlan: { navn: string; antallSesjoner: number; fullført: number } | null;
  sisteTester: { navn: string; score: number; dato: string }[];
};

type Melding = { role: "user" | "assistant"; content: string };

type RequestBody = {
  playerName: string;
  playerContext: PlayerContext;
  messages: Melding[];
};

function bygSystemPrompt(playerName: string, ctx: PlayerContext): string {
  return bygCoachSystemPrompt({
    mottaker: "coach",
    spillerNavn: playerName,
    hcp: ctx.hcp,
    ambition: ctx.ambition,
    homeClub: ctx.homeClub,
    tier: ctx.tier,
    playingYears: ctx.playingYears,
    aktivePlaner: ctx.aktivPlan
      ? [
          {
            navn: ctx.aktivPlan.navn,
            meta: `(${ctx.aktivPlan.fullført}/${ctx.aktivPlan.antallSesjoner} økter fullført)`,
          },
        ]
      : [],
    sisteRunder: ctx.sisteRunder,
    sisteTester: ctx.sisteTester,
  });
}

export async function POST(req: Request) {
  const coach = await getCurrentUser();
  if (!coach || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = await rateLimit({
    key: `coach-ai:${coach.id}`,
    max: 20,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } }
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

  const systemPrompt = bygSystemPrompt(body.playerName, body.playerContext);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
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
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
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
      "cache-control": "no-cache",
    },
  });
}
