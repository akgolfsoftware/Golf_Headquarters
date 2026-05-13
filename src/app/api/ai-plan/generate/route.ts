// POST /api/ai-plan/generate
// Genererer AI-plan-forslag for en spiller. Krever COACH eller ADMIN.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { rateLimit } from "@/lib/rate-limit";
import { genererPlan } from "@/lib/ai-plan/generate";

export const runtime = "nodejs";
export const maxDuration = 90;

type RequestBody = {
  userId?: unknown;
  brukerPrompt?: unknown;
  iterationOf?: unknown;
  feedback?: unknown;
};

export async function POST(req: Request) {
  const coach = await getCurrentUser();
  if (!coach || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = rateLimit({
    key: `ai-plan-generate:${coach.id}`,
    max: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  if (typeof body.userId !== "string" || body.userId.length === 0) {
    return NextResponse.json({ error: "manglende-userId" }, { status: 400 });
  }
  if (typeof body.brukerPrompt !== "string" || body.brukerPrompt.trim().length < 5) {
    return NextResponse.json({ error: "for-kort-prompt" }, { status: 400 });
  }
  const iterationOf =
    typeof body.iterationOf === "string" && body.iterationOf.length > 0
      ? body.iterationOf
      : undefined;
  const feedback =
    typeof body.feedback === "string" && body.feedback.length > 0
      ? body.feedback
      : undefined;

  try {
    const res = await genererPlan({
      userId: body.userId,
      coachId: coach.id,
      brukerPrompt: body.brukerPrompt,
      iterationOf,
      feedback,
    });
    return NextResponse.json(res);
  } catch (err) {
    const melding = err instanceof Error ? err.message : "AI-feil.";
    return NextResponse.json({ error: melding }, { status: 500 });
  }
}
