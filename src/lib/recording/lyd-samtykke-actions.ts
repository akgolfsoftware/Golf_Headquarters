"use server";

/**
 * Lydsamtykke: coach-registrering (pilot/nød), e-post til foresatt, trekk.
 * Bekreft via token ligger i auth-ruten (offentlig, same-origin).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { APP_URL } from "@/lib/app-url";
import { LYD_SAMTYKKE_ORDLYD, LYD_SAMTYKKE_ORDLYD_VERSJON } from "./lyd-samtykke-ordlyd";
import { byggLydSamtykkeForesattEpost } from "./lyd-samtykke-email";
import {
  lagLydSamtykkeToken,
  lydSamtykkeTokenUtloper,
} from "./lyd-samtykke-token";

const GittSchema = z.object({
  playerId: z.string().min(1),
  gittAv: z.enum(["SELV", "FORESATT"]),
  foresattEpost: z.string().email().optional().nullable(),
});

const TrekkSchema = z.object({
  playerId: z.string().min(1),
});

const SendForesattSchema = z.object({
  playerId: z.string().min(1),
  foresattEpost: z.string().email(),
});

export type LydSamtykkeActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

/**
 * Registrer status GITT med låst ordlyd-kopi (myndig SELV, eller manuell pilot/nød).
 */
export async function registrerLydSamtykkeGitt(
  input: z.infer<typeof GittSchema>,
): Promise<LydSamtykkeActionResult> {
  const coach = await requireCoachActionUser();
  const parsed = GittSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig input" };
  }
  const { playerId, gittAv } = parsed.data;
  let foresattEpost = parsed.data.foresattEpost ?? null;

  if (gittAv === "FORESATT" && !foresattEpost) {
    return { ok: false, error: "Foresatt-e-post kreves når gittAv er FORESATT" };
  }
  if (gittAv === "SELV") {
    foresattEpost = null;
  }

  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: { id: true, role: true },
  });
  if (!player || player.role !== "PLAYER") {
    return { ok: false, error: "Spiller finnes ikke" };
  }

  const now = new Date();
  await prisma.lydSamtykke.upsert({
    where: { userId: playerId },
    create: {
      userId: playerId,
      status: "GITT",
      gittAv,
      foresattEpost,
      gittAt: now,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
      token: null,
      tokenExpiresAt: null,
    },
    update: {
      status: "GITT",
      gittAv,
      foresattEpost,
      gittAt: now,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
      token: null,
      tokenExpiresAt: null,
    },
  });

  await audit({
    actorId: coach.id,
    action: "lyd-samtykke.gitt",
    target: `User:${playerId}`,
    metadata: {
      gittAv,
      foresattEpost,
      ordlydVersjon: LYD_SAMTYKKE_ORDLYD_VERSJON,
      via: "coach-manuell",
    },
  });

  revalidatePath("/admin/recording");
  revalidatePath("/admin/spillere");
  return { ok: true };
}

/**
 * Opprett VENTER + send magisk lenke til foresatt. Purring = send på nytt (ny token).
 */
export async function sendLydSamtykkeForesattEpost(
  input: z.infer<typeof SendForesattSchema>,
): Promise<LydSamtykkeActionResult> {
  const coach = await requireCoachActionUser();
  const parsed = SendForesattSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig e-post" };
  }
  const playerId = parsed.data.playerId;
  const foresattEpost = parsed.data.foresattEpost.trim().toLowerCase();

  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: { id: true, role: true, name: true },
  });
  if (!player || player.role !== "PLAYER") {
    return { ok: false, error: "Spiller finnes ikke" };
  }

  const existing = await prisma.lydSamtykke.findUnique({
    where: { userId: playerId },
    select: { status: true },
  });
  if (existing?.status === "GITT") {
    return {
      ok: false,
      error: "Samtykke er allerede gitt. Trekk det først hvis du skal sende på nytt.",
    };
  }

  const token = lagLydSamtykkeToken();
  const tokenExpiresAt = lydSamtykkeTokenUtloper();

  await prisma.lydSamtykke.upsert({
    where: { userId: playerId },
    create: {
      userId: playerId,
      status: "VENTER",
      gittAv: "FORESATT",
      foresattEpost,
      gittAt: null,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
      token,
      tokenExpiresAt,
    },
    update: {
      status: "VENTER",
      gittAv: "FORESATT",
      foresattEpost,
      gittAt: null,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
      token,
      tokenExpiresAt,
    },
  });

  const consentUrl = `${APP_URL}/auth/lyd-samtykke/${token}`;
  const epost = byggLydSamtykkeForesattEpost({
    spillerNavn: player.name,
    consentUrl,
  });

  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: foresattEpost,
      subject: epost.subject,
      html: epost.html,
    });
  } catch (err) {
    await logError({
      context: "lyd-samtykke.foresatt-epost",
      error: err,
      userId: coach.id,
      meta: { playerId, foresattEpost },
    });
    return {
      ok: false,
      error:
        "Kunne ikke sende e-post. Sjekk at RESEND er satt opp, og at DKIM er grønn. Lenken er lagret — prøv igjen.",
    };
  }

  await audit({
    actorId: coach.id,
    action: "lyd-samtykke.foresatt-epost-sendt",
    target: `User:${playerId}`,
    metadata: {
      foresattEpost,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
      ordlydVersjon: LYD_SAMTYKKE_ORDLYD_VERSJON,
    },
  });

  revalidatePath("/admin/recording");
  revalidatePath("/admin/spillere");
  return {
    ok: true,
    message: `E-post sendt til ${foresattEpost}. Opptak er sperret til foresatt har bekreftet.`,
  };
}

/**
 * Trekk samtykke → TRUKKET. Nye opptak sperres umiddelbart.
 */
export async function trekkLydSamtykke(
  input: z.infer<typeof TrekkSchema>,
): Promise<LydSamtykkeActionResult> {
  const coach = await requireCoachActionUser();
  const parsed = TrekkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig input" };
  }
  const { playerId } = parsed.data;

  const existing = await prisma.lydSamtykke.findUnique({
    where: { userId: playerId },
  });
  if (!existing) {
    return { ok: false, error: "Ingen samtykke å trekke" };
  }

  await prisma.lydSamtykke.update({
    where: { userId: playerId },
    data: {
      status: "TRUKKET",
      trukketAt: new Date(),
      token: null,
      tokenExpiresAt: null,
    },
  });

  await audit({
    actorId: coach.id,
    action: "lyd-samtykke.trukket",
    target: `User:${playerId}`,
    metadata: {},
  });

  revalidatePath("/admin/recording");
  revalidatePath("/admin/spillere");
  return { ok: true };
}
