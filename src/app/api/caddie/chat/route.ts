// POST /api/caddie/chat
// Caddie chat-engine. Streamer responser fra Claude Sonnet 4.6 via Vercel AI
// Gateway. Persisterer både bruker- og assistant-meldinger til CaddieMessage.
// Krever ADMIN-rolle (canAccessMissionControl).

import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { CADDIE_SYSTEM_PROMPT } from "@/lib/caddie/system-prompt";
import { CADDIE_TOOLS } from "@/lib/caddie/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = "anthropic/claude-sonnet-4.6" as const;

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
    model: gateway.languageModel(MODEL_ID),
    system: CADDIE_SYSTEM_PROMPT,
    messages: modelMessages,
    tools: CADDIE_TOOLS,
    maxRetries: 2,
    onFinish: async ({ text, usage, toolCalls, toolResults }) => {
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
    },
  });

  return result.toTextStreamResponse();
}
