/**
 * EP-03 «Påminnelse dagen før» i Precision Athletics.
 * Fasit: Claude Design 7d7c2994, ui_kits/epost/emails.js, TPL["EP-03"].
 * Felles e-postskall; rene data inn, emne og HTML ut. Ingen utsending.
 */
import { avsnitt, epostSkall, esc, faktaRader, kr, EPOST_LYS, EPOST_MORK } from "../precision-epost";
export { AVSENDER, ADRESSE } from "../precision-epost";

export type PaaminnelseData = {
  mottaker: "gjest" | "app";
  fornavn: string;
  tjeneste: string;
  varighetMin: number | null;
  dag: string;
  start: string;
  klokke: string;
  sted: string;
  coach: string | null;
  pris: string;
  betaling: { tekst: string | null; mono: boolean };
  betalingstype: "gratis" | "klipp" | "betalt";
  referanse: string;
  frist: string;
  fristPassert: boolean;
  iMorgen: boolean;
  lenker: { veibeskrivelse: string; bookingIApp: string; endre: string };
};

export function byggPaaminnelse(d: PaaminnelseData, opts: { mork?: boolean } = {}) {
  const c = opts.mork ? EPOST_MORK : EPOST_LYS;
  const coachFornavn = d.coach?.split(" ")[0];
  const subject = `${d.iMorgen ? "I morgen" : d.dag} kl. ${d.start}: ${d.tjeneste.toLowerCase()}${coachFornavn ? ` med ${coachFornavn}` : ""}`;
  const fristTekst = d.betalingstype === "gratis"
    ? "Timen er gratis. Kan du ikke komme, gi beskjed så fort du kan."
    : d.betalingstype === "klipp"
      ? d.fristPassert
        ? "Ved avbestilling nå tilbakeføres ikke klippet. Kan du ikke komme, gi beskjed så fort du kan."
        : `Avbestill før <b>${esc(d.frist)}</b>, så legges klippet tilbake.`
      : d.fristPassert
        ? "Gratis avbestilling er ikke lenger mulig. Kan du ikke komme, gi beskjed så fort du kan."
        : `Gratis avbestilling før <b>${esc(d.frist)}</b>. Etter det refunderes ikke betalingen.`;
  const body = avsnitt(`Hei ${esc(d.fornavn || "der")}. ${d.iMorgen ? "Her er timen din i morgen." : "Her er en påminnelse om timen din."} Ta med egne køller og møt fem minutter før.`, c) + faktaRader([
    ["Tjeneste", esc(d.varighetMin ? `${d.tjeneste} ${d.varighetMin} min` : d.tjeneste)],
    ["Tid", esc(`${d.dag} kl. ${d.klokke}`)],
    ["Sted", esc(d.sted)],
    ["Coach", esc(d.coach ?? "—")],
    ["Pris", esc(d.pris)],
    ["Betaling", esc(d.betaling.tekst ?? "—"), d.betaling.mono && d.betaling.tekst !== null],
    ["Referanse", esc(d.referanse), true],
  ], c) + avsnitt(fristTekst, c);
  return { subject, html: epostSkall({
    pre: d.iMorgen ? "Påminnelse om timen i morgen." : "Påminnelse om timen din.",
    title: d.iMorgen ? "Vi ses i morgen" : "Påminnelse om timen",
    body, dark: opts.mork,
    button: ["Se veibeskrivelse", d.lenker.veibeskrivelse],
    secondary: d.mottaker === "app" ? [["Se bookingen i PlayerHQ", d.lenker.bookingIApp]] : [["Endre eller avbestill", d.lenker.endre]],
  }) };
}

/** Øre bevares med norsk komma og hardt mellomrom. */
export function formaterKr(ore: number): string { return kr(ore / 100); }
