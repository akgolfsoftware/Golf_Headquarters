"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// getCurrentUserRaw (ikke getCurrentUser): under onboarding setter en mindreårig
// fødselsdato (som TRIGGER samtykke-kravet) og kan resende invitasjonen MENS hen
// venter på samtykke. getCurrentUser ville redirecte til venterommet og gjort
// disse stegene umulige å fullføre. Onboarding er flyten FØR samtykke er gitt.
import { getCurrentUserRaw as getCurrentUser } from "@/lib/auth/getCurrentUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { isMinor } from "@/lib/auth/minor";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { emailLayout, primaryButton } from "@/lib/email/templates/shared";
import { logError } from "@/lib/error-tracking";
import { phone, email, optStr } from "@/lib/validation/schemas";

const SaveOnboardingProfileSchema = z.object({
  phone: phone.nullable().optional(),
  hcp: z.number().nullable().optional(),
  playingYears: z.number().int().nullable().optional(),
  ambition: optStr(1000),
  homeClub: optStr(200),
});

const SetDateOfBirthSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig datoformat — bruk ÅÅÅÅ-MM-DD"),
  guardianEmail: email.optional(),
  guardianRelation: z.enum(["GUARDIAN", "MOTHER", "FATHER"]).optional(),
});

const ResendInvitationSchema = z.object({
  guardianEmail: email,
});

// ──────────────────────────────────────────────────────────────────────────────
// Typer
// ──────────────────────────────────────────────────────────────────────────────

export type SpillerOnboardingData = {
  // Steg 1 — Velkommen (ingen data)
  // Steg 2 — Om deg
  name?: string;
  phone?: string;
  // Steg 3 — Golf-erfaring
  hcp?: number;
  homeClub?: string;
  playingYears?: number;
  sessionFrequency?: number;
  playTournaments?: string;
  seasonGoals?: string[];
  // Steg 5 — Coach + abonnement
  selectedCoach?: string;
  selectedTier?: string;
  // Steg 6 — Avtaler
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
};

export type ForelderOnboardingData = {
  // Steg 2 — Om barnet
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentRelation?: string;
  // Steg 3 — Vilkår
  acceptedTermsParent?: boolean;
  acceptedPrivacyParent?: boolean;
  acceptedPaymentParent?: boolean;
  // Steg 4 — Betaling
  paymentMethod?: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Lagre spiller-onboarding steg
// ──────────────────────────────────────────────────────────────────────────────

export async function saveOnboardingProfile(input: {
  phone?: string | null;
  hcp?: number | null;
  playingYears?: number | null;
  ambition?: string | null;
  homeClub?: string | null;
}) {
  SaveOnboardingProfileSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: input.phone ?? user.phone,
      hcp: input.hcp ?? user.hcp,
      playingYears: input.playingYears ?? user.playingYears,
      ambition: input.ambition ?? user.ambition,
      homeClub: input.homeClub ?? user.homeClub,
    },
  });

  revalidatePath("/portal");
}

export async function saveSpillerOnboardingStep(
  data: SpillerOnboardingData
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const currentOnboarding =
    typeof (prefs as Record<string, unknown>).onboarding === "object" &&
    (prefs as Record<string, unknown>).onboarding !== null
      ? ((prefs as Record<string, unknown>).onboarding as Record<
          string,
          unknown
        >)
      : { stepCompleted: 0 };

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    onboarding: {
      ...currentOnboarding,
      ...data,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: data.phone ?? user.phone,
      hcp: data.hcp ?? user.hcp,
      homeClub: data.homeClub ?? user.homeClub,
      playingYears: data.playingYears ?? user.playingYears,
      preferences: updatedPrefs,
    },
  });

  revalidatePath("/portal");
}

// ──────────────────────────────────────────────────────────────────────────────
// Marker steg ferdig og lagre steg-nummer
// ──────────────────────────────────────────────────────────────────────────────

export async function markStepComplete(stepNumber: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).onboarding === "object" &&
    (prefs as Record<string, unknown>).onboarding !== null
      ? ((prefs as Record<string, unknown>).onboarding as Record<
          string,
          unknown
        >)
      : {};

  const currentCompleted =
    typeof existing.stepCompleted === "number" ? existing.stepCompleted : 0;

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    onboarding: {
      ...existing,
      stepCompleted: Math.max(currentCompleted, stepNumber),
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
}

// ──────────────────────────────────────────────────────────────────────────────
// Fullfør onboarding
// ──────────────────────────────────────────────────────────────────────────────

