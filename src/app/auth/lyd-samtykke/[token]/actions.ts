"use server";

/**
 * Offentlig: foresatt bekrefter lydsamtykke via magisk lenke.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { isSameOriginAction } from "@/lib/security/same-origin";
import {
  LYD_SAMTYKKE_ORDLYD,
  LYD_SAMTYKKE_ORDLYD_VERSJON,
} from "@/lib/recording/lyd-samtykke-ordlyd";
import { erLydSamtykkeTokenGyldig } from "@/lib/recording/lyd-samtykke-token";

const BekreftSchema = z.object({
  token: z.string().min(16),
});

export type BekreftLydSamtykkeResult =
  | { ok: true }
  | { ok: false; error: string };

export async function bekreftLydSamtykkeViaToken(
  input: z.infer<typeof BekreftSchema>,
): Promise<BekreftLydSamtykkeResult> {
  if (!(await isSameOriginAction())) {
    return { ok: false, error: "Avvist: forespørselen kom fra feil opphav." };
  }

  const parsed = BekreftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig lenke." };
  }
  const { token } = parsed.data;

  try {
    const rad = await prisma.lydSamtykke.findUnique({
      where: { token },
    });

    if (!rad) {
      return { ok: false, error: "Lenken er ugyldig eller allerede brukt." };
    }

    if (rad.status === "GITT") {
      return { ok: true };
    }

    if (
      !erLydSamtykkeTokenGyldig({
        token: rad.token,
        tokenExpiresAt: rad.tokenExpiresAt,
        status: rad.status,
      })
    ) {
      return {
        ok: false,
        error: "Lenken er utløpt. Be treneren sende ny e-post.",
      };
    }

    const now = new Date();
    await prisma.lydSamtykke.update({
      where: { id: rad.id },
      data: {
        status: "GITT",
        gittAv: "FORESATT",
        gittAt: now,
        trukketAt: null,
        // Lås ordlyden som ble tilbudt (rad.ordlyd), fallback til kanonisk.
        ordlyd: rad.ordlyd?.trim() ? rad.ordlyd : LYD_SAMTYKKE_ORDLYD,
        token: null,
        tokenExpiresAt: null,
      },
    });

    await audit({
      actorId: null,
      action: "lyd-samtykke.gitt",
      target: `User:${rad.userId}`,
      metadata: {
        gittAv: "FORESATT",
        foresattEpost: rad.foresattEpost,
        via: "token",
        ordlydVersjon: LYD_SAMTYKKE_ORDLYD_VERSJON,
      },
    });

    revalidatePath("/admin/recording");
    revalidatePath("/admin/spillere");
    return { ok: true };
  } catch (err) {
    await logError({
      context: "lyd-samtykke.bekreft-token",
      error: err,
      meta: { tokenPrefix: token.slice(0, 8) },
    });
    return { ok: false, error: "Noe gikk galt. Prøv igjen." };
  }
}
