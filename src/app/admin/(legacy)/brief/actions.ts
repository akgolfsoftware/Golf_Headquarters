"use server";

/**
 * Eksport-actions for CoachHQ brief-rapport.
 *
 * `exportBriefReport` validerer inputen med zod, sjekker at brukeren er
 * COACH/ADMIN, og returnerer en placeholder URL til en generert PDF/CSV.
 * Faktisk PDF-generering kommer i egen iterasjon; for nå returnerer vi en
 * deterministisk URL slik at modal-flyten kan testes ende-til-ende.
 */

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";

const periodSchema = z.enum(["i-dag", "i-gar", "denne-uka", "forrige-uke", "custom"]);
const formatSchema = z.enum(["pdf", "csv"]);

export const exportBriefInputSchema = z.object({
  format: formatSchema,
  period: periodSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  includes: z.object({
    kpiStrip: z.boolean().default(true),
    spillerStatus: z.boolean().default(true),
    foresporsler: z.boolean().default(true),
    coachNotater: z.boolean().default(false),
  }),
  recipients: z.array(z.string().email()).default([]),
});

export type ExportBriefInput = z.infer<typeof exportBriefInputSchema>;

export type ExportResult =
  | { success: true; downloadUrl: string; filename: string }
  | { success: false; error: string };

function slugifyDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function exportBriefReport(
  raw: ExportBriefInput,
): Promise<ExportResult> {
  const parsed = exportBriefInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Ugyldig input til eksport" };
  }
  const input = parsed.data;

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Ikke innlogget" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { success: false, error: "Krever coach- eller admin-tilgang" };
  }

  const slug = (user.name ?? "coach")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const filename = `coach-brief-${slug}-${slugifyDate(new Date())}.${input.format}`;
  // Placeholder URL — faktisk generering kommer i egen iterasjon. Strukturen
  // er ekte slik at klient kan utløse download når dette kobles til ekte
  // PDF/CSV-renderer (lib/pdf/*).
  const downloadUrl = `/api/exports/brief/${encodeURIComponent(filename)}`;

  await audit({
    actorId: user.id,
    action: "brief.export",
    target: `User:${user.id}`,
    metadata: {
      format: input.format,
      period: input.period,
      recipients: input.recipients,
      includes: input.includes,
    },
  });

  return { success: true, downloadUrl, filename };
}
