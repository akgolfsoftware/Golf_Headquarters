/**
 * EP-03 «Påminnelse dagen før» i Precision Athletics.
 *
 * Fasit: Claude Design «AK Golf Precision Athletics» (7d7c2994), ui_kits/epost/emails.js, TPL["EP-03"].
 * E-postprogrammer støtter ikke CSS-variabler, så fargene er skrevet rett inn med
 * verdiene fra designets tokens/colors.css (bevisst unntak, se designets readme «E-post»).
 * Lys mal er standard; mørk mal følger prefers-color-scheme i programmer som støtter det.
 *
 * Ren funksjon uten Prisma. Manglende verdi vises som «—», aldri gjetning.
 */
import { escapeHtml as esc } from "./shared";

const LYS = {
  page: "#e6e3dd", card: "#ffffff", text: "#141413", body: "#2a2926",
  muted: "#686560", line: "#ddd9d1", btn: "#141413", btnText: "#ffffff", link: "#1d3557",
} as const;
const MORK = {
  page: "#0c0d0c", card: "#1b1c1a", text: "#faf8f3", body: "#cfcbc2",
  muted: "#a9a59d", line: "#2f302c", btn: "#faf8f3", btnText: "#141413", link: "#faf8f3",
} as const;
type Farger = { [K in keyof typeof LYS]: string };

const FONT = "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export const AVSENDER = "AK Golf Academy";
export const ADRESSE = "Bossumveien 6, 1605 Fredrikstad";

export type PaaminnelseData = {
  /** «app» = har PlayerHQ-konto, «gjest» = booket uten konto. */
  mottaker: "gjest" | "app";
  fornavn: string;
  tjeneste: string;
  /** Varighet i minutter; null vises uten «min». */
  varighetMin: number | null;
  /** «Tirsdag 29.09.2026» */
  dag: string;
  /** «17:00» */
  start: string;
  /** «17:00–18:00» */
  klokke: string;
  sted: string;
  /** Fullt navn; null vises som «—». */
  coach: string | null;
  /** «950 kr», eller «Inkludert i abonnement». */
  pris: string;
  /** Betalingsreferanse (mono) eller klipptekst; null vises som «—». */
  betaling: { tekst: string | null; mono: boolean };
  referanse: string;
  /** «mandag 28.09.2026 kl. 17:00» */
  frist: string;
  /** true når fristen for gratis avbestilling er passert (normalt tilfelle dagen før). */
  fristPassert: boolean;
  lenker: { veibeskrivelse: string; bookingIApp: string; endre: string };
};

const avsnitt = (c: Farger, t: string) =>
  `<tr><td class="b" style="font:400 16px/1.55 ${FONT};color:${c.body};padding:0 0 14px">${t}</td></tr>`;

function rader(c: Farger, r: Array<[string, string, boolean?]>): string {
  const celler = r
    .map(([k, v, mono]) => {
      const font = mono ? `500 14px/1.4 ${MONO}` : `500 15px/1.4 ${FONT}`;
      return `<tr><td class="m" style="font:400 14px/1.4 ${FONT};color:${c.muted};padding:9px 12px 9px 0;border-top:1px solid ${c.line};width:38%;vertical-align:top">${esc(k)}</td><td class="t" style="font:${font};color:${c.text};padding:9px 0;border-top:1px solid ${c.line};vertical-align:top;word-break:break-word">${v}</td></tr>`;
    })
    .join("");
  return `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${celler}</table></td></tr>`;
}

const lenke = (c: Farger, tekst: string, href: string) =>
  `<a class="lk" href="${esc(href)}" style="color:${c.link};text-decoration:underline">${esc(tekst)}</a>`;

