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

  const { conversationId, toolCallId, toolName, approved, toolInput } = parsed.data;

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
    await resolveDraft(user.id, toolCallId, "REJECTED");
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
    await resolveDraft(user.id, toolCallId, "APPROVED");
    return Response.json({
      ok: true,
      status: exec.status,
      summary: exec.summary,
      details: exec.details ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
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

// A2: chat-forslag persisteres nå som CaddieDraft (PENDING) i A1-køen.
// Behandles forslaget i chatten, må draft-raden lukkes så køen holdes i synk.
async function resolveDraft(
  userId: string,
  toolCallId: string,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  try {
    await prisma.caddieDraft.updateMany({
      where: { userId, toolCallId, status: "PENDING" },
      data: { status, resolvedAt: new Date() },
    });
  } catch (err) {
    // Kø-synk må aldri ta ned API-responsen.
    console.error("[caddie/approve] kunne ikke lukke CaddieDraft", err);
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
  } catch (err) {
    // Persistering må aldri ta ned API-responsen.
    console.error("[caddie/approve] kunne ikke persistere tool-melding", err);
  }
}
