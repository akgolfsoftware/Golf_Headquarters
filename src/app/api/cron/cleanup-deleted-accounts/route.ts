/**
 * Cron-job: permanent slett soft-deleted bruker-konti etter 30 dager.
 * Kjører daglig kl. 03:30.
 *
 * P20 GDPR: brukere som har markert konto for sletting kan angre i 30 dager.
 * Etter det vinduet slettes alle persondata permanent (cascade via Prisma).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_DAYS = 30;

export async function GET(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const usersToDelete = await prisma.user.findMany({
      where: {
        deletedAt: { lt: cutoff, not: null },
      },
      select: { id: true, email: true, deletedAt: true },
      take: 100,
    });

    if (usersToDelete.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0 });
    }

    // Permanent delete (cascade via Prisma onDelete: Cascade på relasjoner)
    const result = await prisma.user.deleteMany({
      where: { id: { in: usersToDelete.map((u) => u.id) } },
    });

    return NextResponse.json({
      ok: true,
      deleted: result.count,
      ids: usersToDelete.map((u) => u.id),
    });
  } catch (error) {
    await logError({
      context: "cron.cleanup-deleted-accounts",
      error,
      severity: "error",
    });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
