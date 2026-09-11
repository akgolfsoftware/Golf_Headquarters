// POST /api/caddie/approve
// Tar imot godkjenning eller avvisning av et Caddie-tool-forslag,
// utfører faktisk handling (eller logger intent) og persisterer
// resultat som CaddieMessage med role="tool" for audit-spor.
//
// Krever ADMIN (canAccessMissionControl).

import { z } from "zod";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { executeApprovedTool } from "@/lib/caddie/approval-executor";
import { logError } from "@/lib/error-tracking";
import { rateLimit } from "@/lib/rate-limit";
import { claimPendingDraft } from "@/lib/caddie/draft-claim";

export const runtime = "nodejs";

const bodySchema = z.object({
  conversationId: z.string().min(1),
  toolCallId: z.string().min(1),
  toolName: z.string().min(1),
  approved: z.boolean(),
  toolInput: z.record(z.string(), z.unknown()),
});

type ToolMessagePayload = {
  toolCallId: string;
  toolName: string;
  result: Record<string, unknown>;
};

export async function POST(req: Request) {
  const user = await canAccessMissionControl();
  if (!user) {
    return Response.json({ ok: false, error: "Ikke autorisert" }, { status: 401 });
  }
  const rl = await rateLimit({ key: `caddie-approve:${user.id}`, max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }


  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Ugyldig JSON-payload" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: `Ugyldig request-body: ${parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", ")}`,
      },
      { status: 400 },
    );
  }

  const { conversationId, toolCallId, toolName, approved } = parsed.data;
  let toolInput: Record<string, unknown>;
  try {
    const draft = await prisma.caddieDraft.findFirst({
      where: { userId: user.id, conversationId, toolCallId, toolName, status: "PENDING" },
      select: { id: true, toolInput: true },
    });
    if (!draft) return Response.json({ ok: false, error: "Forslaget er ikke tilgjengelig eller er allerede behandlet." }, { status: 409 });
    const saved = z.record(z.string(), z.unknown()).safeParse(draft.toolInput);
    if (!saved.success) return Response.json({ ok: false, error: "Forslaget har ugyldige lagrede data." }, { status: 409 });
    toolInput = saved.data;
    if (!(await claimPendingDraft(draft.id, user.id, approved))) {
      return Response.json({ ok: false, error: "Forslaget er allerede behandlet." }, { status: 409 });
    }
  } catch {
    return Response.json({ ok: false, error: "Kunne ikke lese forslaget." }, { status: 503 });
  }

  // --- Avvisning ---
  if (!approved) {
    const result = {
      status: "rejected" as const,
      summary: `Anders avviste forslaget for ${toolName}.`,
    };
    await persistToolMessage(user.id, conversationId, {
      toolCallId,
      toolName,
      result,
    });
    return Response.json({ ok: true, status: result.status, summary: result.summary });
  }

  // --- Godkjenning + utførelse ---
  try {
    const exec = await executeApprovedTool(toolName, toolInput, user.id);
    const result: Record<string, unknown> = {
      status: exec.status,
      summary: exec.summary,
      details: exec.details ?? null,
    };
    await persistToolMessage(user.id, conversationId, {
      toolCallId,
      toolName,
      result,
    });
    return Response.json({
      ok: true,
      status: exec.status,
      summary: exec.summary,
      details: exec.details ?? null,
    });
  } catch {
    const message = "Utførelsen kunne ikke bekreftes. Kontroller resultatet før du lager et nytt forslag.";
    const result = {
      status: "failed" as const,
      summary: `Utførelse feilet: ${message}`,
      error: message,
    };
    await persistToolMessage(user.id, conversationId, {
      toolCallId,
      toolName,
      result,
    });
    return Response.json(
      { ok: false, error: message, status: result.status },
      { status: 500 },
    );
  }
}

async function persistToolMessage(
  userId: string,
  conversationId: string,
  payload: ToolMessagePayload,
): Promise<void> {
  try {
    await prisma.caddieMessage.create({
      data: {
        userId,
        conversationId,
        role: "tool",
        content: typeof payload.result.summary === "string" ? payload.result.summary : "",
        toolResults: [payload] as unknown as object,
      },
    });
  } catch {
    // Persistering må aldri ta ned API-responsen.
    await logError({ context: "caddie.approve.persister-tool-melding", error: new Error("Kunne ikke lagre Caddie-resultat"), severity: "warn" });
  }
}
