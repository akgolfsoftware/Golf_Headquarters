// Episodisk minne-skriving ved øktslutt: oppsummerer LIVE-chattråden +
// spillerens egenvurdering til 1–3 varige minner i ai_memories.
//
// Idempotent per økt (sourceType "coaching-session" + sourceId sessionId) —
// CoachingSession.messages er en last-write-wins-blob, så gjentatte kall skal
// aldri duplisere. LLM-output valideres med zod (aldri rå JSON.parse — se
// plan-revision.ts som skrekkeksempel). Best effort: alle feil svelges og
// logges — øktslutt skal aldri knekke på minne-skriving.

import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL, isAiEnabled } from "./client";
import { writeMemories } from "./memory-store";

const MinneSchema = z.object({
  minner: z
    .array(
      z.object({
        innhold: z.string().min(10).max(400),
        kind: z.enum(["EPISODIC", "SEMANTIC"]),
      }),
    )
    .min(1)
    .max(3),
});

const SYSTEM = `Du destillerer en golf-treningsøkt til varige minner for en AI-coach.
Skriv 1–3 minner på norsk bokmål. Hvert minne er ÉN setning som er verdt å huske
om 3 måneder: hva spilleren jobbet med, hva som funket/ikke funket, cues som traff,
eller noe varig om spilleren (preferanse, mønster). EPISODIC = om denne økta;
SEMANTIC = varig innsikt om spilleren. Ikke gjenta rådata (tall, reps). Svar KUN
med JSON: {"minner":[{"innhold":"...","kind":"EPISODIC"}]}`;

export async function summarizeSessionToMemories(opts: {
  userId: string;
  sessionId: string;
  spillerVurdering?: { kvalitet: number; nesteFokus: string; rpe?: number | null };
}): Promise<{ written: number; skipped?: string }> {
  try {
    if (!isAiEnabled() || !anthropic) return { written: 0, skipped: "ai-disabled" };

    // Idempotens: allerede oppsummert → ikke rør.
    const finnes = await prisma.aiMemory.count({
      where: { sourceType: "coaching-session", sourceId: opts.sessionId },
    });
    if (finnes > 0) return { written: 0, skipped: "already-summarized" };

    const thread = await prisma.coachingSession.findUnique({
      where: {
        userId_liveSessionId: { userId: opts.userId, liveSessionId: opts.sessionId },
      },
      select: { messages: true },
    });
    const meldinger = Array.isArray(thread?.messages)
      ? (thread.messages as Array<{ role?: string; content?: string }>)
          .filter((m) => typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
          .slice(-30)
      : [];

    const vurdering = opts.spillerVurdering
      ? `\nSpillerens egenvurdering: kvalitet ${opts.spillerVurdering.kvalitet}/5` +
        (opts.spillerVurdering.rpe ? `, RPE ${opts.spillerVurdering.rpe}/10` : "") +
        (opts.spillerVurdering.nesteFokus ? `, neste fokus: «${opts.spillerVurdering.nesteFokus}»` : "")
      : "";

    if (meldinger.length === 0 && !vurdering) {
      return { written: 0, skipped: "no-content" };
    }

    const transkript = meldinger
      .map((m) => `${m.role === "user" ? "Spiller" : "Coach"}: ${m.content}`)
      .join("\n");

    const respons = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 512,
      system: SYSTEM,
      messages: [
        { role: "user", content: `Øktsamtale:\n${transkript || "(ingen chat)"}${vurdering}` },
      ],
    });
    const tekst = respons.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    const jsonMatch = tekst.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { written: 0, skipped: "no-json" };

    const parsed = MinneSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!parsed.success) return { written: 0, skipped: "invalid-schema" };

    const written = await writeMemories(
      parsed.data.minner.map((m) => ({
        playerId: opts.userId,
        kind: m.kind,
        content: m.innhold,
        metadata: { sessionId: opts.sessionId },
        sourceType: "coaching-session",
        sourceId: opts.sessionId,
      })),
    );
    return { written };
  } catch (err) {
    console.error("[memory-writer] feilet:", err);
    return { written: 0, skipped: "error" };
  }
}
