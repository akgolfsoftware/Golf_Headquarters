// Ekte AI-plan-generator for én spiller. Bruker genererPlan() fra
// src/lib/ai-plan/generate.ts — ikke lenger stub.
// POST { playerId, prompt?, iterationOf?, feedback? }

import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { genererPlan } from "@/lib/ai-plan/generate";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  playerId?: string;
  prompt?: string;
  iterationOf?: string;
  feedback?: string;
};

export async function POST(req: Request) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const playerId = body.playerId?.trim();
  if (!playerId) {
    return NextResponse.json({ error: "playerId mangler." }, { status: 400 });
  }

  const brukerPrompt =
    body.prompt?.trim() ||
    "Lag en 4-ukers treningsplan tilpasset spillerens nivå og tilgjengelige fasiliteter.";

  try {
    const resultat = await genererPlan({
      userId: playerId,
      coachId: coach.id,
      brukerPrompt,
      iterationOf: body.iterationOf,
      feedback: body.feedback,
    });

    return NextResponse.json({
      generationId: resultat.generationId,
      templateId: resultat.templateId,
      forslag: resultat.forslag,
    });
  } catch (err) {
    const melding = err instanceof Error ? err.message : "Ukjent feil";
    return NextResponse.json({ error: melding }, { status: 500 });
  }
}
