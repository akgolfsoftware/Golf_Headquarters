// Nattlig minne-konsolidering (tiltak 2 fase 2, Fable 5-syntesen):
//
//   1. EPISODISK → SEMANTISK: spillere med mange gamle økt-minner får dem
//      destillert til varige profil-fakta (LLM, zod-validert). De konsumerte
//      episodiske radene slettes — provenans bevares i metadata.
//   2. PROSEDYRISK fra coach-beslutninger: PlanAction-utfall siste 30 dager
//      (godkjent uendret ≥ 2 ganger per handlingstype) → «dette virker for
//      denne spilleren». Leses via $queryRaw — beslutningskolonnene finnes i
//      DB uavhengig av prisma-skjemaet på denne grenen.
//   3. CoachNote-indeksering: nye ikke-private notater → SEMANTISK minne
//      (én batch-vei her, i stedet for hooks i tre opprettelsesflater).
//
// Utsatt til v2 (bevisst): motsigelses-håndtering, decay/strength-justering.

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL, isAiEnabled } from "@/lib/ai/client";
import { writeMemories } from "@/lib/ai/memory-store";
import { runAgent, type AgentResult } from "./agent-runner";

const AGENT_NAME = "memory-consolidation";

/** Konsolider når en spiller har flere episodiske minner enn dette. */
const EPISODIC_TERSKEL = 15;
/** Antall eldste episodiske som destilleres per kjøring. */
const EPISODIC_BATCH = 10;
/** Godkjent-uendret-forekomster før noe regnes som prosedyrisk mønster. */
const PROSEDYRE_MIN = 2;

const FaktaSchema = z.object({
  fakta: z.array(z.string().min(10).max(300)).min(1).max(3),
});

const SYSTEM = `Du destillerer gamle økt-minner om en golfspiller til 1–3 varige
profil-fakta på norsk bokmål. Behold kun det som fortsatt er sant og nyttig om
3 måneder (mønstre, preferanser, hva som virker). Svar KUN med JSON:
{"fakta":["..."]}`;

type PlanActionMønster = {
  userId: string;
  actionType: string;
  antall: number;
};

/** Ren hjelper (testbar): mønsterrader → prosedyriske minne-tekster. */
export function byggProseduraleMinner(
  rader: PlanActionMønster[],
): Array<{ playerId: string; content: string }> {
  return rader
    .filter((r) => r.antall >= PROSEDYRE_MIN)
    .map((r) => ({
      playerId: r.userId,
      content: `Coach godkjenner konsekvent «${r.actionType}»-forslag uendret for denne spilleren (${r.antall} ganger siste 30 dager) — denne typen anbefaling treffer.`,
    }));
}

async function konsoliderEpisodisk(): Promise<number> {
  if (!isAiEnabled() || !anthropic) return 0;

  const kandidater = await prisma.aiMemory.groupBy({
    by: ["playerId"],
    where: { kind: "EPISODIC" },
    _count: { playerId: true },
    having: { playerId: { _count: { gt: EPISODIC_TERSKEL } } },
  });

  let skrevet = 0;
  for (const kandidat of kandidater) {
    const eldste = await prisma.aiMemory.findMany({
      where: { playerId: kandidat.playerId, kind: "EPISODIC" },
      orderBy: { createdAt: "asc" },
      take: EPISODIC_BATCH,
      select: { id: true, content: true },
    });
    if (eldste.length < EPISODIC_BATCH) continue;

    const respons = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 512,
      system: SYSTEM,
      messages: [
        { role: "user", content: eldste.map((m) => `- ${m.content}`).join("\n") },
      ],
    });
    const tekst = respons.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    const jsonMatch = tekst.match(/\{[\s\S]*\}/);
    if (!jsonMatch) continue;
    const parsed = FaktaSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!parsed.success) continue;

    skrevet += await writeMemories(
      parsed.data.fakta.map((f) => ({
        playerId: kandidat.playerId,
        kind: "SEMANTIC" as const,
        content: f,
        metadata: { consolidatedFrom: eldste.map((m) => m.id) },
        sourceType: "consolidation",
      })),
    );
    await prisma.aiMemory.deleteMany({
      where: { id: { in: eldste.map((m) => m.id) } },
    });
  }
  return skrevet;
}

async function konsoliderProsedyrisk(): Promise<number> {
  // Beslutningskolonnene (decidedAt/editedBeforeApproval) finnes i DB via
  // kirurgisk DDL — leses raw til PR #162 er merget og prisma-skjemaet har dem.
  const rader = await prisma.$queryRaw<PlanActionMønster[]>`
    SELECT "userId", "actionType", count(*)::int AS antall
      FROM plan_actions
     WHERE status = 'ACCEPTED'
       AND "editedBeforeApproval" = false
       AND "decidedAt" IS NOT NULL
       AND "decidedAt" > now() - interval '30 days'
     GROUP BY "userId", "actionType"
  `;
  const minner = byggProseduraleMinner(rader);
  if (minner.length === 0) return 0;

  // Idempotent: erstatt forrige kjørings prosedyriske mønstre.
  await prisma.aiMemory.deleteMany({
    where: { sourceType: "consolidation-planaction" },
  });
  return writeMemories(
    minner.map((m) => ({
      playerId: m.playerId,
      kind: "PROCEDURAL" as const,
      content: m.content,
      sourceType: "consolidation-planaction",
    })),
  );
}

async function indekserCoachNotater(): Promise<number> {
  const notater = await prisma.coachNote.findMany({
    where: { isPrivate: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, playerId: true, title: true, content: true },
  });
  if (notater.length === 0) return 0;

  const indeksert = await prisma.aiMemory.findMany({
    where: { sourceType: "coach-note", sourceId: { in: notater.map((n) => n.id) } },
    select: { sourceId: true },
  });
  const ferdig = new Set(indeksert.map((i) => i.sourceId));
  const nye = notater.filter((n) => !ferdig.has(n.id));
  if (nye.length === 0) return 0;

  return writeMemories(
    nye.map((n) => ({
      playerId: n.playerId,
      kind: "SEMANTIC" as const,
      content: `Coach-notat${n.title ? ` (${n.title})` : ""}: ${n.content.slice(0, 400)}`,
      sourceType: "coach-note",
      sourceId: n.id,
    })),
  );
}

export async function runMemoryConsolidation(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const [semantiske, prosedyriske, notater] = [
      await konsoliderEpisodisk(),
      await konsoliderProsedyrisk(),
      await indekserCoachNotater(),
    ];
    return {
      output: { semantiske, prosedyriske, coachNotater: notater },
    };
  });
}
