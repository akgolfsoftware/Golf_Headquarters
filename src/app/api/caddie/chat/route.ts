// POST /api/caddie/chat
// Caddie chat-engine. Streamer responser fra Claude Sonnet 4.6 direkte via
// Anthropic-APIet (ANTHROPIC_API_KEY) — Vercel AI Gateway free-tier gir ikke
// modell-tilgang. Persisterer både bruker- og assistant-meldinger til
// CaddieMessage. Krever ADMIN-rolle (canAccessMissionControl).

import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { CADDIE_SYSTEM_PROMPT } from "@/lib/caddie/system-prompt";
import { buildCaddieTools } from "@/lib/caddie/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = "claude-sonnet-4-6" as const;

// ANTHROPIC_BASE_URL i miljøet peker på host uten "/v1" (funker for raw
// @anthropic-ai/sdk, men @ai-sdk/anthropic forventer at baseURL inkluderer
// "/v1"). Normaliser så provideren treffer riktig endepunkt.
const ANTHROPIC_BASE = (process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com").replace(/\/+$/, "");
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: ANTHROPIC_BASE.endsWith("/v1") ? ANTHROPIC_BASE : `${ANTHROPIC_BASE}/v1`,
});

type ChatRequestBody = {
  messages?: unknown;
  conversationId?: unknown;
};

function isUIMessageArray(value: unknown): value is UIMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        typeof m === "object" &&
        m !== null &&
        "role" in m &&
        typeof (m as { role: unknown }).role === "string",
    )
  );
}

function extractLastUserText(messages: UIMessage[]): string | null {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return null;
  // UIMessage har enten `parts` (v6) eller `content` (eldre form).
  const anyMsg = last as unknown as {
    parts?: Array<{ type?: string; text?: string }>;
    content?: unknown;
  };
  if (Array.isArray(anyMsg.parts)) {
    return anyMsg.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
      .join("\n");
  }
  if (typeof anyMsg.content === "string") return anyMsg.content;
  if (anyMsg.content != null) return JSON.stringify(anyMsg.content);
  return null;
}

export async function POST(req: Request) {
  const user = await canAccessMissionControl();
  if (!user) {
    return new Response("Ikke autorisert", { status: 401 });
  }

  // Rate-limit: 10 AI-requester per minutt per admin-bruker.
  const rl = await rateLimit({ key: `caddie-chat:${user.id}`, max: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return new Response("For mange requester — prøv igjen om litt.", {
      status: 429,
      headers: { "x-ratelimit-reset": String(rl.resetAt) },
    });
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response("Ugyldig JSON-payload", { status: 400 });
  }

  if (!isUIMessageArray(body.messages)) {
    return new Response("`messages` må være en liste med UI-meldinger", {
      status: 400,
    });
  }

  const conversationId =
    typeof body.conversationId === "string" && body.conversationId.length > 0
      ? body.conversationId
      : null;

  const messages = body.messages;

  // Persister siste bruker-melding hvis vi har en samtale-id
  if (conversationId) {
    const userText = extractLastUserText(messages);
    if (userText && userText.length > 0) {
      await prisma.caddieMessage.create({
        data: {
          userId: user.id,
          conversationId,
          role: "user",
          content: userText,
        },
      });
    }
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: CADDIE_SYSTEM_PROMPT,
    messages: modelMessages,
    tools: buildCaddieTools(user),
    // La modellen fortsette etter at et lese-verktøy er kjørt, så den faktisk
    // svarer (uten dette stopper streamText etter første tool-call).
    stopWhen: stepCountIs(5),
    maxRetries: 2,
    onFinish: async ({ text, usage, toolCalls, toolResults, steps }) => {
      if (!conversationId) return;
      try {
        await prisma.caddieMessage.create({
          data: {
            userId: user.id,
            conversationId,
            role: "assistant",
            content: text,
            toolCalls: toolCalls as unknown as object,
            toolResults: toolResults as unknown as object,
            inputTokens: usage?.inputTokens ?? null,
            outputTokens: usage?.outputTokens ?? null,
            model: MODEL_ID,
          },
        });
      } catch (err) {
        // Persistering må aldri ta ned stream-responsen — logg og fortsett.
        console.error("[caddie] kunne ikke persistere assistant-melding", err);
      }

      // A2: persister hvert write-forslag (needsApproval) som CaddieDraft
      // (PENDING) slik at det overlever samtalen og dukker opp i A1-køen på
      // /admin/godkjenninger. toolInput lagres som input+forslag samlet, så
      // approval-executor har alt den trenger (f.eks. subject/body for
      // fakturapurring) ved senere utførelse.
      try {
        const alleResultater = steps.flatMap((s) => s.toolResults ?? []);
        for (const r of alleResultater) {
          const output = r.output as Record<string, unknown> | null | undefined;
          if (!output || output.needsApproval !== true) continue;

          const finnes = await prisma.caddieDraft.findFirst({
            where: { toolCallId: r.toolCallId, userId: user.id },
            select: { id: true },
          });
          if (finnes) continue;

          const { needsApproval: _na, type: _t, previewText, ...forslag } = output;
          await prisma.caddieDraft.create({
            data: {
              userId: user.id,
              conversationId,
              toolCallId: r.toolCallId,
              toolName: r.toolName,
              toolInput: { ...(r.input as Record<string, unknown>), ...forslag } as unknown as object,
              previewText: typeof previewText === "string" ? previewText : "",
              status: "PENDING",
            },
          });
        }
      } catch (err) {
        console.error("[caddie] kunne ikke persistere utkast", err);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
