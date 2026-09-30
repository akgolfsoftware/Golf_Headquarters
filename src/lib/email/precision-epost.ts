/**
 * Bookinge-postene i Precision Athletics (Claude Design 7d7c2994, ui_kits/epost/emails.js).
 *
 * Felles skall og byggeklosser for EP-01 til EP-04. Rene funksjoner, ingen
 * server-avhengigheter, så de kan testes uten database.
 *
 * Bevisst unntak fra token-regelen: e-postprogrammer støtter ikke CSS-variabler,
 * så fargene står rett inn. Verdiene er kopiert fra tegningens `LIGHT`/`DARK`
 * (tokens/colors.css). Endres tegningen, endres de her.
 */

export const EPOST_LYS = {
  page: "#e6e3dd",
  card: "#ffffff",
  flat: "#faf8f3",
  text: "#141413",
  body: "#2a2926",
  muted: "#686560",
  line: "#ddd9d1",
  btn: "#141413",
  btnText: "#ffffff",
  link: "#1d3557",
} as const;

export const EPOST_MORK = {
  page: "#0c0d0c",
  card: "#1b1c1a",
  flat: "#141513",
  text: "#faf8f3",
  body: "#cfcbc2",
  muted: "#a9a59d",
  line: "#2f302c",
  btn: "#faf8f3",
  btnText: "#141413",
  link: "#faf8f3",
} as const;

type Farger = { [K in keyof typeof EPOST_LYS]: string };

const FONT = "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export const AVSENDER = "AK Golf Academy";
export const ADRESSE = "Bossumveien 6, 1605 Fredrikstad";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Beløp i hele kroner med hardt mellomrom som tusenskille, som i tegningen. */
export function kr(kroner: number): string {
  return `${String(kroner).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
}

export type EpostSkall = {
  /** Skjult forhåndsvisningstekst i innboksen. */
  pre: string;
  title: string;
  /** Ferdig HTML: rader laget med `avsnitt`, `faktaRader`, `boks`. */
  body: string;
  button?: readonly [label: string, href: string];
  secondary?: ReadonlyArray<readonly [label: string, href: string]>;
  dark?: boolean;
};

export function avsnitt(html: string, c: Farger = EPOST_LYS): string {
  return `<tr><td class="b" style="font:400 16px/1.55 ${FONT};color:${c.body};padding:0 0 14px">${html}</td></tr>`;
}

export type FaktaRad = readonly [label: string, htmlVerdi: string, mono?: boolean];

export function faktaRader(rader: readonly FaktaRad[], c: Farger = EPOST_LYS): string {
  const celler = rader
    .map(([k, v, mono]) => {
      const verdiFont = mono ? `500 14px/1.4 ${MONO}` : `500 15px/1.4 ${FONT}`;
      return `<tr><td class="m" style="font:400 14px/1.4 ${FONT};color:${c.muted};padding:9px 12px 9px 0;border-top:1px solid ${c.line};width:38%;vertical-align:top">${esc(k)}</td><td class="t" style="font:${verdiFont};color:${c.text};padding:9px 0;border-top:1px solid ${c.line};vertical-align:top;word-break:break-word">${v}</td></tr>`;
    })
    .join("");
  return `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${celler}</table></td></tr>`;
}

export function boks(head: string, html: string, c: Farger = EPOST_LYS): string {
  return `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="flat" style="background:${c.flat};border:1px solid ${c.line};border-radius:8px;padding:16px"><div class="t" style="font:600 12px/1 ${MONO};letter-spacing:.08em;color:${c.text};text-transform:uppercase;padding-bottom:8px">${esc(head)}</div><div class="b" style="font:400 15px/1.55 ${FONT};color:${c.body}">${html}</div></td></tr></table></td></tr>`;
}

/** Skallet rundt alle bookinge-postene. Lys som standard; mørk følger `prefers-color-scheme`. */
export function epostSkall(input: EpostSkall): string {
  const dark = input.dark ?? false;
  const c: Farger = dark ? EPOST_MORK : EPOST_LYS;
  const knapp = input.button
    ? `<tr><td style="padding:8px 0 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="btn" style="border-radius:8px;background:${c.btn}"><a class="btna" href="${esc(input.button[1])}" style="display:inline-block;padding:14px 22px;font:600 16px/1 ${FONT};color:${c.btnText};text-decoration:none;border-radius:8px">${esc(input.button[0])}</a></td></tr></table></td></tr>`
    : "";
  const sekundaer = input.secondary?.length
    ? `<tr><td style="padding:12px 0 0;font:400 15px/1.5 ${FONT}">${input.secondary
        .map(([l, h]) => `<a class="lnk" href="${esc(h)}" style="color:${c.link};text-decoration:underline">${esc(l)}</a>`)
        .join(" &nbsp;·&nbsp; ")}</td></tr>`
    : "";
  const mork = dark
    ? ""
    : `@media (prefers-color-scheme:dark){body,.bg{background:${EPOST_MORK.page}!important}.card{background:${EPOST_MORK.card}!important;border-color:${EPOST_MORK.line}!important}.t{color:${EPOST_MORK.text}!important}.b{color:${EPOST_MORK.body}!important}.m{color:${EPOST_MORK.muted}!important}.flat{background:${EPOST_MORK.flat}!important;border-color:${EPOST_MORK.line}!important}a.lnk{color:${EPOST_MORK.link}!important}.btn{background:${EPOST_MORK.btn}!important}a.btna{color:${EPOST_MORK.btnText}!important}}`;
  return `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(input.title)}</title>
<style>body{margin:0;padding:0;-webkit-text-size-adjust:100%}table{border-collapse:collapse}a{color:${c.link}}@media (max-width:620px){.wrap{width:100%!important}.pad{padding:20px 16px!important}}${mork}</style></head>
<body class="bg" style="margin:0;padding:0;background:${c.page}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(input.pre)}</div>
<main><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:${c.page}"><tr><td align="center" style="padding:24px 8px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">
<tr><td style="padding:0 8px 12px;font:600 15px/1 ${FONT};letter-spacing:.02em;color:${c.text}" class="t">${esc(AVSENDER)}</td></tr>
<tr><td class="card pad" style="background:${c.card};border:1px solid ${c.line};border-radius:8px;padding:28px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font:600 24px/1.25 ${FONT};color:${c.text};padding:0 0 12px" class="t">${esc(input.title)}</td></tr>
${input.body}${knapp}${sekundaer}</table></td></tr>
<tr><td style="padding:16px 8px 0;font:400 13px/1.5 ${FONT};color:${c.muted}" class="m">${esc(AVSENDER)} · ${esc(ADRESSE)}</td></tr>
</table></td></tr></table></main></body></html>`;
}
