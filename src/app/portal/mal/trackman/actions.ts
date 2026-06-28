"use server";

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { triggerTrackManAgent } from "@/lib/agents/triggers";
import { parseTrackManHtmlReport } from "@/lib/trackman/parse-html-report";
import type { TrackManEnvironment } from "@/generated/prisma/client";

export type { TrackManEnvironment };

export type TrackManCsvInput = {
  recordedAt: string; // ISO-dato
  csvContent: string;
  environment: TrackManEnvironment;
  /**
   * Hvis satt: lagrer økten mot denne spilleren i stedet for innlogget bruker.
   * Krever at innlogget bruker har COACH-rolle. Brukes fra CoachHQ
   * (/admin/spillere/[id]) når coach importerer på vegne av spiller.
   */
  onBehalfOfUserId?: string;
};

type ParsedRow = Record<string, string>;

function parseCsv(text: string): ParsedRow[] {
  const linjer = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim());
  if (linjer.length < 2) return [];

  const header = linjer[0].split(",").map((h) => h.trim());
  return linjer.slice(1).map((linje) => {
    const verdier = linje.split(",").map((v) => v.trim());
    const rad: ParsedRow = {};
    header.forEach((h, i) => {
      rad[h] = verdier[i] ?? "";
    });
    return rad;
  });
}

export async function importTrackManCsv(input: TrackManCsvInput) {
  const user = await requireConsentingUser();

  const targetUserId = await resolveTargetUserId(user, input.onBehalfOfUserId);

  const rader = parseCsv(input.csvContent);
  if (rader.length === 0) {
    throw new Error("Ingen rader funnet i CSV. Sjekk at filen har header + data.");
  }

  await prisma.trackManSession.create({
    data: {
      userId: targetUserId,
      recordedAt: new Date(input.recordedAt),
      source: "csv-import",
      shotCount: rader.length,
      rawJson: rader,
      environment: input.environment,
    },
  });

  await triggerTrackManAgent(targetUserId);

  revalidatePath("/portal/mal/trackman");
  if (targetUserId !== user.id) {
    revalidatePath(`/admin/spillere/${targetUserId}`);
  }
}

export type TrackManHtmlInput = {
  recordedAt: string; // ISO-dato (kan overstyres av bruker)
  htmlContent: string;
  environment: TrackManEnvironment;
  /** Samme semantikk som TrackManCsvInput.onBehalfOfUserId. */
  onBehalfOfUserId?: string;
};

export async function importTrackManHtml(input: TrackManHtmlInput) {
  const user = await requireConsentingUser();

  const targetUserId = await resolveTargetUserId(user, input.onBehalfOfUserId);

  const rapport = parseTrackManHtmlReport(input.htmlContent);

  const shotCount = rapport.clubs.reduce((sum, c) => sum + c.shotCount, 0);

  await prisma.trackManSession.create({
    data: {
      userId: targetUserId,
      recordedAt: new Date(input.recordedAt),
      source: "html-import",
      shotCount,
      rawJson: rapport as unknown as import("@/generated/prisma/client").Prisma.JsonObject,
      environment: input.environment,
    },
  });

  await triggerTrackManAgent(targetUserId);

  revalidatePath("/portal/mal/trackman");
  if (targetUserId !== user.id) {
    revalidatePath(`/admin/spillere/${targetUserId}`);
  }
}

/**
 * Returnerer hvilken bruker import skal lagres mot. Default = innlogget user.
 * Hvis onBehalfOfUserId er satt: krever at innlogget user har COACH-rolle.
 */
async function resolveTargetUserId(
  user: { id: string; role: import("@/generated/prisma/client").UserRole },
  onBehalfOfUserId: string | undefined,
): Promise<string> {
  if (!onBehalfOfUserId || onBehalfOfUserId === user.id) return user.id;
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    throw new Error("Kun coach kan importere på vegne av spiller.");
  }
  const target = await prisma.user.findUnique({
    where: { id: onBehalfOfUserId },
    select: { id: true },
  });
  if (!target) throw new Error("Spiller ikke funnet.");
  return target.id;
}
