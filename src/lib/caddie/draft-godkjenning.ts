// Godkjenning/avvisning av persisterte CaddieDraft-rader (A2/W4.4).
// Utfører utkastet via executeApprovedTool (som re-validerer mot nå-tilstand),
// markerer raden APPROVED/REJECTED og logger resultatet som CaddieMessage
// (role="tool") for audit-spor — samme spor som /api/caddie/approve.
//
// Ren server-side helper: auth gjøres i action-/route-laget, ikke her.

import { prisma } from "@/lib/prisma";
import { executeApprovedTool } from "@/lib/caddie/approval-executor";
import { logError } from "@/lib/error-tracking";
import { claimPendingDraft } from "./draft-claim";
import { z } from "zod";

export type DraftGodkjenningResult = {
  ok: boolean;
  status: string;
  summary: string;
};

/** Godkjenn og utfør et eiet PENDING-utkast én gang. Usikker ekstern
 * utførelse skal aldri automatisk prøves på nytt fra samme godkjenning. */
export async function godkjennOgUtforCaddieDraft(
  draftId: string,
  adminUserId: string,
): Promise<DraftGodkjenningResult> {
  const draft = await prisma.caddieDraft.findFirst({ where: { id: draftId, userId: adminUserId } });
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

  const input = z.record(z.string(), z.unknown()).safeParse(draft.toolInput);
  if (!input.success) return { ok: false, status: "invalid", summary: "Utkastet har ugyldige lagrede data." };

  try {
    if (!(await claimPendingDraft(draft.id, adminUserId, true))) return { ok: false, status: "already-resolved", summary: "Utkastet er allerede behandlet." };
    const exec = await executeApprovedTool(draft.toolName, input.data, adminUserId);

    await persistAudit(adminUserId, draft.conversationId, {
      toolCallId: draft.toolCallId,
      toolName: draft.toolName,
      result: { status: exec.status, summary: exec.summary, details: exec.details ?? null },
    });

    return { ok: true, status: exec.status, summary: exec.summary };
  } catch {
    const message = "Utførelsen kunne ikke bekreftes. Kontroller resultatet før du lager et nytt forslag.";
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
  const draft = await prisma.caddieDraft.findFirst({ where: { id: draftId, userId: adminUserId } });
  if (!draft || draft.status !== "PENDING") {
    return { ok: false, status: "not-found", summary: "Utkastet er allerede behandlet." };
  }

  if (!(await claimPendingDraft(draft.id, adminUserId, false))) return { ok: false, status: "already-resolved", summary: "Utkastet er allerede behandlet." };
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
  } catch {
    // Audit-persistering må aldri velte selve godkjenningen.
    await logError({
      context: "caddie.draftGodkjenning.audit",
      error: new Error("Kunne ikke lagre Caddie-resultat"),
      severity: "warn",
    });
  }
}
