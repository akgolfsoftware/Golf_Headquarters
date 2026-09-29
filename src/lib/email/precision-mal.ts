/**
 * E-postskall for Precision Athletics (fasit: Claude Design 7d7c2994,
 * ui_kits/epost/emails.js, runde 16). Delt av alle bookinge-postene EP-01 til EP-04.
 *
 * E-postprogrammer støtter ikke CSS-variabler, så fargene er skrevet rett inn.
 * Verdiene er kopiert fra designets tokens/colors.css (bevisst unntak fra token-regelen).
 * Ren modul uten Prisma, så den kan enhetstestes.
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

export const EPOST_NATT = {
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

export type EpostFarger = { [K in keyof typeof EPOST_LYS]: string };

export const EPOST_AVSENDER = "AK Golf Academy";
export const EPOST_ADRESSE = "Bossumveien 6, 1605 Fredrikstad";

const FONT =
  "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function kr(v: number): string {
  return `${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
}

export function avsnitt(c: EpostFarger, html: string): string {
  return `<tr><td class="b" style="font:400 16px/1.55 ${FONT};color:${c.body};padding:0 0 14px">${html}</td></tr>`;
}

export type KvRad = { label: string; html: string; mono?: boolean };

/** Rader er ferdig escapet HTML i `html`. */
export function kvTabell(c: EpostFarger, rader: KvRad[]): string {
  const celler = rader
    .map(
      (r) =>
        `<tr><td class="m" style="font:400 14px/1.4 ${FONT};color:${c.muted};padding:9px 12px 9px 0;border-top:1px solid ${c.line};width:38%;vertical-align:top">${esc(r.label)}</td><td class="t" style="font:${r.mono ? `500 14px/1.4 ${MONO}` : `500 15px/1.4 ${FONT}`};color:${c.text};padding:9px 0;border-top:1px solid ${c.line};vertical-align:top;word-break:break-word">${r.html}</td></tr>`,
    )
    .join("");
  return `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${celler}</table></td></tr>`;
}

export function boks(c: EpostFarger, overskrift: string, html: string): string {
  return `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${c.flat};border:1px solid ${c.line};border-radius:8px;padding:16px"><div class="t" style="font:600 12px/1 ${MONO};letter-spacing:.08em;color:${c.text};text-transform:uppercase;padding-bottom:8px">${esc(overskrift)}</div><div class="b" style="font:400 15px/1.55 ${FONT};color:${c.body}">${html}</div></td></tr></table></td></tr>`;
}

export type EpostSkallInput = {
  tittel: string;
  forhandsvisning: string;
  /** Ferdig HTML fra avsnitt/kvTabell/boks, bygget med skallets palett. */
  innhold: (c: EpostFarger) => string;
  knapp?: { tekst: string; href: string };
  sekundaere?: { tekst: string; href: string }[];
  bunntekst?: string;
  natt?: boolean;
};

export function epostSkall(input: EpostSkallInput): string {
  const natt = input.natt === true;
  const c: EpostFarger = natt ? EPOST_NATT : EPOST_LYS;
  const knapp = input.knapp
    ? `<tr><td style="padding:8px 0 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:8px;background:${c.btn}"><a href="${esc(input.knapp.href)}" style="display:inline-block;padding:14px 22px;font:600 16px/1 ${FONT};color:${c.btnText};text-decoration:none;border-radius:8px">${esc(input.knapp.tekst)}</a></td></tr></table></td></tr>`
    : "";
  const sek =
    input.sekundaere && input.sekundaere.length > 0
      ? `<tr><td style="padding:12px 0 0;font:400 15px/1.5 ${FONT}">${input.sekundaere
          .map((s) => `<a href="${esc(s.href)}" style="color:${c.link};text-decoration:underline">${esc(s.tekst)}</a>`)
          .join(" &nbsp;·&nbsp; ")}</td></tr>`
      : "";
  const nattRegler = natt
    ? ""
    : `@media (prefers-color-scheme:dark){body,.bg{background:${EPOST_NATT.page}!important}.card{background:${EPOST_NATT.card}!important;border-color:${EPOST_NATT.line}!important}.t{color:${EPOST_NATT.text}!important}.b{color:${EPOST_NATT.body}!important}.m{color:${EPOST_NATT.muted}!important}}`;
  return `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(input.tittel)}</title>
<style>body{margin:0;padding:0;-webkit-text-size-adjust:100%}table{border-collapse:collapse}a{color:${c.link}}@media (max-width:620px){.wrap{width:100%!important}.pad{padding:20px 16px!important}}${nattRegler}</style></head>
<body class="bg" style="margin:0;padding:0;background:${c.page}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(input.forhandsvisning)}</div>
<main><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:${c.page}"><tr><td align="center" style="padding:24px 8px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">
<tr><td style="padding:0 8px 12px;font:600 15px/1 ${FONT};letter-spacing:.02em;color:${c.text}" class="t">${EPOST_AVSENDER}</td></tr>
<tr><td class="card pad" style="background:${c.card};border:1px solid ${c.line};border-radius:8px;padding:28px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font:600 24px/1.25 ${FONT};color:${c.text};padding:0 0 12px" class="t">${esc(input.tittel)}</td></tr>
${input.innhold(c)}${knapp}${sek}</table></td></tr>
<tr><td style="padding:16px 8px 0;font:400 13px/1.5 ${FONT};color:${c.muted}" class="m">${input.bunntekst ?? ""}${EPOST_AVSENDER} · ${EPOST_ADRESSE}</td></tr>
</table></td></tr></table></main></body></html>`;
}
