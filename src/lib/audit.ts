// Audit-logger. Brukes fra server actions for å spore kritiske handlinger.
// Fire-and-forget — feil i logging skal aldri stoppe selve handlingen.
import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { logError } from "@/lib/error-tracking";

export type AuditEntry = {
  actorId: string | null;
  action: string;
  target?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        target: entry.target ?? null,
        metadata: entry.metadata,
      },
    });
  } catch (error) {
    await logError({
      context: "audit.write",
      error,
      meta: { action: entry.action, target: entry.target },
    });
  }
}
