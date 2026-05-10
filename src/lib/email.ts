// Resend-klient for transactional e-post.

import { Resend } from "resend";

let _klient: Resend | null = null;

export function resendKlient(): Resend {
  if (_klient) return _klient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY mangler");
  _klient = new Resend(apiKey);
  return _klient;
}

export const FRA_EPOST = process.env.RESEND_FROM_EMAIL ?? "AK Golf <hei@akgolf.no>";

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
      ? "<p>Tusen takk for at du lastet ned AK Golf Pyramide-guiden. Den ligger vedlagt nederst i denne e-posten.</p>"
      : "<p>Tusen takk for at du meldte deg på nyhetsbrevet vårt.</p>";

  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 12px;">Hei ${navn} —</h1>
  ${intro}
  <p>I løpet av de neste 14 dagene får du noen e-poster med konkrete tips:</p>
  <ul style="line-height: 1.8;">
    <li>Hvordan pyramide-systemet bygger balansert utvikling</li>
    <li>Strokes Gained — slik leser du tallene dine</li>
    <li>Hvordan AI-coachen vår fungerer</li>
    <li>Slik bygger du den første treningsplanen din</li>
  </ul>
  <p style="margin-top: 24px;">Vil du komme i gang nå? Lag konto gratis:</p>
  <p>
    <a
      href="https://akgolf.no/auth/signup"
      style="display: inline-block; padding: 12px 24px; background: #005840; color: #D1F843; text-decoration: none; border-radius: 6px; font-weight: 600;"
    >
      Start prøveperioden →
    </a>
  </p>
  <p style="margin-top: 32px; color: #5E5C57; font-size: 12px;">
    Du kan melde deg av når som helst —
    <a href="https://akgolf.no/avmeld" style="color: #5E5C57;">avmeld her</a>.
  </p>
</body>
</html>`;
}
