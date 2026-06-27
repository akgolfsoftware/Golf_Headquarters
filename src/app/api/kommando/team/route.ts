// POST /api/kommando/team
// Agent-team: kjører KOMMANDO_TEAM-stegene sekvensielt på én oppgave. Output fra
// ett steg mates inn i neste. Modeller uten nøkkel hoppes over (ærlig, ingen
// fabrikering). Fremdrift strømmes som NDJSON og persisteres til DB underveis.

import { generateText } from "ai";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { resolveKommandoModel, kommandoModelReady } from "@/lib/kommando/providers";
import { KOMMANDO_TEAM, getKommandoModel } from "@/lib/kommando/models";

export const runtime = "nodejs";
export const maxDuration = 300;

type TeamRequestBody = { title?: unknown; projectId?: unknown };

export async function POST(req: Request) {
  const user = await canAccessMissionControl();
  if (!user) return new Response("Ikke autorisert", { status: 401 });

  const rl = await rateLimit({ key: `kommando-team:${user.id}`, max: 5, windowMs: 60_000 });
  if (!rl.ok) return new Response("For mange kjøringer — prøv igjen om litt.", { status: 429 });

  let body: TeamRequestBody;
  try {
    body = (await req.json()) as TeamRequestBody;
  } catch {
    return new Response("Ugyldig JSON-payload", { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return new Response("`title` mangler", { status: 400 });

  let projectId: string | null = null;
  if (typeof body.projectId === "string" && body.projectId) {
    const owned = await prisma.kommandoProject.findFirst({
      where: { id: body.projectId, userId: user.id },
      select: { id: true },
    });
    projectId = owned?.id ?? null;
  }

  // Opprett run + steg (pending) før vi begynner — så kjøringen overlever reload.
  const run = await prisma.kommandoAgentRun.create({ data: { userId: user.id, projectId, title } });
  const stepRecords: Array<{ dbId: string; index: number; model: (typeof KOMMANDO_TEAM)[number]["model"]; role: string; instruction: string }> = [];
  for (let i = 0; i < KOMMANDO_TEAM.length; i++) {
    const t = KOMMANDO_TEAM[i];
    const rec = await prisma.kommandoAgentStep.create({
      data: { runId: run.id, orderIndex: i, model: t.model, role: t.role },
    });
    stepRecords.push({ dbId: rec.id, index: i, model: t.model, role: t.role, instruction: t.instruction });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      send({
        type: "run",
        runId: run.id,
        steps: KOMMANDO_TEAM.map((s, i) => ({ index: i, model: s.model, role: s.role })),
      });

      let prev = "";
      for (const step of stepRecords) {
        send({ type: "step-start", index: step.index });
        await prisma.kommandoAgentStep
          .update({ where: { id: step.dbId }, data: { status: "running" } })
          .catch(() => {});

        if (!kommandoModelReady(step.model)) {
          const note = `Mangler nøkkel for ${getKommandoModel(step.model)?.label ?? step.model} — steget ble hoppet over.`;
          await prisma.kommandoAgentStep
            .update({ where: { id: step.dbId }, data: { status: "skipped", output: note, finishedAt: new Date() } })
            .catch(() => {});
          send({ type: "step-skip", index: step.index, note });
          continue;
        }

        const prompt = prev
          ? `Oppgave: ${title}\n\nForrige steg leverte:\n${prev}`
          : `Oppgave: ${title}`;

        try {
          const { text } = await generateText({
            model: resolveKommandoModel(step.model),
            system: step.instruction,
            prompt,
            maxRetries: 1,
          });
          if (text) prev = text;
          await prisma.kommandoAgentStep
            .update({ where: { id: step.dbId }, data: { status: "done", output: text, finishedAt: new Date() } })
            .catch(() => {});
          send({ type: "step-done", index: step.index, output: text });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "ukjent feil";
          await prisma.kommandoAgentStep
            .update({ where: { id: step.dbId }, data: { status: "failed", output: msg, finishedAt: new Date() } })
            .catch(() => {});
          send({ type: "step-error", index: step.index, message: msg });
        }
      }

      await prisma.kommandoAgentRun
        .update({ where: { id: run.id }, data: { status: "done", finishedAt: new Date() } })
        .catch(() => {});
      send({ type: "done", runId: run.id });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
