// Resend-klient for transactional e-post.

import { Resend } from "resend";
import { emailLayout, primaryButton } from "@/lib/email/templates/shared";

let _klient: Resend | null = null;

export function resendKlient(): Resend {
  if (_klient) return _klient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY mangler");
  _klient = new Resend(apiKey);
  return _klient;
}

export const FRA_EPOST = process.env.RESEND_FROM_EMAIL ?? "AK Golf <post@akgolf.no>";

export type LeadEpostInput = {
  email: string;
  name?: string;
  source: string;
};

export async function sendVelkomstEpost(input: LeadEpostInput): Promise<void> {
  const klient = resendKlient();
  const navn = input.name?.trim() ?? "der";
  const subject =
    input.source === "guide-download"
      ? "Her er guiden — og noen råd til veien videre"
      : "Velkommen til AK Golf";

  await klient.emails.send({
    from: FRA_EPOST,
    to: input.email,
    subject,
    html: bygVelkomstHtml(navn, input.source),
  });
}

function bygVelkomstHtml(navn: string, source: string): string {
  const intro =
    source === "guide-download"
      ? "Tusen takk for at du lastet ned AK Golf Pyramide-guiden. Den ligger vedlagt nederst i denne e-posten."
      : "Tusen takk for at du meldte deg på nyhetsbrevet vårt.";

  const body = `
    <p style="margin:0 0 16px 0;">${intro}</p>
    <p style="margin:0 0 8px 0;">I løpet av de neste 14 dagene får du noen e-poster med konkrete tips:</p>
    <ul style="margin:0 0 24px 0;padding-left:20px;line-height:1.8;">
      <li>Hvordan pyramide-systemet bygger balansert utvikling</li>
      <li>Strokes Gained — slik leser du tallene dine</li>
      <li>Hvordan AI-coachen vår fungerer</li>
      <li>Slik bygger du den første treningsplanen din</li>
    </ul>
    <p style="margin:0 0 8px 0;">Vil du komme i gang nå? Lag konto gratis:</p>
    <p style="margin:0 0 24px 0;">${primaryButton("Start prøveperioden →", "https://akgolf.no/auth/signup")}</p>
    <p style="margin:0;font-size:12px;color:#5E5C57;">
      Du kan melde deg av når som helst — <a href="https://akgolf.no/avmeld" style="color:#5E5C57;">avmeld her</a>.
    </p>
  `;

  return emailLayout({
    preheader: intro,
    heading: `Hei ${navn} —`,
    body,
  });
}
