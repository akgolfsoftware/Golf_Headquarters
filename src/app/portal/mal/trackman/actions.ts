"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { triggerTrackManAgent } from "@/lib/agents/triggers";

export type TrackManCsvInput = {
  recordedAt: string; // ISO-dato
  csvContent: string;
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
    },
  });

  await triggerTrackManAgent(user.id);

  revalidatePath("/portal/mal/trackman");
}
