/**
 * Bookinge-postene EP-01 til EP-04 i Precision Athletics.
 *
 * Fasit: Claude Design «AK Golf Precision Athletics» (7d7c2994), ui_kits/epost/emails.js.
 * E-postprogrammer støtter ikke CSS-variabler, så fargene er skrevet rett inn med
 * verdiene fra designets tokens/colors.css (bevisst unntak, se designets readme «E-post»).
 * Lys mal er standard; mørk mal følger prefers-color-scheme i programmer som støtter det.
 *
 * Ren funksjon uten Prisma: kalleren (booking-emails.ts) henter og formaterer dataene.
 * Manglende verdi vises som «—», aldri gjetning.
 */
import { escapeHtml as esc } from "./shared";

export type BookingEpostType = "bekreftelse" | "endret" | "paaminnelse" | "avbestilt";
export type BookingEpostMottaker = "gjest" | "app";

const LYS = {
  page: "#e6e3dd", card: "#ffffff", flat: "#faf8f3", text: "#141413", body: "#2a2926",
  muted: "#686560", line: "#ddd9d1", btn: "#141413", btnText: "#ffffff", link: "#1d3557",
} as const;
const MORK = {
  page: "#0c0d0c", card: "#1b1c1a", flat: "#141513", text: "#faf8f3", body: "#cfcbc2",
  muted: "#a9a59d", line: "#2f302c", btn: "#faf8f3", btnText: "#141413", link: "#faf8f3",
} as const;
type Farger = { [K in keyof typeof LYS]: string };

const FONT = "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export const AVSENDER = "AK Golf Academy";
export const ADRESSE = "Bossumveien 6, 1605 Fredrikstad";

export type BookingEpostData = {
  type: BookingEpostType;
  mottaker: BookingEpostMottaker;
  fornavn: string;
  tjeneste: string;
  /** «Tirsdag 29. september 2026» */
  dag: string;
  /** «17:00–18:00» */
  klokke: string;
  /** Kun EP-02: tiden før flyttingen. */
  gammelTid?: { dag: string; klokke: string };
  sted: string;
  coach: string | null;
  /** «950 kr», eller «Inkludert i abonnement» for klippbookinger. */
  pris: string;
  /** Betalingsreferanse (mono) eller klipptekst; null vises som «—». */
  betaling: { tekst: string | null; mono: boolean };
  referanse: string;
  /** «mandag 28. september 2026 kl. 17:00» */
  frist: string;
  /** EP-03: true når fristen for gratis avbestilling er passert. */
  fristPassert?: boolean;
  /** EP-04 */
  avbestiltTidspunkt?: string;
  refusjon?: string;
  lenker: {
    kalender: string;
    bookingIApp: string;
    endre: string;
    veibeskrivelse: string;
    nyBooking: string;
    playerhq: string;
    opprettKonto: string;
  };
};

export type BookingEpost = { subject: string; html: string };

function kv(c: Farger, rader: Array<[string, string, boolean?]>): string {
  const celler = rader
    .map(([k, v, mono]) => {
      const font = mono ? `500 14px/1.4 ${MONO}` : `500 15px/1.4 ${FONT}`;
      return `<tr><td class="m" style="font:400 14px/1.4 ${FONT};color:${c.muted};padding:9px 12px 9px 0;border-top:1px solid ${c.line};width:38%;vertical-align:top">${esc(k)}</td><td class="t" style="font:${font};color:${c.text};padding:9px 0;border-top:1px solid ${c.line};vertical-align:top;word-break:break-word">${v}</td></tr>`;
    })
    .join("");
  return `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${celler}</table></td></tr>`;
}

const avsnitt = (c: Farger, t: string) =>
  `<tr><td class="b" style="font:400 16px/1.55 ${FONT};color:${c.body};padding:0 0 14px">${t}</td></tr>`;

const boks = (c: Farger, hode: string, t: string) =>
  `<tr><td style="padding:4px 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="flat" style="background:${c.flat};border:1px solid ${c.line};border-radius:8px;padding:16px"><div class="t" style="font:600 12px/1 ${MONO};letter-spacing:.08em;color:${c.text};text-transform:uppercase;padding-bottom:8px">${esc(hode)}</div><div class="b" style="font:400 15px/1.55 ${FONT};color:${c.body}">${t}</div></td></tr></table></td></tr>`;

