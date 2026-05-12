"use server";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export type AuditCsvFilter = {
  action?: string;
  actorId?: string;
  // ISO-datostreng (YYYY-MM-DD eller full ISO)
  fra?: string;
  til?: string;
  // Maks antall rader. Default 1000, hard cap 10000.
  limit?: number;
};

export type EksporterAuditCsvResult =
  | { ok: true; csv: string; antall: number; filnavn: string }
  | { ok: false; error: string };

async function krevAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : String(value);
  // RFC 4180 — escape ved komma, anførselstegn, linjeskift.
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Eksporterer audit-loggen som CSV-streng. Returneres til klienten som
 * kan trigge nedlasting med Blob + a[download].
 */
export async function eksporterAuditCsv(
  filter: AuditCsvFilter = {},
): Promise<EksporterAuditCsvResult> {
  let aktor;
  try {
    aktor = await krevAdmin();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "forbidden",
    };
  }

  const limit = Math.min(Math.max(filter.limit ?? 1000, 1), 10000);

  const where: {
    action?: { contains: string };
    actorId?: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};
  if (filter.action) where.action = { contains: filter.action };
  if (filter.actorId) where.actorId = filter.actorId;
  if (filter.fra || filter.til) {
    where.createdAt = {};
    if (filter.fra) {
      const fra = new Date(filter.fra);
      if (!Number.isNaN(fra.getTime())) where.createdAt.gte = fra;
    }
    if (filter.til) {
      const til = new Date(filter.til);
      if (!Number.isNaN(til.getTime())) where.createdAt.lte = til;
    }
  }

  const rader = await prisma.auditLog.findMany({
    where,
    include: { actor: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const header = [
    "createdAt",
    "action",
    "target",
    "actorId",
    "actorName",
    "actorEmail",
    "metadata",
  ];
  const linjer: string[] = [header.join(",")];

  for (const r of rader) {
    linjer.push(
      [
        r.createdAt.toISOString(),
        r.action,
        r.target ?? "",
        r.actor?.id ?? "",
        r.actor?.name ?? "",
        r.actor?.email ?? "",
        r.metadata ? JSON.stringify(r.metadata) : "",
      ]
        .map(escapeCsv)
        .join(","),
    );
  }

  const csv = linjer.join("\r\n");
  const stempel = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filnavn = `audit-log-${stempel}.csv`;

  await audit({
    actorId: aktor.id,
    action: "audit.exported",
    target: "AuditLog",
    metadata: {
      antall: rader.length,
      filter: {
        action: filter.action ?? null,
        actorId: filter.actorId ?? null,
        fra: filter.fra ?? null,
        til: filter.til ?? null,
        limit,
      },
    },
  });

  return { ok: true, csv, antall: rader.length, filnavn };
}
