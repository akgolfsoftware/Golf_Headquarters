/**
 * E-postmal for foresatt-lydsamtykke (Resend HTML).
 */

import { emailLayout, primaryButton } from "@/lib/email/templates/shared";
import { LYD_SAMTYKKE_TOKEN_TTL_DAGER } from "./lyd-samtykke-token";

export function byggLydSamtykkeForesattEpost(input: {
  spillerNavn: string;
  consentUrl: string;
}): { subject: string; html: string; preheader: string } {
  const preheader = `${input.spillerNavn} trenger samtykke til lydopptak under coaching.`;
  const subject = `Samtykke til lydopptak for ${input.spillerNavn} — AK Golf`;

  const body = `
    <p style="margin:0 0 16px 0;">Hei,</p>
    <p style="margin:0 0 16px 0;">
      <strong>${escapeHtml(input.spillerNavn)}</strong> trener med AK Golf Academy.
      For å ta opp lyd under coaching-økter (for oppsummering og treningsplan)
      trenger vi ditt samtykke som foresatt.
    </p>
    <p style="margin:0 0 16px 0;">
      På siden ser du nøyaktig hva du samtykker til. Det tar under ett minutt.
    </p>
    <p style="margin:0 0 8px 0;">${primaryButton("Gi lydsamtykke", input.consentUrl)}</p>
    <p style="margin:0 0 16px 0;font-size:13px;color:#5E5C57;">
      Lenken er gyldig i ${LYD_SAMTYKKE_TOKEN_TTL_DAGER} dager. Du kan trekke samtykket
      senere via treneren.
    </p>
    <p style="margin:0;font-size:12px;color:#5E5C57;">
      Fikk du e-posten ved en feil? Ignorer den — ingen handling kreves.
    </p>
  `;

  return {
    subject,
    preheader,
    html: emailLayout({
      preheader,
      heading: "Samtykke til lydopptak",
      body,
    }),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
