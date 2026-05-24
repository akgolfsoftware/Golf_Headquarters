/**
 * Server actions for spiller-onboarding wizard (/admin/spillere/ny).
 *
 * Wizard har 4 steg:
 *   1. Identitet (navn, e-post, fødselsdato)
 *   2. Golf-profil (HCP, kategori A1/A2/B1/B2/C, hjemmeklubb)
 *   3. Tier (Gratis/Pro) + foreldre-info ved under 18
 *   4. Velkomst-melding + send invitasjon
 *
 * Ved submit opprettes User + (eventuelt) Subscription og Notification i én
 * transaksjon, og det skrives en audit-log.
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import type { Prisma } from "@/generated/prisma/client";

export const SPILLER_KATEGORIER = ["A1", "A2", "B1", "B2", "C"] as const;
export type SpillerKategori = (typeof SPILLER_KATEGORIER)[number];

export const SPILLER_TIERS = ["GRATIS", "PRO"] as const;
export type SpillerTier = (typeof SPILLER_TIERS)[number];

const OpprettSpillerSchema = z
  .object({
    navn: z
      .string()
      .trim()
      .min(2, "Navn må være minst 2 tegn")
      .max(120, "Navn er for langt (maks 120 tegn)"),
    epost: z
      .string()
      .trim()
      .toLowerCase()
      .email("Ugyldig e-postadresse"),
    fodselsdato: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fødselsdato må være på formatet ÅÅÅÅ-MM-DD"),
    hcp: z
      .number()
      .min(-10, "HCP er for lav")
      .max(54, "HCP er for høy")
      .nullable(),
    kategori: z.enum(SPILLER_KATEGORIER),
    hjemmeklubb: z.string().trim().max(120).optional().default(""),
    tier: z.enum(SPILLER_TIERS),
    foreldreNavn: z.string().trim().max(120).optional().default(""),
    foreldreEpost: z
      .union([
        z.string().trim().toLowerCase().email("Ugyldig foreldre-e-post"),
        z.literal(""),
      ])
      .optional()
      .default(""),
    foreldreTelefon: z.string().trim().max(40).optional().default(""),
    velkomstMelding: z.string().trim().max(2000).optional().default(""),
    sendInvitasjon: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const fdato = new Date(data.fodselsdato);
    if (Number.isNaN(fdato.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fodselsdato"],
        message: "Fødselsdato er ugyldig",
      });
      return;
    }
    const naa = new Date();
    if (fdato.getTime() > naa.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fodselsdato"],
        message: "Fødselsdato kan ikke være i fremtiden",
      });
    }
    const aarSiden =
      (naa.getTime() - fdato.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (aarSiden < 4 || aarSiden > 110) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fodselsdato"],
        message: "Alder må være mellom 4 og 110 år",
      });
    }
  });

export type OpprettSpillerInput = z.input<typeof OpprettSpillerSchema>;

export type OpprettSpillerResult =
  | { ok: true; userId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function alderFraDato(iso: string): number {
  const f = new Date(iso);
  const naa = new Date();
  let alder = naa.getFullYear() - f.getFullYear();
  const harHattBursdag =
    naa.getMonth() > f.getMonth() ||
    (naa.getMonth() === f.getMonth() && naa.getDate() >= f.getDate());
  if (!harHattBursdag) alder -= 1;
  return alder;
}

export async function createSpiller(
  input: OpprettSpillerInput,
): Promise<OpprettSpillerResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "unauthenticated" };
  if (me.role !== "COACH" && me.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  const parsed = OpprettSpillerSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Skjemaet inneholder feil — sjekk markerte felter.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const alder = alderFraDato(data.fodselsdato);
  const erUnder18 = alder < 18;

  if (erUnder18 && !data.foreldreNavn) {
    return {
      ok: false,
      error: "Foreldre-navn er påkrevd for spillere under 18 år.",
      fieldErrors: { foreldreNavn: "Påkrevd for spillere under 18 år" },
    };
  }
  if (erUnder18 && !data.foreldreEpost) {
    return {
      ok: false,
      error: "Foreldre-e-post er påkrevd for spillere under 18 år.",
      fieldErrors: { foreldreEpost: "Påkrevd for spillere under 18 år" },
    };
  }

  // Duplikat-sjekk på e-post
  const eksisterende = await prisma.user.findUnique({
    where: { email: data.epost },
  });
  if (eksisterende) {
    return {
      ok: false,
      error: "Registreringen kunne ikke fullføres. Kontakt support hvis problemet vedvarer.",
      fieldErrors: { epost: "E-posten kan ikke brukes. Prøv en annen eller kontakt support." },
    };
  }

  // Placeholder authId før Supabase-invitasjon.
  const placeholderAuthId = `pending:${crypto.randomUUID()}`;

  // Prefs lagrer fødselsdato, kategori og foreldre-info som strukturert JSON.
  const prefs: Record<string, unknown> = {
    fodselsdato: data.fodselsdato,
    alder,
    kategori: data.kategori,
  };
  if (erUnder18) {
    prefs.foreldre = {
      navn: data.foreldreNavn,
      epost: data.foreldreEpost,
      telefon: data.foreldreTelefon || null,
    };
  }

  const nyBruker = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        authId: placeholderAuthId,
        email: data.epost,
        name: data.navn,
        role: "PLAYER",
        tier: data.tier,
        hcp: data.hcp,
        homeClub: data.hjemmeklubb || null,
        preferences: prefs as Prisma.InputJsonValue,
      },
    });

    if (data.tier === "PRO") {
      await tx.subscription.create({
        data: {
          userId: u.id,
          tier: "PRO",
          status: "ACTIVE",
        },
      });
    }

    // Velkomst-varsling i ny spillers innboks (synlig først ved første pålogging).
    await tx.notification.create({
      data: {
        userId: u.id,
        type: "system",
        title: "Velkommen til AK Golf Academy",
        body:
          data.velkomstMelding ||
          "Hei og velkommen til AK Golf Academy. Vi gleder oss til å trene sammen med deg.",
        link: "/portal",
      },
    });

    return u;
  });

  await audit({
    actorId: me.id,
    action: "spiller.onboarded",
    target: `User:${nyBruker.id}`,
    metadata: {
      epost: data.epost,
      kategori: data.kategori,
      tier: data.tier,
      under18: erUnder18,
      sendInvitasjon: data.sendInvitasjon,
    },
  });

  revalidatePath("/admin/spillere");
  return { ok: true, userId: nyBruker.id };
}
