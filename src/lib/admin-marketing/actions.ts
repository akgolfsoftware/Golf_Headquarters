"use server";

/**
 * Server-actions for AgencyOS Marketing (M1 — innholdskalender + post-kø).
 *
 * Alt trigges av eksplisitte coach-klikk i UI (ADMIN/COACH-guardet).
 * Ingen auto-publisering, ingen eksterne API-er — status er en manuell
 * arbeidskø (UTKAST → KLAR → PUBLISERT) som M2/M3 bygger videre på.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { MARKETING_KANALER, MARKETING_STATUSER, type MarketingStatus } from "./konstanter";

const nyPostSchema = z.object({
  title: z.string().trim().min(1, "Tittel er påkrevd.").max(200),
  channel: z.enum(MARKETING_KANALER),
  // Dato fra <input type="date"> — tolkes som lokal midnatt.
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig dato."),
  brief: z.string().trim().max(4000).optional(),
});

export type NyMarketingPostInput = z.input<typeof nyPostSchema>;

function revalider() {
  revalidatePath("/admin/marketing");
}

/** Opprett en planlagt post (status UTKAST). */
export async function opprettMarketingPost(
  input: NyMarketingPostInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const parsed = nyPostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig skjema." };
  }

  const scheduledAt = new Date(`${parsed.data.scheduledAt}T00:00:00`);
  if (Number.isNaN(scheduledAt.getTime())) return { ok: false, error: "Ugyldig dato." };

  const post = await prisma.marketingPost.create({
    data: {
      title: parsed.data.title,
      channel: parsed.data.channel,
      scheduledAt,
      brief: parsed.data.brief || null,
    },
  });

  revalider();
  return { ok: true, id: post.id };
}

/** Sett status eksplisitt (klienten sykler UTKAST → KLAR → PUBLISERT → UTKAST). */
export async function settMarketingStatus(
  id: string,
  status: MarketingStatus,
): Promise<{ ok: boolean; error?: string }> {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const parsed = z.enum(MARKETING_STATUSER).safeParse(status);
  if (!id || !parsed.success) return { ok: false, error: "Ugyldig status." };

  const post = await prisma.marketingPost.findUnique({ where: { id }, select: { id: true } });
  if (!post) return { ok: false, error: "Posten finnes ikke lenger." };

  await prisma.marketingPost.update({ where: { id }, data: { status: parsed.data } });

  revalider();
  return { ok: true };
}
