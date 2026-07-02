"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { assertNotAwaitingConsent } from "@/lib/auth/requireConsentingUser";
import { audit } from "@/lib/audit";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import type { DrillFasilitet } from "@/generated/prisma/client";

const LagreFasilitetProfilSchema = z.object({
  fasiliteter: z.array(z.string().min(1)).max(20, "For mange fasiliteter"),
});

const DeleteUserAccountSchema = z.object({
  confirmation: z.literal("SLETT", { error: 'Du må skrive "SLETT" for å bekrefte.' }),
});

const GYLDIGE_FASILITETER: DrillFasilitet[] = [
  "RADAR",
  "MAT_NET",
  "BUNKER",
  "KAMERA",
  "PUTTING_GREEN_KORT",
  "PUTTING_GREEN_LANG",
  "SHORT_GAME_AREA",
  "DRIVING_RANGE",
  "BANE",
  "SIMULATOR",
];

/**
 * Lagrer spillerens tilgjengelige fasiliteter og utstyr.
 * Brukes fra /portal/meg/innstillinger/anlegg.
 */
export async function lagreFasilitetProfil(
  fasiliteter: DrillFasilitet[],
): Promise<{ ok: boolean; error?: string }> {
  const zodResult = LagreFasilitetProfilSchema.safeParse({ fasiliteter });
  if (!zodResult.success) {
    return { ok: false, error: zodResult.error.issues[0]?.message ?? "Ugyldig input" };
  }
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };
  assertNotAwaitingConsent(user);

  // Valider at alle verdier er gyldige enum-verdier
  const validerte = fasiliteter.filter((f) =>
    (GYLDIGE_FASILITETER as string[]).includes(f),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { tilgjengeligeFasiliteter: validerte },
  });

  await audit({
    actorId: user.id,
    action: "user.fasilitet_profil_oppdatert",
    target: user.id,
    metadata: { fasiliteter: validerte },
  });

  return { ok: true };
}

const SUPPORT_EPOST = "support@akgolf.no";

/**
 * GDPR data-eksport (P20).
 * Genererer JSON-fil med all bruker-data og sender via e-post.
 * Returnerer JSON-blob til klient som kan trigge nedlasting.
 */
export async function exportUserData(): Promise<{
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };
  assertNotAwaitingConsent(user);

  try {
    // Samle all bruker-data fra Prisma
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        bookings: true,
        parentRelations: { include: { parent: true } },
        childRelations: { include: { child: true } },
      },
    });

    const [
      goals,
      rounds,
      tournamentEntries,
      seasonPlans,
      trainingSessions,
      testResults,
      trackmanSessions,
      payments,
      notifications,
      healthEntries,
      equipmentBag,
      messages,
    ] = await Promise.all([
      prisma.goal.findMany({ where: { userId: user.id } }),
      prisma.round.findMany({ where: { userId: user.id } }),
      prisma.tournamentEntry.findMany({ where: { userId: user.id }, include: { tournament: true } }),
      prisma.seasonPlan.findMany({ where: { userId: user.id }, include: { periodBlocks: true } }),
      prisma.trainingSessionV2.findMany({ where: { studentId: user.id } }),
      prisma.testResult.findMany({ where: { userId: user.id } }),
      prisma.trackManSession.findMany({ where: { userId: user.id } }),
      prisma.payment.findMany({ where: { userId: user.id } }),
      prisma.notification.findMany({ where: { userId: user.id } }),
      prisma.healthEntry.findMany({ where: { userId: user.id } }).catch(() => []),
      prisma.equipmentBag.findMany({ where: { userId: user.id } }).catch(() => []),
      prisma.caddieMessage.findMany({ where: { userId: user.id } }).catch(() => []),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: fullUser,
      goals,
      rounds,
      tournamentEntries,
      seasonPlans,
      trainingSessions,
      testResults,
      trackmanSessions,
      payments,
      notifications,
      healthEntries,
      equipmentBag,
      messages,
      _note:
        "Dette er en komplett eksport av dine personlige data fra AK Golf HQ per dato. " +
        "Iht. GDPR artikkel 15 (rett til innsyn). Spørsmål: post@akgolf.no",
    };

    // E-post-bekreftelse + kopi til support
    try {
      const klient = resendKlient();
      if (user.email) {
        await klient.emails.send({
          from: FRA_EPOST,
          to: user.email,
          subject: "Dine data er eksportert — AK Golf",
          html: `<p>Hei ${user.name ?? "der"},</p>
            <p>Du har lastet ned en komplett eksport av dine data fra AK Golf HQ.</p>
            <p>Eksporten inkluderer: profil, runder, økter, mål, betalinger, varsler, helse-loggføringer, utstyr, meldinger.</p>
            <p>Tidspunkt: ${new Date().toLocaleString("nb-NO")}</p>
            <p>Hvis dette ikke var deg, kontakt oss umiddelbart på post@akgolf.no.</p>
            <p>Mvh,<br/>AK Golf Group</p>`,
        });
      }
    } catch (err) {
      console.error("[gdpr-eksport] e-post feilet", err);
    }

    await audit({
      actorId: user.id,
      action: "gdpr.data_exported",
      target: user.id,
      metadata: { email: user.email, recordCount: Object.keys(exportPayload).length },
    });

    return { ok: true, data: exportPayload };
  } catch (error) {
    const { logError } = await import("@/lib/error-tracking");
    await logError({ context: "gdpr.export", error, userId: user.id });
    return { ok: false, error: "Eksport feilet. Prøv igjen eller kontakt support." };
  }
}

