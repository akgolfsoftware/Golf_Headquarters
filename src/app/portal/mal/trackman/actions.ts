"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { triggerTrackManAgent } from "@/lib/agents/triggers";
import { parseTrackManHtmlReport } from "@/lib/trackman/parse-html-report";
import type { TrackManEnvironment } from "@/generated/prisma/client";

export type { TrackManEnvironment };

export type TrackManCsvInput = {
  recordedAt: string; // ISO-dato
  csvContent: string;
  environment: TrackManEnvironment;
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
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const rader = parseCsv(input.csvContent);
  if (rader.length === 0) {
    throw new Error("Ingen rader funnet i CSV. Sjekk at filen har header + data.");
  }

  await prisma.trackManSession.create({
    data: {
      userId: user.id,
      recordedAt: new Date(input.recordedAt),
      source: "csv-import",
      shotCount: rader.length,
      rawJson: rader,
      environment: input.environment,
    },
  });

  await triggerTrackManAgent(user.id);

  revalidatePath("/portal/mal/trackman");
}

export type TrackManHtmlInput = {
  recordedAt: string; // ISO-dato (kan overstyres av bruker)
  htmlContent: string;
  environment: TrackManEnvironment;
};

export async function importTrackManHtml(input: TrackManHtmlInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const rapport = parseTrackManHtmlReport(input.htmlContent);

  const shotCount = rapport.clubs.reduce((sum, c) => sum + c.shotCount, 0);

  await prisma.trackManSession.create({
    data: {
      userId: user.id,
      recordedAt: new Date(input.recordedAt),
      source: "html-import",
      shotCount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawJson: rapport as any,
      environment: input.environment,
    },
  });

  await triggerTrackManAgent(user.id);

  revalidatePath("/portal/mal/trackman");
}