const lenke = (c: Farger, tekst: string, href: string) =>
  `<a class="lk" href="${esc(href)}" style="color:${c.link};text-decoration:underline">${esc(tekst)}</a>`;

function playerhqTilbud(c: Farger, d: BookingEpostData): string {
  return boks(
    c,
    "Fortsett i PlayerHQ",
    `Med konto får du plan fra coachen, økter, tester og analyse av rundene dine. ${lenke(c, "Opprett konto i PlayerHQ", d.lenker.opprettKonto)}<br><span style="font-size:14px">Bookingene dine følger med inn i kontoen.</span>`,
  );
}

function bookingRader(c: Farger, d: BookingEpostData): string {
  const naa = `${esc(d.dag)} kl. ${esc(d.klokke)}`;
  const tid = d.gammelTid
    ? `<s class="m" style="color:${c.muted}">${esc(d.gammelTid.dag)} kl. ${esc(d.gammelTid.klokke)}</s><br><b>${naa}</b>`
    : naa;
  return kv(c, [
    ["Tjeneste", esc(d.tjeneste)],
    ["Tid", tid],
    ["Sted", esc(d.sted)],
    ["Coach", esc(d.coach ?? "—")],
    ["Pris", esc(d.pris)],
    ["Betaling", esc(d.betaling.tekst ?? "—"), d.betaling.mono && d.betaling.tekst !== null],
    ["Referanse", esc(d.referanse), true],
  ]);
}

const avbestillingstekst = (c: Farger, d: BookingEpostData) =>
  avsnitt(c, `Gratis avbestilling til <b>${esc(d.frist)}</b>. Etter det belastes full pris.`);

type Innhold = {
  emne: string;
  forhaand: string;
  tittel: string;
  kropp: string;
  knapp: [string, string];
  sekundaer: Array<[string, string]>;
};

function innhold(c: Farger, d: BookingEpostData): Innhold {
  const hei = `Hei ${esc(d.fornavn)}.`;
  const app = d.mottaker === "app";
  const iApp: [string, string] = ["Se bookingen i PlayerHQ", d.lenker.bookingIApp];
  const endre: [string, string] = ["Endre eller avbestill", d.lenker.endre];
  const dagKlokke = `${d.dag.toLowerCase()} kl. ${d.klokke.split("–")[0]}`;
  const tjenesteSmaa = d.tjeneste.toLowerCase();
  switch (d.type) {
    case "bekreftelse":
      return {
        emne: `Bekreftet: ${tjenesteSmaa} ${dagKlokke}`,
        forhaand: "Timen er bekreftet. Legg den i kalenderen.",
        tittel: "Timen er bekreftet",
        kropp:
          avsnitt(c, `${hei} Vi gleder oss til å se deg.`) + bookingRader(c, d) + avbestillingstekst(c, d) +
          (app ? "" : playerhqTilbud(c, d)),
        knapp: ["Legg i kalender", d.lenker.kalender],
        sekundaer: app ? [iApp, endre] : [endre],
      };
    case "endret":
      return {
        emne: `Endret: ny tid ${dagKlokke}`,
        forhaand: `Timen er flyttet til ${dagKlokke}.`,
        tittel: "Timen er flyttet",
        kropp:
          avsnitt(c, `${hei} Timen din har fått ny tid.`) + bookingRader(c, d) + avbestillingstekst(c, d) +
          (app ? "" : playerhqTilbud(c, d)),
        knapp: ["Legg ny tid i kalender", d.lenker.kalender],
        sekundaer: app ? [iApp, endre] : [endre],
      };
    case "paaminnelse":
      return {
        emne: `I morgen kl. ${d.klokke.split("–")[0]}: ${tjenesteSmaa}${d.coach ? ` med ${d.coach.split(" ")[0]}` : ""}`,
        forhaand: "Påminnelse om timen i morgen.",
        tittel: "Vi ses i morgen",
        kropp:
          avsnitt(c, `${hei} Her er timen din i morgen. Ta med egne køller og møt fem minutter før.`) +
          bookingRader(c, d) +
          (d.fristPassert
            ? avsnitt(c, "Gratis avbestilling er ikke lenger mulig. Kan du ikke komme, gi beskjed så fort du kan.")
            : avbestillingstekst(c, d)),
        knapp: ["Se veibeskrivelse", d.lenker.veibeskrivelse],
        sekundaer: app ? [iApp] : [endre],
      };
    case "avbestilt":
      return {
        emne: `Avbestilt: ${tjenesteSmaa} ${d.dag.toLowerCase()}`,
        forhaand: "Timen er avbestilt.",
        tittel: "Timen er avbestilt",
        kropp:
          avsnitt(c, `${hei} Denne timen er avbestilt:`) +
          kv(c, [
            ["Tjeneste", esc(d.tjeneste)],
            ["Tid", `<s>${esc(d.dag)} kl. ${esc(d.klokke)}</s>`],
            ["Avbestilt", esc(d.avbestiltTidspunkt ?? "—")],
            ["Refusjon", esc(d.refusjon ?? "—")],
            ["Referanse", esc(d.referanse), true],
          ]),
        knapp: ["Book ny time", d.lenker.nyBooking],
        sekundaer: app ? [["Åpne PlayerHQ", d.lenker.playerhq]] : [],
      };
  }
}

