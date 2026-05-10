import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { anthropicKlient, COACH_MODEL } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";

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
  const profil = [
    `Spiller: ${playerName}`,
    ctx.hcp != null ? `HCP: ${ctx.hcp.toFixed(1).replace(".", ",")}` : null,
    ctx.playingYears != null ? `Spilt i ${ctx.playingYears} år` : null,
    ctx.homeClub ? `Hjemmeklubb: ${ctx.homeClub}` : null,
    ctx.ambition ? `Ambisjon: ${ctx.ambition}` : null,
    `Tier: ${ctx.tier}`,
  ]
    .filter(Boolean)
    .join("\n");

  const runder =
    ctx.sisteRunder.length > 0
      ? ctx.sisteRunder
          .map(
            (r) =>
              `- ${r.dato} · ${r.bane} · score ${r.score}${
                r.sgTotal != null ? ` · SG ${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1)}` : ""
              }`
          )
          .join("\n")
      : "Ingen registrerte runder.";

  const plan = ctx.aktivPlan
    ? `${ctx.aktivPlan.navn} (${ctx.aktivPlan.fullført}/${ctx.aktivPlan.antallSesjoner} økter fullført)`
    : "Ingen aktiv plan";

  const tester =
    ctx.sisteTester.length > 0
      ? ctx.sisteTester
          .map((t) => `- ${t.dato} · ${t.navn} · ${t.score.toFixed(1).replace(".", ",")}`)
          .join("\n")
      : "Ingen tester.";

  return `Du er AI-assistent for en AK Golf-coach som analyserer en spiller.

Du følger AK Golf-pyramidens fem områder: FYS (fysisk), TEK (teknisk),
SLAG (slag), SPILL (spill), TURN (turnering).

Tone: faglig, kortfattet, handlingsorientert. Snakk norsk bokmål.
Ingen emoji. Maks 200 ord per svar med mindre coach ber om mer.

Spilleren du analyserer:
${profil}

Aktiv plan: ${plan}

Siste runder:
${runder}

Siste tester:
${tester}

Retningslinjer:
- Gi konkrete observasjoner basert på dataene
- Når coach spør om "neste økt": foreslå pyramide-område + spesifikke drills
- Når coach spør om analyse: pek på tendenser i SG-tallene
- Si tydelig hvis du mangler data for å svare presist
- Aldri foreslå at coachen "snakker med spilleren" uten konkret innhold`;
}

export async function POST(req: Request) {
  const coach = await getCurrentUser();
  if (!coach || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = rateLimit({
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