export async function completeOnboarding(subscribe?: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).onboarding === "object" &&
    (prefs as Record<string, unknown>).onboarding !== null
      ? ((prefs as Record<string, unknown>).onboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    onboarding: {
      ...existing,
      completedAt: new Date().toISOString(),
      stepCompleted: 7,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
  // Gjenoppta valgt checkout hvis besøkende startet med en abonnement-intent.
  if (subscribe) {
    redirect(`/auth/checkout-resume?plan=${encodeURIComponent(subscribe)}`);
  }
  redirect("/portal");
}

// ──────────────────────────────────────────────────────────────────────────────
// Forelder-onboarding
// ──────────────────────────────────────────────────────────────────────────────

export async function saveForelderOnboardingStep(
  data: ForelderOnboardingData
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).forelderOnboarding === "object" &&
    (prefs as Record<string, unknown>).forelderOnboarding !== null
      ? ((prefs as Record<string, unknown>).forelderOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    forelderOnboarding: {
      ...existing,
      ...data,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
}

export async function completeForelderOnboarding(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).forelderOnboarding === "object" &&
    (prefs as Record<string, unknown>).forelderOnboarding !== null
      ? ((prefs as Record<string, unknown>).forelderOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    forelderOnboarding: {
      ...existing,
      completedAt: new Date().toISOString(),
      stepCompleted: 4,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
  redirect("/portal");
}

// ──────────────────────────────────────────────────────────────────────────────
// P17 GDPR art. 8 — Mindreårig + foreldresamtykke
// Sett fødselsdato + auto-send ParentInvitation hvis spiller < 16 år
// ──────────────────────────────────────────────────────────────────────────────

const INVITATION_TTL_DAYS = 30;

export async function setDateOfBirthAndCheckMinor(input: {
  dateOfBirth: string; // ISO date "YYYY-MM-DD"
  guardianEmail?: string; // Påkrevd hvis < 16 år
  guardianRelation?: "GUARDIAN" | "MOTHER" | "FATHER";
}): Promise<{
  ok: boolean;
  error?: string;
  isMinor: boolean;
  invitationSent?: boolean;
}> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated", isMinor: false };

  const zodResult = SetDateOfBirthSchema.safeParse(input);
  if (!zodResult.success) {
    return { ok: false, error: zodResult.error.issues[0]?.message ?? "Ugyldig input", isMinor: false };
  }

  try {
    const dob = new Date(input.dateOfBirth);
    if (isNaN(dob.getTime())) {
      return { ok: false, error: "Ugyldig fødselsdato.", isMinor: false };
    }

    const minor = isMinor(dob);

    // Hvis mindreårig: krever guardian-email
    if (minor && !input.guardianEmail) {
      return {
        ok: false,
        error:
          "Brukere under 16 år trenger foreldresamtykke. Vennligst oppgi e-post til foresatt.",
        isMinor: true,
      };
    }

    // Oppdater bruker med dateOfBirth + requiresGuardianConsent
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dateOfBirth: dob,
        requiresGuardianConsent: minor,
      },
    });

    let invitationSent = false;

    // Hvis mindreårig: opprett ParentInvitation + send e-post
    if (minor && input.guardianEmail) {
      const expiresAt = new Date(
        Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
      );

      const invitation = await prisma.parentInvitation.create({
        data: {
          playerId: user.id,
          email: input.guardianEmail.trim().toLowerCase(),
          relation: input.guardianRelation ?? "GUARDIAN",
          expiresAt,
        },
      });

      // Send e-post til forelder
      try {
        const klient = resendKlient();
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf-hq.vercel.app";
        const consentUrl = `${appUrl}/auth/guardian-consent/${invitation.token}`;

        await klient.emails.send({
          from: FRA_EPOST,
          to: input.guardianEmail,
          subject: `${user.name} ber om foreldresamtykke — AK Golf`,
          html: emailLayout({
            preheader: `${user.name} ønsker å bruke AK Golf-plattformen og trenger foreldresamtykke.`,
            heading: "Hei,",
            body: `
              <p style="margin:0 0 16px 0;"><strong>${user.name}</strong> ønsker å bruke AK Golf-plattformen, men er under 16 år og trenger foreldresamtykke iht. GDPR art. 8.</p>
              <p style="margin:0 0 24px 0;">Klikk lenken under for å se hva samtykket innebærer og bekrefte (tar 2 minutter):</p>
              <p style="margin:0 0 8px 0;">${primaryButton("Bekreft samtykke", consentUrl)}</p>
              <p style="margin:0;font-size:13px;color:#5E5C57;">Lenken er gyldig i 30 dager.</p>
            `,
          }),
        });

        invitationSent = true;
      } catch (err) {
        await logError({
          context: "onboarding.minor.invitation-email",
          error: err,
          userId: user.id,
          meta: { invitationId: invitation.id, guardianEmail: input.guardianEmail },
        });
      }
    }

    revalidatePath("/portal");

    return { ok: true, isMinor: minor, invitationSent };
  } catch (error) {
    await logError({
      context: "onboarding.set-date-of-birth",
      error,
      userId: user.id,
    });
    return { ok: false, error: "Noe gikk galt. Prøv igjen.", isMinor: false };
  }
}

/**
 * Send ny invitation til forelder (eks. hvis utløpt eller feil e-post).
 * Brukes fra PortalShell-banner.
 */
export async function resendGuardianInvitation(input: {
  guardianEmail: string;
}): Promise<{ ok: boolean; error?: string }> {
  const zodResult = ResendInvitationSchema.safeParse(input);
  if (!zodResult.success) {
    return { ok: false, error: zodResult.error.issues[0]?.message ?? "Ugyldig e-post" };
  }
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };
  if (!user.requiresGuardianConsent) {
    return { ok: false, error: "Bruker trenger ikke foreldresamtykke." };
  }

  try {
    // Marker eksisterende invitations som utløpt
    await prisma.parentInvitation.updateMany({
      where: {
        playerId: user.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() },
    });

    // Opprett ny + send e-post
    const result = await setDateOfBirthAndCheckMinor({
      dateOfBirth: user.dateOfBirth?.toISOString().split("T")[0] ?? "",
      guardianEmail: input.guardianEmail,
    });

    return { ok: result.ok, error: result.error };
  } catch (error) {
    await logError({ context: "onboarding.resend-invitation", error, userId: user.id });
    return { ok: false, error: "Kunne ikke sende invitasjon på nytt." };
  }
}
