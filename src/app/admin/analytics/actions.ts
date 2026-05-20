"use server";

/**
 * Eksport-actions for CoachHQ analytics-rapport.
 *
 * Validerer input med zod og returnerer placeholder download-URL.
 * Faktisk PDF/CSV/XLSX-generering kommer i egen iterasjon.
 */

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";

const periodSchema = z.enum(["7d", "30d", "90d", "sesong", "custom"]);
const formatSchema = z.enum(["pdf", "csv", "xlsx"]);
const scopeSchema = z.enum(["stall", "kategori", "spillere"]);

export const exportAnalyticsInputSchema = z.object({
  format: formatSchema,
  period: periodSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  scope: scopeSchema,
  kategori: z.enum(["A1", "A2", "B1", "B2"]).optional(),
  spillerIds: z.array(z.string()).default([]),
  includes: z.object({
    sgTrender: z.boolean().default(true),
    pyramide: z.boolean().default(true),
    compliance: z.boolean().default(true),
    rundeData: z.boolean().default(false),
  }),
  recipients: z.array(z.string().email()).default([]),
});

export type ExportAnalyticsInput = z.infer<typeof exportAnalyticsInputSchema>;

export type ExportResult =
  | { success: true; downloadUrl: string; filename: string }
  | { success: false; error: string };

function slugifyDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function exportAnalyticsReport(
  raw: ExportAnalyticsInput,
): Promise<ExportResult> {
  const parsed = exportAnalyticsInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Ugyldig input til eksport" };
  }
  const input = parsed.data;

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Ikke innlogget" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { success: false, error: "Krever coach- eller admin-tilgang" };
  }

  const scopeSlug =
    input.scope === "stall"
      ? "stall-snitt"
      : input.scope === "kategori"
        ? `kategori-${input.kategori?.toLowerCase() ?? "alle"}`
        : `spillere-${input.spillerIds.length}`;

  const filename = `analytics-${scopeSlug}-${slugifyDate(new Date())}.${input.format}`;
  const downloadUrl = `/api/exports/analytics/${encodeURIComponent(filename)}`;

  await audit({
    actorId: user.id,
    action: "analytics.export",
    target: `User:${user.id}`,
    metadata: {
      format: input.format,
      period: input.period,
      scope: input.scope,
      spillerIds: input.spillerIds,
      recipients: input.recipients,
      includes: input.includes,
    },
  });

  return { success: true, downloadUrl, filename };
}
