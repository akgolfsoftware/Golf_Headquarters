// Godkjenning/avvisning av persisterte CaddieDraft-rader (A2/W4.4).
// Utfører utkastet via executeApprovedTool (som re-validerer mot nå-tilstand),
// markerer raden APPROVED/REJECTED og logger resultatet som CaddieMessage
// (role="tool") for audit-spor — samme spor som /api/caddie/approve.
//
// Ren server-side helper: auth gjøres i action-/route-laget, ikke her.

import { prisma } from "@/lib/prisma";
import { executeApprovedTool } from "@/lib/caddie/approval-executor";

export type DraftGodkjenningResult = {
  ok: boolean;
  status: string;
  summary: string;
};

/** Godkjenn og UTFØR et PENDING CaddieDraft. Feiler utførelsen forblir raden
 *  PENDING (kan prøves igjen eller avvises). */
export async function godkjennOgUtforCaddieDraft(
  draftId: string,
  adminUserId: string,
): Promise<DraftGodkjenningResult> {
  const draft = await prisma.caddieDraft.findUnique({ where: { id: draftId } });
  if (!draft) {
    return { ok: false, status: "not-found", summary: "Utkastet finnes ikke lenger." };
  }
  if (draft.status !== "PENDING") {
    return {
      ok: false,
      status: "already-resolved",
      summary: "Utkastet er allerede behandlet.",
    };
  }

  const toolInput = (draft.toolInput ?? {}) as Record<string, unknown>;

  try {
    const exec = await executeApprovedTool(draft.toolName, toolInput, adminUserId);

    await prisma.caddieDraft.update({
      where: { id: draft.id },
      data: { status: "APPROVED", resolvedAt: new Date() },
    });

    await persistAudit(adminUserId, draft.conversationId, {
      toolCallId: draft.toolCallId,
      toolName: draft.toolName,
      result: { status: exec.status, summary: exec.summary, details: exec.details ?? null },
    });

    return { ok: true, status: exec.status, summary: exec.summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await persistAudit(adminUserId, draft.conversationId, {
      toolCallId: draft.toolCallId,
      toolName: draft.toolName,
      result: { status: "failed", summary: `Utførelse feilet: ${message}` },
    });
    return { ok: false, status: "failed", summary: `Utførelse feilet: ${message}` };
  }
}

/** Avvis et PENDING CaddieDraft (PENDING → REJECTED) med audit-spor. */
export async function avvisCaddieDraft(
  draftId: string,
  adminUserId: string,
): Promise<DraftGodkjenningResult> {
  const draft = await prisma.caddieDraft.findUnique({ where: { id: draftId } });
  if (!draft || draft.status !== "PENDING") {
    return { ok: false, status: "not-found", summary: "Utkastet er allerede behandlet." };
  }

  await prisma.caddieDraft.update({
    where: { id: draft.id },
    data: { status: "REJECTED", resolvedAt: new Date() },
  });
  await persistAudit(adminUserId, draft.conversationId, {
    toolCallId: draft.toolCallId,
    toolName: draft.toolName,
    result: { status: "rejected", summary: `Forslaget for ${draft.toolName} ble avvist.` },
  });
  return { ok: true, status: "rejected", summary: "Forslaget ble avvist." };
}

async function persistAudit(
  userId: string,
  conversationId: string,
  payload: { toolCallId: string; toolName: string; result: Record<string, unknown> },
): Promise<void> {
  try {
    await prisma.caddieMessage.create({
      data: {
        userId,
        conversationId,
        role: "tool",
        content:
          typeof payload.result.summary === "string" ? payload.result.summary : "",
        toolResults: [payload] as unknown as object,
      },
    });
  } catch (err) {
    // Audit-persistering må aldri velte selve godkjenningen.
    console.error("[caddie/draft-godkjenning] kunne ikke persistere audit", err);
  }
}
