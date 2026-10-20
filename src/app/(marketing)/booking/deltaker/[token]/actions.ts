"use server";

/**
 * Deltaker 2 melder seg av fra e-postlenken. Den signerte lenken er tilgangen
 * (`src/lib/booking/deltaker2-lenke.ts`). Kan aldri avbestille eller refundere.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { publicAction } from "@/lib/auth/action-guards";
import { deltaker2MeldAv } from "@/lib/booking/deltaker2-avmelding";

const Token = z.string().min(10).max(1000);

export async function meldAvDeltaker2(token: string): Promise<{ ok: boolean; melding: string }> {
  publicAction();
  const t = Token.safeParse(token);
  if (!t.success) return { ok: false, melding: "Ugyldig forespørsel." };
  const svar = await deltaker2MeldAv(t.data);
  if (svar.ok) {
    revalidatePath("/admin/bookinger");
    revalidatePath("/admin/kalender");
  }
  return svar;
}
