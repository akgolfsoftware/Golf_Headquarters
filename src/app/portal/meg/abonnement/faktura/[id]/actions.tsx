"use server";

// Server action: send fakturaen som PDF-vedlegg på e-post til innlogget bruker.
// Bruker den eksisterende Resend-klienten (src/lib/email.ts). Kun ekte
// Payment-felt — ingen fabrikerte beløp.

import { renderToBuffer } from "@react-pdf/renderer";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import {
  FakturaDocument,
  byggFakturaData,
  fakturaFilnavn,
} from "./faktura-document";

export type SendFakturaResultat =
  | { ok: true; epost: string }
  | { ok: false; feil: string };

export async function sendFakturaPaaEpost(
  paymentId: string,
): Promise<SendFakturaResultat> {
  const user = await requirePortalUser();

  if (!user.email) {
    return { ok: false, feil: "Kontoen din mangler e-postadresse." };
  }

  // Samme eierskaps-scope som skjermen: kun brukerens egen Payment.
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: user.id },
    select: {
      id: true,
      amountOre: true,
      status: true,
      paidAt: true,
      createdAt: true,
      description: true,
      stripeChargeId: true,
      stripeInvoiceId: true,
    },
  });

  if (!payment) {
    return { ok: false, feil: "Fant ingen faktura med denne ID-en." };
  }

  const data = byggFakturaData(payment, {
    navn: user.name ?? "—",
    epost: user.email,
  });

  const buffer = await renderToBuffer(<FakturaDocument data={data} />);
  const filnavn = fakturaFilnavn(data.fakturaNr);

  try {
    const { error } = await resendKlient().emails.send({
      from: FRA_EPOST,
      to: user.email,
      subject: `Faktura #${data.fakturaNr} — AK Golf Academy`,
      html: byggEpostHtml(user.name ?? "der", data.fakturaNr),
      attachments: [
        {
          filename: filnavn,
          content: Buffer.from(buffer),
        },
      ],
    });
    if (error) {
      return { ok: false, feil: "E-posten kunne ikke sendes akkurat nå." };
    }
  } catch {
    return { ok: false, feil: "E-posten kunne ikke sendes akkurat nå." };
  }

  return { ok: true, epost: user.email };
}

function byggEpostHtml(navn: string, fakturaNr: string): string {
  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 12px;">Hei ${navn} —</h1>
  <p>Her er fakturaen din fra AK Golf Academy. Den ligger vedlagt som PDF i denne e-posten.</p>
  <p style="margin-top: 16px; color: #5E5C57; font-size: 13px;">
    Faktura <strong style="color: #0A1F17;">#${fakturaNr}</strong>
  </p>
  <p style="margin-top: 24px; color: #5E5C57; font-size: 12px;">
    Spørsmål om fakturaen? Svar på denne e-posten, så hjelper vi deg.
  </p>
</body>
</html>`;
}
