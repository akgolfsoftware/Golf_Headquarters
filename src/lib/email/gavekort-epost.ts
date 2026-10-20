/**
 * Gavekort-e-posten (bookingplanen steg 7) i Precision-malen (`precision-epost.ts`).
 * Ren bygger uten database og sending. Koden står i mono i en boks; resten er fakta og veien til booking.
 */
import { avsnitt, boks, epostSkall, esc, faktaRader, kr } from "@/lib/email/precision-epost";

export type GavekortEpostInput = {
  appUrl: string;
  /** Formatert kode, «AB12-CD34-EF56-GH78». */
  kode: string;
  belopOre: number;
  utloper: Date;
  /** Kjøperens navn, hvis oppgitt. */
  fra: string | null;
  /** Kjøperens hilsen, ren tekst. */
  melding: string | null;
  /** Mottakeren er en annen enn kjøperen. */
  tilAnnen: boolean;
};

const DATO = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });

export function byggGavekortEpost(input: GavekortEpostInput): { subject: string; html: string } {
  const belop = kr(input.belopOre / 100);
  const avsender = input.fra?.trim() || null;
  const innledning = input.tilAnnen
    ? `${avsender ? esc(avsender) : "Noen"} har gitt deg et gavekort fra AK Golf Academy til en verdi av <b>${esc(belop)}</b>. Det gjelder alle tjenester og alle coacher.`
    : `Her er gavekortet ditt fra AK Golf Academy til en verdi av <b>${esc(belop)}</b>. Det gjelder alle tjenester og alle coacher.`;
  const hilsen = input.melding?.trim()
    ? boks("Hilsen", esc(input.melding.trim()).replace(/\n/g, "<br>"))
    : "";
  const body =
    avsnitt(innledning) +
    hilsen +
    `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#141413" style="background:#141413;padding:20px;border-radius:12px;text-align:center"><p style="margin:0 0 6px;font:400 13px/1.4 'IBM Plex Sans',Arial,sans-serif;color:#BFBDB6">Gavekode</p><p style="margin:0;font:600 24px/1.2 'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px;color:#FFFFFF">${esc(input.kode)}</p></td></tr></table></td></tr>` +
    faktaRader([
      ["Verdi", esc(belop)],
      ["Gyldig til", esc(DATO.format(input.utloper))],
    ]) +
    avsnitt("Slik bruker du det: velg tid på nettsiden og skriv inn koden i betalingssteget. Er gavekortet mindre enn prisen, betaler du resten med kort. Det som er igjen på kortet, kan brukes neste gang.") +
    avsnitt("Oppbevar koden. Den kan ikke hentes fram igjen fra oss uten denne e-posten.");
  return {
    subject: input.tilAnnen ? "Du har fått et gavekort fra AK Golf Academy" : "Ditt gavekort fra AK Golf Academy",
    html: epostSkall({
      pre: `Gavekort til ${belop}`,
      title: "Gavekort",
      body,
      button: ["Book en time", `${input.appUrl}/booking`],
      fot: "Du får denne e-posten fordi et gavekort fra AK Golf Academy er kjøpt til deg.",
    }),
  };
}

/** Kort kvittering til kjøperen når gavekortet gikk til en annen. Ingen kode. */
export function byggGavekortKvittering(input: { belopOre: number; mottaker: string }): { subject: string; html: string } {
  const belop = kr(input.belopOre / 100);
  return {
    subject: "Gavekortet er sendt",
    html: epostSkall({
      pre: `Gavekort til ${belop} er sendt`,
      title: "Gavekortet er sendt",
      body: avsnitt(`Gavekortet til <b>${esc(belop)}</b> er sendt til ${esc(input.mottaker)}. Koden står bare i e-posten mottakeren fikk.`),
      fot: "Du får denne e-posten fordi du kjøpte et gavekort hos AK Golf Academy.",
    }),
  };
}