function skall(c: Farger, d: PaaminnelseData): { subject: string; html: string } {
  const tittel = "Vi ses i morgen";
  const coachFornavn = d.coach ? d.coach.split(" ")[0] : null;
  const subject = `I morgen kl. ${d.start}: ${d.tjeneste.toLowerCase()}${coachFornavn ? ` med ${coachFornavn}` : ""}`;
  const app = d.mottaker === "app";
  const sekundaer = app
    ? [lenke(c, "Se bookingen i PlayerHQ", d.lenker.bookingIApp)]
    : [lenke(c, "Se bestillingen din", d.lenker.endre)];

  const kropp =
    avsnitt(c, `Hei ${esc(d.fornavn || "der")}. Her er timen din i morgen. Ta med egne køller og møt fem minutter før.`) +
    rader(c, [
      ["Tjeneste", esc(d.varighetMin ? `${d.tjeneste} ${d.varighetMin} min` : d.tjeneste)],
      ["Tid", `${esc(d.dag)} kl. ${esc(d.klokke)}`],
      ["Sted", esc(d.sted)],
      ["Coach", esc(d.coach ?? "—")],
      ["Pris", esc(d.pris)],
      ["Betaling", esc(d.betaling.tekst ?? "—"), d.betaling.mono && d.betaling.tekst !== null],
      ["Referanse", esc(d.referanse), true],
    ]) +
    (d.fristPassert
      ? avsnitt(c, "Gratis avbestilling er ikke lenger mulig. Kan du ikke komme, gi beskjed så fort du kan.")
      : avsnitt(c, `Gratis avbestilling til <b>${esc(d.frist)}</b>. Etter det belastes full pris.`));

  const knapp = `<tr><td style="padding:8px 0 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="btnbg" style="border-radius:8px;background:${c.btn}"><a class="btna" href="${esc(d.lenker.veibeskrivelse)}" style="display:inline-block;padding:14px 22px;font:600 16px/1 ${FONT};color:${c.btnText};text-decoration:none;border-radius:8px">Se veibeskrivelse</a></td></tr></table></td></tr>`;
  const sek = `<tr><td style="padding:12px 0 0;font:400 15px/1.5 ${FONT}">${sekundaer.join(" &nbsp;·&nbsp; ")}</td></tr>`;

  const html = `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(tittel)}</title>
<style>body{margin:0;padding:0;-webkit-text-size-adjust:100%}table{border-collapse:collapse}@media (max-width:620px){.wrap{width:100%!important}.pad{padding:20px 16px!important}}@media (prefers-color-scheme:dark){body,.bg{background:${MORK.page}!important}.card{background:${MORK.card}!important;border-color:${MORK.line}!important}.t{color:${MORK.text}!important}.b{color:${MORK.body}!important}.m{color:${MORK.muted}!important}.lk{color:${MORK.link}!important}.btnbg{background:${MORK.btn}!important}.btna{color:${MORK.btnText}!important}}</style></head>
<body class="bg" style="margin:0;padding:0;background:${c.page}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">Påminnelse om timen i morgen.</div>
<main><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:${c.page}"><tr><td align="center" style="padding:24px 8px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">
<tr><td class="t" style="padding:0 8px 12px;font:600 15px/1 ${FONT};letter-spacing:.02em;color:${c.text}">${esc(AVSENDER)}</td></tr>
<tr><td class="card pad" style="background:${c.card};border:1px solid ${c.line};border-radius:8px;padding:28px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="t" style="font:600 24px/1.25 ${FONT};color:${c.text};padding:0 0 12px">${esc(tittel)}</td></tr>
${kropp}${knapp}${sek}</table></td></tr>
<tr><td class="m" style="padding:16px 8px 0;font:400 13px/1.5 ${FONT};color:${c.muted}">${esc(AVSENDER)} · ${esc(ADRESSE)}</td></tr>
</table></td></tr></table></main></body></html>`;
  return { subject, html };
}

/** Bygger emne og HTML for EP-03. `mork` tvinger mørk mal (brukes av skjermprøven). */
export function byggPaaminnelse(d: PaaminnelseData, opts: { mork?: boolean } = {}) {
  return skall(opts.mork ? MORK : LYS, d);
}

/** «950 kr» med hardt mellomrom som tusenskille. */
export function formaterKr(ore: number): string {
  const kr = Math.round(ore / 100);
  return `${String(kr).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")}\u00a0kr`;
}