/**
 * GDPR soft-delete av konto (P20).
 * Setter User.deletedAt = now(). Cron /api/cron/cleanup-deleted-accounts sletter
 * permanent etter 30 dager. Brukeren kan angre via support innenfor det vinduet.
 */
export async function deleteUserAccount(
  confirmation: string,
): Promise<{ ok: boolean; error?: string }> {
  const zodResult = DeleteUserAccountSchema.safeParse({ confirmation });
  if (!zodResult.success) {
    return { ok: false, error: zodResult.error.issues[0]?.message ?? "Ugyldig bekreftelse" };
  }
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };
  assertNotAwaitingConsent(user);

  try {
    // Soft-delete
    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });

    // E-post-bekreftelse
    try {
      const klient = resendKlient();
      if (user.email) {
        await klient.emails.send({
          from: FRA_EPOST,
          to: user.email,
          subject: "Konto markert for sletting — AK Golf",
          html: `<p>Hei ${user.name ?? "der"},</p>
            <p>Vi har mottatt din forespørsel om kontosletting.</p>
            <p><strong>Hva skjer nå:</strong></p>
            <ul>
              <li>Kontoen din er deaktivert umiddelbart</li>
              <li>Alle dine data slettes permanent etter <strong>30 dager</strong></li>
              <li>I 30-dagers-vinduet kan du angre ved å kontakte oss på post@akgolf.no</li>
            </ul>
            <p>Mvh,<br/>AK Golf Group</p>`,
        });
      }
      await klient.emails.send({
        from: FRA_EPOST,
        to: SUPPORT_EPOST,
        subject: `Konto markert for sletting — ${user.email}`,
        html: `<p>Bruker har slettet seg selv via portal.</p>
          <ul>
            <li>Navn: ${user.name ?? "–"}</li>
            <li>E-post: ${user.email}</li>
            <li>ID: ${user.id}</li>
            <li>Soft-delete: ${new Date().toISOString()}</li>
            <li>Permanent slett: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}</li>
          </ul>`,
      });
    } catch (err) {
      console.error("[gdpr-sletting] e-post feilet", err);
    }

    await audit({
      actorId: user.id,
      action: "gdpr.account_soft_deleted",
      target: user.id,
      metadata: { email: user.email },
    });

    return { ok: true };
  } catch (error) {
    const { logError } = await import("@/lib/error-tracking");
    await logError({ context: "gdpr.delete-account", error, userId: user.id });
    return { ok: false, error: "Sletting feilet. Kontakt support." };
  }
}

/**
 * @deprecated — Bruk exportUserData() istedenfor (returnerer faktisk data).
 */
export async function requestDataExport(): Promise<void> {
  const result = await exportUserData();
  if (!result.ok) {
    throw new Error(result.error ?? "export_failed");
  }
  redirect("/portal/meg/innstillinger?ok=eksport");
}

/**
 * @deprecated — Bruk deleteUserAccount(confirmation) istedenfor.
 */
export async function requestAccountDeletion(): Promise<void> {
  const result = await deleteUserAccount("SLETT");
  if (!result.ok) {
    throw new Error(result.error ?? "delete_failed");
  }
  redirect("/auth/login?deleted=1");
}