function skall(c: Farger, i: Innhold): string {
  const knapp = `<tr><td style="padding:8px 0 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="btnbg" style="border-radius:8px;background:${c.btn}"><a class="btna" href="${esc(i.knapp[1])}" style="display:inline-block;padding:14px 22px;font:600 16px/1 ${FONT};color:${c.btnText};text-decoration:none;border-radius:8px">${esc(i.knapp[0])}</a></td></tr></table></td></tr>`;
  const sek = i.sekundaer.length
    ? `<tr><td style="padding:12px 0 0;font:400 15px/1.5 ${FONT}">${i.sekundaer.map(([l, h]) => lenke(c, l, h)).join(" &nbsp;·&nbsp; ")}</td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(i.tittel)}</title>
<style>body{margin:0;padding:0;-webkit-text-size-adjust:100%}table{border-collapse:collapse}@media (max-width:620px){.wrap{width:100%!important}.pad{padding:20px 16px!important}}@media (prefers-color-scheme:dark){body,.bg{background:${MORK.page}!important}.card{background:${MORK.card}!important;border-color:${MORK.line}!important}.flat{background:${MORK.flat}!important;border-color:${MORK.line}!important}.t{color:${MORK.text}!important}.b{color:${MORK.body}!important}.m{color:${MORK.muted}!important}.lk{color:${MORK.link}!important}.btnbg{background:${MORK.btn}!important}.btna{color:${MORK.btnText}!important}}</style></head>
<body class="bg" style="margin:0;padding:0;background:${c.page}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(i.forhaand)}</div>
<main><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:${c.page}"><tr><td align="center" style="padding:24px 8px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">
<tr><td class="t" style="padding:0 8px 12px;font:600 15px/1 ${FONT};letter-spacing:.02em;color:${c.text}">${esc(AVSENDER)}</td></tr>
<tr><td class="card pad" style="background:${c.card};border:1px solid ${c.line};border-radius:8px;padding:28px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="t" style="font:600 24px/1.25 ${FONT};color:${c.text};padding:0 0 12px">${esc(i.tittel)}</td></tr>
${i.kropp}${knapp}${sek}</table></td></tr>
<tr><td class="m" style="padding:16px 8px 0;font:400 13px/1.5 ${FONT};color:${c.muted}">${esc(AVSENDER)} · ${esc(ADRESSE)}</td></tr>
</table></td></tr></table></main></body></html>`;
}

/** Bygger emne og HTML. `mork` tvinger mørk mal (brukes av skjermprøven). */
export function byggBookingEpost(d: BookingEpostData, opts: { mork?: boolean } = {}): BookingEpost {
  const c: Farger = opts.mork ? MORK : LYS;
  const i = innhold(c, d);
  return { subject: i.emne, html: skall(c, i) };
}

/** «950 kr» med hardt mellomrom som tusenskille. */
export function formaterKr(ore: number): string {
  const kr = Math.round(ore / 100);
  return `${String(kr).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
}
