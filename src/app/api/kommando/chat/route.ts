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
import { logError } from "@/lib/error-tracking";
import { chatBodySchema } from "@/lib/validation/api-schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT =
  "Du er en assistent i Anders' personlige kommandosenter (AK Agency OS). " +
  "Svar kort, konkret og på norsk bokmål. Vær praktisk og handlingsorientert.";

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

  let rå: unknown;
  try {
    rå = await req.json();
  } catch {
    return new Response("Ugyldig JSON-payload", { status: 400 });
  }

  // zod ved API-grensen (gotchas.md) — erstatter `as ChatRequestBody` + den
  // håndskrevne type guarden. Ugyldig form gir 400, ikke en 500 lenger inne.
  const validert = chatBodySchema.safeParse(rå);
  if (!validert.success) {
    return new Response("`messages` må være en liste med UI-meldinger", { status: 400 });
  }

  const modelId = isKommandoModelId(validert.data.model) ? validert.data.model : DEFAULT_MODEL;
  const conversationId = validert.data.conversationId ?? null;
  // zod har bekreftet FORMEN; type guarden smalner typen uten cast
  // (`as unknown as T` er forbudt for forretningskritiske data, CLAUDE.md invariant 6).
  if (!isUIMessageArray(validert.data.messages)) {
    return new Response("`messages` må være en liste med UI-meldinger", { status: 400 });
  }
  const messages = validert.data.messages;

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
    model: await resolveKommandoModel(modelId),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    maxRetries: 2,
    onFinish: async ({ text }) => {
      if (!conversationId) return;
      try {
        await prisma.kommandoMessage.create({
          data: { userId: user.id, conversationId, role: "assistant", content: text, model: modelId },
        });
      } catch (error) {
        // Persistering må aldri ta ned stream-responsen — logg og fortsett.
        await logError({ context: "kommando.chat.persister-assistant-melding", error, severity: "warn", meta: { conversationId, userId: user.id } });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
