"use server";

import { resendKlient, FRA_EPOST } from "@/lib/email";

export type KontaktFormState =
  | { status: "idle" }
  | { status: "ok"; melding: string }
  | { status: "feil"; melding: string };

type KontaktInput = {
  navn: string;
  epost: string;
  telefon?: string;
  tema: string;
  melding: string;
};

const KONTAKT_MOTTAKER =
  process.env.KONTAKT_MOTTAKER_EPOST ?? "post@akgolf.no";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEpost(input: KontaktInput) {
  // Send via Resend i stedet for å logge brukerdata (PII) til server-
  // logs. Hvis Resend-konfigurasjon mangler kaster resendKlient(), og
  // brukeren får tilbakemelding om å e-poste manuelt.
  const klient = resendKlient();
  const html = `<!doctype html>
<html lang="nb">
<body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 24px auto; color: #0A1F17;">
  <h2 style="margin: 0 0 12px;">Ny henvendelse via kontaktskjema</h2>
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">
    <tr><td style="padding: 4px 8px; color: #5E5C57;">Navn</td><td style="padding: 4px 8px;">${escapeHtml(input.navn)}</td></tr>
    <tr><td style="padding: 4px 8px; color: #5E5C57;">E-post</td><td style="padding: 4px 8px;">${escapeHtml(input.epost)}</td></tr>
    <tr><td style="padding: 4px 8px; color: #5E5C57;">Telefon</td><td style="padding: 4px 8px;">${escapeHtml(input.telefon ?? "—")}</td></tr>
    <tr><td style="padding: 4px 8px; color: #5E5C57;">Tema</td><td style="padding: 4px 8px;">${escapeHtml(input.tema)}</td></tr>
  </table>
  <h3 style="margin: 16px 0 8px; font-size: 14px;">Melding</h3>
  <div style="white-space: pre-wrap; padding: 12px; background: #F1EEE5; border-radius: 8px;">${escapeHtml(input.melding)}</div>
</body>
</html>`;

  await klient.emails.send({
    from: FRA_EPOST,
    to: KONTAKT_MOTTAKER,
    replyTo: input.epost,
    subject: `[Kontakt] ${input.tema} – ${input.navn}`,
    html,
  });
}

export async function sendKontaktMelding(
  _state: KontaktFormState,
  formData: FormData,
): Promise<KontaktFormState> {
  const navn = String(formData.get("navn") ?? "").trim();
  const epost = String(formData.get("epost") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const tema = String(formData.get("tema") ?? "").trim();
  const melding = String(formData.get("melding") ?? "").trim();

  if (!navn || !epost || !tema || !melding) {
    return {
      status: "feil",
      melding: "Fyll ut navn, e-post, tema og melding.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost)) {
    return { status: "feil", melding: "Ugyldig e-postadresse." };
  }

  try {
    await sendEpost({
      navn,
      epost,
      telefon: telefon || undefined,
      tema,
      melding,
    });
    return {
      status: "ok",
      melding:
        "Takk for henvendelsen. Vi svarer som regel innen 1 virkedag.",
    };
  } catch (err) {
    // Logg kun feilmelding/stack — IKKE brukerdata. Resend-feil eller
    // konfig-feil må fanges opp i logs uten PII-lekkasje.
    console.error(
      "[kontakt] e-postutsending feilet:",
      err instanceof Error ? err.message : String(err),
    );
    return {
      status: "feil",
      melding:
        "Noe gikk galt. Prøv igjen, eller send e-post til post@akgolf.no.",
    };
  }
}
