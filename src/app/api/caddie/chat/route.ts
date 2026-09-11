// POST /api/caddie/chat
// Caddie chat-engine. Streamer responser fra Claude Sonnet 4.6 direkte via
// Anthropic-APIet (ANTHROPIC_API_KEY) — Vercel AI Gateway free-tier gir ikke
// modell-tilgang. Persisterer både bruker- og assistant-meldinger til
// CaddieMessage. Krever ADMIN-rolle (canAccessMissionControl).

import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { anthropicProvider, modelFor } from "@/lib/ai/client";
import { CADDIE_SYSTEM_PROMPT } from "@/lib/caddie/system-prompt";
import { buildCaddieTools } from "@/lib/caddie/tools";
import { logError } from "@/lib/error-tracking";
import { chatBodySchema } from "@/lib/validation/api-schemas";
import { createCaddiePrivacy } from "@/lib/caddie/privacy";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = modelFor("caddie-chat");

const anthropic = anthropicProvider();

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
    return new Response("`messages` må være en liste med UI-meldinger", {
      status: 400,
    });
  }

  const conversationId = validert.data.conversationId ?? null;
  // zod har bekreftet FORMEN; type guarden smalner typen uten cast
  // (`as unknown as T` er forbudt for forretningskritiske data, CLAUDE.md invariant 6).
  if (!isUIMessageArray(validert.data.messages)) {
    return new Response("`messages` må være en liste med UI-meldinger", { status: 400 });
  }
  const messages = validert.data.messages;

  // Samtale-ID fra nettleseren gir aldri rett til en annen admins historikk.
  let privacy: ReturnType<typeof createCaddiePrivacy>;
  try {
    if (conversationId && !(await prisma.caddieConversation.findFirst({
      where: { id: conversationId, userId: user.id }, select: { id: true },
    }))) return new Response("Samtalen er ikke tilgjengelig", { status: 404 });
    // Identitetskartet brukes kun lokalt. Også tidligere/selvbetjente brukere
    // kan være nevnt i historikken; ingen profiler eller treningsdata hentes.
    const identities = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true }, orderBy: { id: "asc" },
    });
    privacy = createCaddiePrivacy(identities);
  } catch {
    // Ingen uanonymisert reservevei når identitetskartet ikke kan bygges.
    return new Response("Caddie er midlertidig utilgjengelig", { status: 503 });
  }
  let safeMessages: UIMessage[];
  try { safeMessages = privacy.messages(messages); }
  catch { return new Response("Ugyldige meldinger", { status: 400 }); }
  if (!safeMessages.length) return new Response("Skriv en tekstmelding", { status: 400 });

  // Persister siste bruker-melding hvis vi har en samtale-id
  if (conversationId) {
    const userText = extractLastUserText(messages);
    if (userText && userText.length > 0) {
      try { await prisma.caddieMessage.create({
        data: {
          userId: user.id,
          conversationId,
          role: "user",
          content: userText,
        },
      }); } catch { return new Response("Kunne ikke lagre meldingen", { status: 503 }); }
    }
  }

  const modelMessages = await convertToModelMessages(safeMessages);

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: CADDIE_SYSTEM_PROMPT,
    messages: modelMessages,
    tools: privacy.tools(buildCaddieTools(user), async (proposal) => {
      if (!conversationId) throw new Error("Et forslag krever en lagret samtale");
      const { needsApproval: _approval, type: _type, previewText, ...forslag } = proposal.output;
      await prisma.caddieDraft.create({ data: {
        userId: user.id, conversationId, toolCallId: proposal.toolCallId,
        toolName: proposal.toolName,
        toolInput: { ...proposal.input, ...forslag } as object,
        previewText: typeof previewText === "string" ? previewText : "",
        status: "PENDING",
      } });
    }),
    // La modellen fortsette etter at et lese-verktøy er kjørt, så den faktisk
    // svarer (uten dette stopper streamText etter første tool-call).
    stopWhen: stepCountIs(5),
    maxRetries: 2,
    onError: () => {}, // Provider-feil kan inneholde payload; send bare generisk strømfeil.
    onFinish: async ({ text, usage, toolCalls, toolResults }) => {
      if (!conversationId) return;
      try {
        await prisma.caddieMessage.create({
          data: {
            userId: user.id,
            conversationId,
            role: "assistant",
            content: privacy.text(text),
            toolCalls: privacy.output(toolCalls) as object,
            toolResults: privacy.output(toolResults) as object,
            inputTokens: usage?.inputTokens ?? null,
            outputTokens: usage?.outputTokens ?? null,
            model: MODEL_ID,
          },
        });
      } catch {
        // Persistering må aldri ta ned stream-responsen — logg og fortsett.
        await logError({ context: "caddie.chat.persister-assistant-melding", error: new Error("Kunne ikke lagre Caddie-svar"), severity: "warn" });
      }

    },
  });

  return result.toUIMessageStreamResponse({ onError: () => "Caddie kunne ikke fullføre svaret. Prøv igjen." });
}
