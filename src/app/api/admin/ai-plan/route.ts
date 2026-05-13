// Lett-vekt AI-plan-stub for "AI-foreslå plan"-knappen i admin.
// Den ekte plan-generatoren ligger i /api/ai-plan/generate (Anthropic).
// Denne ruten returnerer en hardkodet skisse + logger til AuditLog,
// og brukes som rask preview før coach går videre til full generering.

import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { audit } from "@/lib/audit";

type Body = {
  playerId?: string;
  fokusOmrader?: string[];
};

export async function POST(req: Request) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const playerId = body.playerId?.trim();
  if (!playerId) {
    return NextResponse.json(
      { error: "playerId mangler." },
      { status: 400 },
    );
  }

  const fokus =
    body.fokusOmrader && body.fokusOmrader.length > 0
      ? body.fokusOmrader.join(", ")
      : "putting under 3m, wedge-distansekontroll, mental rutine";

  const suggestion =
    `6-ukers progresjonsplan med fokus på ${fokus}. ` +
    `4 økter per uke (75 min): 2 tekniske, 1 spilløkt på korthullsbane, ` +
    `1 mental/restitusjon. Uke 1-2 etablering, uke 3-4 progresjon, ` +
    `uke 5 turnerings-simulering, uke 6 tapering. ` +
    `Måling via SG-test før og etter.`;

  await audit({
    actorId: user.id,
    action: "agent.ai-plan.generated",
    target: playerId,
    metadata: {
      playerId,
      fokusOmrader: body.fokusOmrader ?? null,
      suggestion,
      stub: true,
    },
  });

  return NextResponse.json({ suggestion });
}
