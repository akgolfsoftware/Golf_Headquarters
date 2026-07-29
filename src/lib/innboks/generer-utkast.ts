// Utkast-generator for AgencyOS e-post-innboks.
//
// BEVISST IKKE en server action: den kalles kun server-til-server fra
// webhook-ruten /api/inbox/inbound (som er beskyttet med delt hemmelighet).
// Lå tidligere i actions.ts med kommentaren «ingen auth-guard, siden den ikke
// er tilgjengelig for klienten» — det premisset var feil: filen importeres av
// InnboksEpostV2.tsx ("use client"), så ENHVER eksport derfra får en offentlig
// action-id og kan kalles av hvem som helst. Flyttet hit 2026-07-27 slik at
// endepunktet ikke finnes i det hele tatt.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { anthropic, modelFor, isAiEnabled } from "@/lib/ai/client";

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
        model: modelFor("innboks-utkast"),
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
