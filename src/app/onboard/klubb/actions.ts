"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { lesRaaPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { deleteFile, uploadFile } from "@/lib/storage/supabase-storage";
import { email, optStr } from "@/lib/validation/schemas";

// ──────────────────────────────────────────────────────────────────────────────
// Klubb-onboarding (5 steg)
// 1) Klubb-info        — navn, adresse, kontakt, logo-upload
// 2) Team              — invitér 1-3 første coacher (e-post)
// 3) Spiller-import    — CSV-upload (skjelett) eller "Vi importerer for dere"
// 4) Stripe-setup      — koble Stripe Connect (skjelett-link)
// 5) Integrasjoner     — Google Cal, Notion, Resend (skjelett)
//
// NB: Det finnes ingen Klubb-modell i Prisma ennå — vi persisterer all data i
// User.preferences.klubbOnboarding. TODO: opprett egen Klubb-modell senere.
// ──────────────────────────────────────────────────────────────────────────────

const KLUBB_TOTAL_STEPS = 5;

const SaveKlubbStepSchema = z.object({
  klubbNavn: optStr(200),
  klubbAdresse: optStr(240),
  klubbKontaktNavn: optStr(120),
  klubbKontaktEpost: email.optional(),
  klubbKontaktTelefon: optStr(20),
  klubbLogoUrl: optStr(600),
  coachInvites: z
    .array(
      z.object({
        navn: z.string().max(120),
        epost: z.string().email(),
      }),
    )
    .max(10)
    .optional(),
  spillerImportValg: z.enum(["CSV", "ASSISTERT", "SENERE"]).optional(),
  stripeConnected: z.boolean().optional(),
  integrations: z
    .object({
      googleCal: z.boolean().optional(),
      notion: z.boolean().optional(),
      resendDomain: z.string().max(200).optional(),
    })
    .optional(),
});

export type KlubbOnboardingData = z.infer<typeof SaveKlubbStepSchema>;

/** Leser ut klubbOnboarding-objektet fra rå preferences (tomt objekt hvis borte). */
function lesKlubbOnboarding(
  prefs: Record<string, unknown>,
): Record<string, unknown> {
  const v = prefs.klubbOnboarding;
  return typeof v === "object" && v !== null
    ? (v as Record<string, unknown>)
    : {};
}

// ──────────────────────────────────────────────────────────────────────────────
// Lagre steg-data
// ──────────────────────────────────────────────────────────────────────────────

export async function saveKlubbOnboardingStep(
  data: KlubbOnboardingData,
): Promise<void> {
  const parsed = SaveKlubbStepSchema.parse(data);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesRaaPreferences(user) as Record<string, unknown>;
  const current = { stepCompleted: 0, ...lesKlubbOnboarding(prefs) };

  const updatedPrefs = {
    ...prefs,
    klubbOnboarding: {
      ...current,
      ...parsed,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  // TODO: persister klubb-info når Klubb-modellen finnes i Prisma.

  revalidatePath("/admin");
}

// ──────────────────────────────────────────────────────────────────────────────
// Klubb-logo — opplasting til Supabase Storage (bucket club-logos, public read)
//
// Ingen Klubb-modell finnes ennå, så fila nøkles på hovedkontaktens bruker-id:
// `klubber/<userId>.<ext>`. URL-en persisteres samtidig i
// User.preferences.klubbOnboarding.klubbLogoUrl slik at den overlever selv om
// brukeren forlater wizarden uten å trykke «Neste».
//
// Feil RETURNERES, aldri kastes (bortsett fra manglende innlogging): Next
// maskerer kastede server action-feil i prod, så norske meldinger må gå som
// verdier for å nå brukeren. Samme mønster som src/lib/storage/avatar.ts.
// ──────────────────────────────────────────────────────────────────────────────

const LOGO_EXT_FOR_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export type UploadKlubbLogoResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadKlubbLogo(
  formData: FormData,
): Promise<UploadKlubbLogoResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const fil = formData.get("file");
  if (!(fil instanceof File)) return { ok: false, error: "Ingen fil sendt." };

  const ext = LOGO_EXT_FOR_TYPE[fil.type];
  if (!ext) {
    return { ok: false, error: "Bare JPG, PNG, WEBP eller SVG er tillatt." };
  }

  const path = `klubber/${user.id}.${ext}`;

  let url: string;
  try {
    // uploadFile validerer størrelse (1 MB) og MIME-type mot bucket-reglene.
    const res = await uploadFile({
      bucket: STORAGE_BUCKETS.CLUB_LOGOS,
      path,
      file: fil,
      upsert: true,
    });
    // Cache-buster så en ny logo vises umiddelbart i stedet for den gamle.
    url = `${res.url}?v=${Date.now()}`;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Opplasting feilet.",
    };
  }

  // Rydd bort tidligere logo lagret med et annet filformat — ellers blir den
  // liggende igjen i bucket-en for alltid (upsert treffer kun samme sti).
  const gamle = Object.values(LOGO_EXT_FOR_TYPE)
    .filter((e) => e !== ext)
    .map((e) => `klubber/${user.id}.${e}`);
  for (const g of gamle) {
    await deleteFile(STORAGE_BUCKETS.CLUB_LOGOS, g);
  }

  const prefs = lesRaaPreferences(user) as Record<string, unknown>;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      preferences: {
        ...prefs,
        klubbOnboarding: {
          stepCompleted: 0,
          ...lesKlubbOnboarding(prefs),
          klubbLogoUrl: url,
        },
      },
    },
  });

  revalidatePath("/onboard/klubb");

  return { ok: true, url };
}

// ──────────────────────────────────────────────────────────────────────────────
// Marker steg ferdig
// ──────────────────────────────────────────────────────────────────────────────

export async function markKlubbStepComplete(stepNumber: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesRaaPreferences(user) as Record<string, unknown>;
  const existing = lesKlubbOnboarding(prefs);

  const currentCompleted =
    typeof existing.stepCompleted === "number" ? existing.stepCompleted : 0;

  const updatedPrefs = {
    ...prefs,
    klubbOnboarding: {
      ...existing,
      stepCompleted: Math.max(currentCompleted, stepNumber),
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/admin");
}

// ──────────────────────────────────────────────────────────────────────────────
// Fullfør klubb-onboarding → redirect til /admin
// ──────────────────────────────────────────────────────────────────────────────

export async function completeKlubbOnboarding(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesRaaPreferences(user) as Record<string, unknown>;
  const existing = lesKlubbOnboarding(prefs);

  const updatedPrefs = {
    ...prefs,
    klubbOnboarding: {
      ...existing,
      completedAt: new Date().toISOString(),
      stepCompleted: KLUBB_TOTAL_STEPS,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/admin");
  redirect("/admin");
}
