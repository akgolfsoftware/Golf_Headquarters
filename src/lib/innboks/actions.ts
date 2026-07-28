"use server";

// Server-actions for AgencyOS e-post-innboks (post@akgolf.no).
//
// ALT som eksporteres herfra er et offentlig endepunkt: filen importeres av
// InnboksEpostV2.tsx ("use client"), så hver eksport får en action-id som kan
// kalles av hvem som helst. Derfor MÅ hver eksport ha egen auth-guard —
// «ikke importert av en klient» er ikke en sikkerhetsgrense.
//
// sendGodkjentSvar() / arkiverEpost(): trigges av coach-klikk i UI —
// ADMIN/COACH-guardet. Sending skjer ALDRI automatisk, kun ved eksplisitt
// knappetrykk.
//
// Utkast-generatoren bor i ./generer-utkast.ts — den kalles server-til-server
// fra webhook-ruten og skal derfor IKKE være en action.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { audit } from "@/lib/audit";
import { resendKlient, FRA_EPOST } from "@/lib/email";



function REVALIDER() {
  revalidatePath("/admin/innboks-epost");
  revalidatePath("/admin/agencyos");
  revalidatePath("/v2-cockpit");
}



/**
 * Sender det godkjente (evt. redigerte) svaret. Kun via eksplisitt
 * knappetrykk i UI — aldri automatisk.
 */
export async function sendGodkjentSvar(
  epostId: string,
  redigertSvar: string,
): Promise<{ sendtReelt: boolean; melding: string }> {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const epost = await prisma.innboksEpost.findUnique({ where: { id: epostId } });
  if (!epost) throw new Error("not-found");

  let sendtReelt = false;
  let melding = "Svaret er sendt.";

  if (process.env.RESEND_API_KEY) {
    try {
      await resendKlient().emails.send({
        from: FRA_EPOST,
        to: epost.fraEpost,
        subject: `Re: ${epost.emne}`,
        text: redigertSvar,
      });
      sendtReelt = true;
    } catch {
      melding = "Sending feilet — svaret er lagret, prøv igjen senere.";
    }
  } else {
    melding = "Sending krever Resend-oppsett — svaret er lagret.";
  }

  // Marker kun som SENDT når e-posten faktisk gikk ut. Feiler sendingen, behold
  // utkastet som UTKAST_KLART så coachen kan prøve igjen (knappen forblir aktiv).
  await prisma.innboksEpost.update({
    where: { id: epostId },
    data: sendtReelt
      ? {
          status: "SENDT",
          utkastSvar: redigertSvar,
          sendtAt: new Date(),
          sendtAv: user.id,
        }
      : {
          status: "UTKAST_KLART",
          utkastSvar: redigertSvar,
        },
  });

  await audit({
    actorId: user.id,
    action: "innboks_epost.send",
    target: epostId,
    metadata: { sendtReelt },
  });

  REVALIDER();
  return { sendtReelt, melding };
}

/** Arkiverer e-posten uten å sende svar. */
export async function arkiverEpost(epostId: string): Promise<void> {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  await prisma.innboksEpost.update({
    where: { id: epostId },
    data: { status: "ARKIVERT" },
  });

  await audit({ actorId: user.id, action: "innboks_epost.arkiver", target: epostId });

  REVALIDER();
}
