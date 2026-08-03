// POST /api/portal/chat
//
// Portal-chat "I dag" — chat-først PlayerHQ-hjem (designport steg 7). Samme
// AI SDK v5-mønster som Caddie (src/app/api/caddie/chat/route.ts):
// streamText + tools + stepCountIs + toUIMessageStreamResponse. Forskjellen
// er gaten (spilleren selv, ikke ADMIN) og verktøyene (buildPortalChatTools —
// scopet på viewer.id, ikke en oppgitt playerId).
//
// Ingen meldingspersistering i denne PR-en. Å legge chat-historikk i en ny
// tabell er en egen schema-migrasjon (se .claude/rules/gotchas.md §Schema-
// endringer) og bevisst holdt utenfor UI-porten — se
// docs/port/plan-designport-alle-skjermer.md steg 7 PR1.

import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { rateLimit } from "@/lib/rate-limit";
import { anthropicProvider, modelFor } from "@/lib/ai/client";
import { buildPortalChatTools } from "@/lib/portal-chat/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = modelFor("portal-chat");
const anthropic = anthropicProvider();

const SYSTEM_PROMPT = `Du er PlayerHQ-assistenten til en golfspiller i AK Golf Academy.

REGLER:
1. Svar kort og konkret. Norsk bokmål alltid. Ingen emoji.
2. Når du trenger data om spillerens plan, økter eller resultater: kall riktig verktøy. Gjett aldri, finn aldri på tall.
3. Har du ikke et verktøy for noe (f.eks. sjekkpunkt-kobling, avstandsmåling innenfor en enkelt økt): si tydelig at det mangler i stedet for å dikte det opp.
4. Du gir ikke egne coaching-vurderinger — du oppsummerer det planen/coachen faktisk har satt. Metodikk-tolkning er coachens jobb, ikke din.
5. Tall i svaret skal alltid komme fra et verktøyresultat du nettopp hentet, aldri fra hukommelse.`;

type ChatRequestBody = { messages?: unknown };

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

export async function POST(req: Request) {
  // getCurrentUser() håndhever selv foreldresamtykke-redirect for mindreårige
  // (samme etablerte mønster som Caddies canAccessMissionControl) — ingen ny
  // gate-atferd introdusert her.
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT" || user.role === "GUEST") {
    return new Response("Ikke autorisert", { status: 401 });
  }

  const rl = await rateLimit({ key: `portal-chat:${user.id}`, max: 20, windowMs: 60_000 });
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

  const modelMessages = await convertToModelMessages(body.messages);

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: buildPortalChatTools({ id: user.id }),
    // La modellen fortsette etter et lese-verktøy, så den faktisk svarer
    // (uten dette stopper streamText etter første tool-call).
    stopWhen: stepCountIs(5),
    maxRetries: 2,
  });

  return result.toUIMessageStreamResponse();
}
