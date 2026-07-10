"use server";

// Server-actions for AgencyOS e-post-innboks (post@akgolf.no).
//
// genererUtkast(): kalles automatisk ved inntak (fra webhook-ruten, fire-and-
// forget) — ingen auth-guard, siden den ikke er tilgjengelig for klienten
// (denne filen importeres aldri av en "use client"-komponent).
//
// sendGodkjentSvar() / arkiverEpost(): trigges av coach-klikk i UI —
// ADMIN/COACH-guardet. Sending skjer ALDRI automatisk, kun ved eksplisitt
// knappetrykk.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { audit } from "@/lib/audit";
import { anthropic, AI_MODEL, isAiEnabled } from "@/lib/ai/client";
import { resendKlient, FRA_EPOST } from "@/lib/email";

const UTKAST_SYSTEM = `
Du er e-post-assistent for Anders Kristiansen, daglig leder i AK Golf Group.
Du skriver et utkast til svar på en innkommende e-post til post@akgolf.no.

Tone: varm, direkte, norsk bokmål. Aldri utropstegn, aldri em-dash, aldri emoji.
Skriv slik Anders selv ville skrevet — kort og konkret, ingen floskler.
Svar KUN med selve e-post-teksten (ingen emne-linje, ingen forklaring rundt).
Avslutt med "Hilsen Anders".
`.trim();

function REVALIDER() {
  revalidatePath("/admin/innboks-epost");
  revalidatePath("/admin/agencyos");
  revalidatePath("/v2-cockpit");
}

/** Statisk, høflig fallback-utkast når AI er avslått (demo-modus). */
function byggDemoUtkast(fraNavn: string | null, emne: string): string {
  const navn = fraNavn?.trim() || "der";
  return [
    `Hei ${navn},`,
    "",
    `Takk for meldingen om «${emne}». Jeg har lest den og kommer tilbake til deg så snart jeg har sett nærmere på det.`,
    "",
    "Hilsen Anders",
  ].join("\n");
}

/**
 * Genererer et utkast til svar og lagrer det på e-posten.
 * Kalles automatisk fra inntaksruten — ikke eksponert i UI.
 */
export async function genererUtkast(epostId: string): Promise<void> {
  const epost = await prisma.innboksEpost.findUnique({ where: { id: epostId } });
  if (!epost) return;
  // Ikke overskriv et svar som allerede er sendt eller arkivert.
  if (epost.status === "SENDT" || epost.status === "ARKIVERT") return;

  let utkast: string;
  if (isAiEnabled() && anthropic) {
    try {
      const userPrompt = `
Fra: ${epost.fraNavn ? `${epost.fraNavn} <${epost.fraEpost}>` : epost.fraEpost}
Emne: ${epost.emne}

E-postens innhold:
${epost.brodtekst}
`.trim();
      const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 500,
        system: UTKAST_SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      });
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim();
      utkast = text || byggDemoUtkast(epost.fraNavn, epost.emne);
    } catch {
      utkast = byggDemoUtkast(epost.fraNavn, epost.emne);
    }
  } else {
    utkast = byggDemoUtkast(epost.fraNavn, epost.emne);
  }

  await prisma.innboksEpost.update({
    where: { id: epostId },
    data: { utkastSvar: utkast, utkastGenerertAt: new Date(), status: "UTKAST_KLART" },
  });
  REVALIDER();
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

  await prisma.innboksEpost.update({
    where: { id: epostId },
    data: {
      status: "SENDT",
      utkastSvar: redigertSvar,
      sendtAt: new Date(),
      sendtAv: user.id,
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
