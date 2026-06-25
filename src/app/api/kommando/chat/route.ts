// POST /api/kommando/chat
// Kommando agent-chat. Streamer fra valgt modell (Claude/Gemini/Grok/Ollama).
// Gjenbruker caddie-mønsteret (streamText + toUIMessageStreamResponse). Krever
// ADMIN (canAccessMissionControl). Persisterer meldinger til kommando_messages.

import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { resolveKommandoModel } from "@/lib/kommando/providers";
import { DEFAULT_MODEL, isKommandoModelId } from "@/lib/kommando/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT =
  "Du er en assistent i Anders' personlige kommandosenter (AK Agency OS). " +
  "Svar kort, konkret og på norsk bokmål. Vær praktisk og handlingsorientert.";

type ChatRequestBody = {
  messages?: unknown;
  conversationId?: unknown;
  model?: unknown;
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

  // Rate-limit: 20 AI-requester per minutt per admin-bruker.
  const rl = await rateLimit({ key: `kommando-chat:${user.id}`, max: 20, windowMs: 60_000 });
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
    return new Response("`messages` må være en liste med UI-meldinger", { status: 400 });
  }

  const modelId = isKommandoModelId(body.model) ? body.model : DEFAULT_MODEL;
  const conversationId =
    typeof body.conversationId === "string" && body.conversationId.length > 0
      ? body.conversationId
      : null;
  const messages = body.messages;

  // Persister siste bruker-melding hvis vi har en samtale-id.
  if (conversationId) {
    const userText = extractLastUserText(messages);
    if (userText && userText.length > 0) {
      await prisma.kommandoMessage.create({
        data: { userId: user.id, conversationId, role: "user", content: userText, model: modelId },
      });
    }
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: resolveKommandoModel(modelId),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    maxRetries: 2,
    onFinish: async ({ text }) => {
      if (!conversationId) return;
      try {
        await prisma.kommandoMessage.create({
          data: { userId: user.id, conversationId, role: "assistant", content: text, model: modelId },
        });
      } catch (err) {
        // Persistering må aldri ta ned stream-responsen — logg og fortsett.
        console.error("[kommando] kunne ikke persistere assistant-melding", err);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
