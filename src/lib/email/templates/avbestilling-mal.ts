/**
 * EP-04 «Avbestilling» i Precision Athletics.
 *
 * Fasit: Claude Design «AK Golf Precision Athletics» (7d7c2994), ui_kits/epost/emails.js, TPL["EP-04"].
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

/** Hva som skjedde med betalingen ved avbestillingen. */
export type Refusjon =
  /** Penger tilbake til kortet. `belop` er ferdig formatert, f.eks. «950 kr». */
  | { type: "penger"; belop: string }
  /** Klipp fra abonnementet lagt tilbake. `igjen`/`av` vises bare når begge er kjent. */
  | { type: "klipp"; igjen: number | null; av: number | null }
  /** Avbestilt etter fristen: ingen refusjon. Bare når vi vet at fristen var overskredet. */
  | { type: "ingen" }
  /** Utfallet er ikke kjent (f.eks. gratis booking): vises som «—», aldri gjetning. */
  | { type: "ukjent" }
  /** Refusjonen feilet mot Stripe og behandles manuelt. */
  | { type: "feilet" };

export type AvbestillingData = {
  /** «app» = har PlayerHQ-konto, «gjest» = booket uten konto. */
  mottaker: "gjest" | "app";
  fornavn: string;
  /** «Privattime 60 min» */
  tjeneste: string;
  /** «Tirsdag 29.09.2026» */
  dag: string;
  /** «17:00–18:00» */
  klokke: string;
  /** «Mandag 28.09.2026 kl. 09:14» */
  avbestiltTidspunkt: string;
  refusjon: Refusjon;
  /** Bookingreferanse, eller refusjons-ID for gjest når den finnes; null vises som «—». */
  referanse: string | null;
  lenker: { bookNy: string; playerhq: string };
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

/** Teksten i raden «Refusjon». */
export function refusjonTekst(r: Refusjon): string {
  switch (r.type) {
    case "penger":
      return `${r.belop} til kortet du betalte med`;
    case "klipp":
      return r.igjen !== null && r.av !== null
        ? `Klippet er lagt tilbake · ${r.igjen} av ${r.av} igjen`
        : "Klippet er lagt tilbake";
    case "ingen":
      return "Ingen refusjon, timen ble avbestilt etter fristen";
    case "feilet":
      return "Kunne ikke behandles automatisk";
    case "ukjent":
      return "—";
  }
}

function skall(c: Farger, d: AvbestillingData): { subject: string; html: string } {
  const tittel = "Timen er avbestilt";
  const subject = `Avbestilt: ${d.tjeneste.replace(/\s+\d+\s*min$/i, "").toLowerCase()} ${d.dag.toLowerCase()}`;
  const app = d.mottaker === "app";

  const kropp =
    avsnitt(c, `Hei ${esc(d.fornavn || "der")}. Denne timen er avbestilt:`) +
    rader(c, [
      ["Tjeneste", esc(d.tjeneste)],
      ["Tid", `<s>${esc(d.dag)} kl. ${esc(d.klokke)}</s>`],
      ["Avbestilt", esc(d.avbestiltTidspunkt)],
      ["Refusjon", esc(refusjonTekst(d.refusjon))],
      ["Referanse", esc(d.referanse ?? "—"), d.referanse !== null],
    ]);

  const knapp = `<tr><td style="padding:8px 0 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="btnbg" style="border-radius:8px;background:${c.btn}"><a class="btna" href="${esc(d.lenker.bookNy)}" style="display:inline-block;padding:14px 22px;font:600 16px/1 ${FONT};color:${c.btnText};text-decoration:none;border-radius:8px">Book ny time</a></td></tr></table></td></tr>`;
  const sek = app
    ? `<tr><td style="padding:12px 0 0;font:400 15px/1.5 ${FONT}">${lenke(c, "Åpne PlayerHQ", d.lenker.playerhq)}</td></tr>`
    : "";

  const html = `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(tittel)}</title>
<style>body{margin:0;padding:0;-webkit-text-size-adjust:100%}table{border-collapse:collapse}@media (max-width:620px){.wrap{width:100%!important}.pad{padding:20px 16px!important}}@media (prefers-color-scheme:dark){body,.bg{background:${MORK.page}!important}.card{background:${MORK.card}!important;border-color:${MORK.line}!important}.t{color:${MORK.text}!important}.b{color:${MORK.body}!important}.m{color:${MORK.muted}!important}.lk{color:${MORK.link}!important}.btnbg{background:${MORK.btn}!important}.btna{color:${MORK.btnText}!important}}</style></head>
<body class="bg" style="margin:0;padding:0;background:${c.page}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">Timen er avbestilt.</div>
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

/** Bygger emne og HTML for EP-04. `mork` tvinger mørk mal (brukes av skjermprøven). */
export function byggAvbestilling(d: AvbestillingData, opts: { mork?: boolean } = {}) {
  return skall(opts.mork ? MORK : LYS, d);
}

/** «950 kr» med hardt mellomrom som tusenskille. */
export function formaterKr(ore: number): string {
  const kr = Math.round(ore / 100);
  return `${String(kr).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
}

const OSLO = "Europe/Oslo";

function delerOslo(d: Date): Record<string, string> {
  const deler = new Intl.DateTimeFormat("nb-NO", {
    timeZone: OSLO, weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  return Object.fromEntries(deler.map((p) => [p.type, p.value]));
}

const storForbokstav = (s: string) => s.replace(/^./, (t) => t.toUpperCase());

/** «Tirsdag 29.09.2026», alltid i Oslo-tid. */
export function osloDag(d: Date): string {
  const p = delerOslo(d);
  return storForbokstav(`${p.weekday} ${p.day}.${p.month}.${p.year}`);
}

/** «17:00», alltid i Oslo-tid. */
export function osloKlokke(d: Date): string {
  const p = delerOslo(d);
  return `${p.hour}:${p.minute}`;
}

/** «Mandag 28.09.2026 kl. 09:14», alltid i Oslo-tid. */
export function osloDagOgTid(d: Date): string {
  return `${osloDag(d)} kl. ${osloKlokke(d)}`;
}
