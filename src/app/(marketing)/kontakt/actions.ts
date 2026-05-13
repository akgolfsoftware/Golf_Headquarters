"use server";

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

async function sendEpost(input: KontaktInput) {
  // Resend-integrasjon kommer i M16. Inntil videre logges meldingen
  // til server-konsoll og en e-post kan sendes manuelt fra inboxen.
  // eslint-disable-next-line no-console
  console.log("[kontakt] ny henvendelse", {
    fra: `${input.navn} <${input.epost}>`,
    tema: input.tema,
    telefon: input.telefon ?? "—",
    melding: input.melding,
    tidspunkt: new Date().toISOString(),
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
    // eslint-disable-next-line no-console
    console.error("[kontakt] feilet", err);
    return {
      status: "feil",
      melding: "Noe gikk galt. Prøv igjen, eller send e-post til post@akgolf.no.",
    };
  }
}
