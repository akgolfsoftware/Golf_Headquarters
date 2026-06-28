"use server";

import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { isSameOriginAction } from "@/lib/security/same-origin";

export type ConfirmGuardianConsentInput = {
  token: string;
  guardianName: string;
};

/**
 * Bekrefter foreldresamtykke for mindreårig spiller (GDPR art. 8, P17).
 *
 * Flyt:
 *  1. Finn ParentInvitation via token
 *  2. Sjekk gyldighet (ikke utløpt, ikke akseptert)
 *  3. Finn-eller-opprett forelder-bruker basert på e-post
 *  4. Opprett ParentRelation mellom forelder og barn
 *  5. Oppdater spiller: guardianConsentGivenAt = now() + guardianConsentByUserId
 *  6. Merk invitasjon som akseptert
 *  7. Send bekreftelse-e-post til forelder + barn
 */
export async function confirmGuardianConsent({
  token,
  guardianName,
}: ConfirmGuardianConsentInput): Promise<{ ok: boolean; error?: string }> {
  // CSRF-vern: denne action-en behandler persondata for en mindreårig og oppretter
  // en tilgangsgivende relasjon. Avvis forespørsler fra fremmed opphav.
  if (!(await isSameOriginAction())) {
    return { ok: false, error: "Avvist: forespørselen kom fra feil opphav." };
  }
  try {
    const invitation = await prisma.parentInvitation.findUnique({
      where: { token },
      include: { player: true },
    });

    if (!invitation) {
      return { ok: false, error: "Invitasjon ikke funnet." };
    }

    if (invitation.expiresAt < new Date()) {
      return { ok: false, error: "Invitasjonen er utløpt." };
    }

    if (invitation.acceptedAt) {
      return { ok: false, error: "Invitasjonen er allerede akseptert." };
    }

    // Finn eller opprett forelder-bruker
    let guardian = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!guardian) {
      // Opprett ny forelder-bruker (Supabase auth-user opprettes når de logger inn første gang)
      guardian = await prisma.user.create({
        data: {
          authId: `pending-${invitation.id}`, // Vil bli oppdatert ved første login
          email: invitation.email,
          name: guardianName,
          role: "PARENT",
        },
      });
    } else if (guardian.role === "PLAYER") {
      // Oppgrader fra PLAYER til PARENT (eller hold begge?)
      // Per design: en bruker kan ha flere roller. Setter PARENT som primær.
      await prisma.user.update({
        where: { id: guardian.id },
        data: { role: "PARENT" },
      });
    }

    // Opprett ParentRelation (idempotent via @@unique[parentId, childId])
    await prisma.parentRelation.upsert({
      where: {
        parentId_childId: {
          parentId: guardian.id,
          childId: invitation.playerId,
        },
      },
      update: { approved: true },
      create: {
        parentId: guardian.id,
        childId: invitation.playerId,
        approved: true,
        relationship: invitation.relation === "GUARDIAN" ? "Foresatt" : "Foresatt",
      },
    });

    // Oppdater spilleren — samtykke gitt
    await prisma.user.update({
      where: { id: invitation.playerId },
      data: {
        guardianConsentGivenAt: new Date(),
        guardianConsentByUserId: guardian.id,
        // Behold requiresGuardianConsent = true for historikk; samtykke er gitt
      },
    });

    // Merk invitasjon som akseptert
    await prisma.parentInvitation.update({
      where: { id: invitation.id },
      data: {
        acceptedAt: new Date(),
        acceptedById: guardian.id,
      },
    });

    // Audit-log
    await audit({
      actorId: guardian.id,
      action: "gdpr.guardian_consent_given",
      target: invitation.playerId,
      metadata: {
        guardianName,
        guardianEmail: invitation.email,
        playerEmail: invitation.player.email,
      },
    });

    // Send bekreftelses-e-poster
    try {
      const klient = resendKlient();
      // Til forelder
      await klient.emails.send({
        from: FRA_EPOST,
        to: invitation.email,
        subject: "Samtykke bekreftet — AK Golf",
        html: `<p>Hei ${guardianName},</p>
          <p>Takk for at du bekreftet samtykke for <strong>${invitation.player.name}</strong>.</p>
          <p>Du har nå tilgang til foreldreportalen der du kan følge med på barnets utvikling, bookinger og fakturaer.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf-hq.vercel.app"}/forelder">Gå til foreldreportalen</a></p>
          <p>Du kan trekke samtykket når som helst ved å kontakte oss på post@akgolf.no.</p>
          <p>Mvh,<br/>AK Golf Group</p>`,
      });
      // Til barn (hvis e-post)
      if (invitation.player.email) {
        await klient.emails.send({
          from: FRA_EPOST,
          to: invitation.player.email,
          subject: "Foreldresamtykke bekreftet — du kan nå bruke AK Golf",
          html: `<p>Hei ${invitation.player.name},</p>
            <p>Foreldresamtykke fra ${guardianName} er nå bekreftet, og du kan bruke AK Golf-portalen.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf-hq.vercel.app"}/portal">Logg inn</a></p>
            <p>Velkommen!<br/>AK Golf Group</p>`,
        });
      }
    } catch (err) {
      console.error("[guardian-consent] e-post feilet", err);
    }

    return { ok: true };
  } catch (error) {
    await logError({
      context: "guardian-consent.confirm",
      error,
      meta: { token: token.slice(0, 8) + "..." },
    });
    return { ok: false, error: "Noe gikk galt. Prøv igjen eller kontakt support." };
  }
}
