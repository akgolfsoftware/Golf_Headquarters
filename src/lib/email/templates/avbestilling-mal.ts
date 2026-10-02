/**
 * EP-04 Avbestilling. Fasit: Claude Design 7d7c2994, ui_kits/epost/emails.js.
 * Bruker samme e-postskall som EP-01/02/03. Ingen utsending eller refusjon her.
 */
import { avsnitt, epostSkall, esc, faktaRader, kr, EPOST_LYS, EPOST_MORK } from "../precision-epost";
export { AVSENDER, ADRESSE } from "../precision-epost";

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
  | { type: "feilet" }
  | { type: "venter" }
  | { type: "gratis" };

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
  avbestiltTidspunkt: string | null;
  refusjon: Refusjon;
  /** Bookingreferanse, eller refusjons-ID for gjest når den finnes; null vises som «—». */
  referanse: string | null;
  lenker: { bookNy: string; playerhq: string };
};


export function refusjonTekst(r: Refusjon): string {
  switch (r.type) {
    case "penger": return `Refusjon er behandlet: ${r.belop} til kortet du betalte med.`;
    case "klipp":
      if (r.igjen === null) return "Klippet er lagt tilbake";
      return r.av !== null && r.igjen <= r.av
        ? `Klippet er lagt tilbake · ${r.igjen} av ${r.av} igjen`
        : `Klippet er lagt tilbake · ${r.igjen} klipp igjen`;
    case "ingen": return "Ingen refusjon, timen ble avbestilt etter avbestillingsfristen";
    case "feilet": return "Kunne ikke behandles automatisk. Vi følger opp tilbakeføringen.";
    case "venter": return "Refusjonen venter på behandling. Vi følger opp betalingen.";
    case "gratis": return "Timen var gratis. Ingen betaling å refundere.";
    case "ukjent": return "—";
  }
}

export function byggAvbestilling(d: AvbestillingData, opts: { mork?: boolean; introHtml?: string } = {}) {
  const c = opts.mork ? EPOST_MORK : EPOST_LYS;
  const subject = `Avbestilt: ${d.tjeneste.replace(/\s+\d+\s*min$/i, "").toLowerCase()} ${d.dag.toLowerCase()}`;
  const body = (opts.introHtml ?? avsnitt(`Hei ${esc(d.fornavn || "der")}. Denne timen er avbestilt:`, c)) + faktaRader([
    ["Tjeneste", esc(d.tjeneste)],
    ["Tid", `<s>${esc(d.dag)} kl. ${esc(d.klokke)}</s>`],
    ["Avbestilt", esc(d.avbestiltTidspunkt ?? "—")],
    ["Refusjon", esc(refusjonTekst(d.refusjon))],
    ["Referanse", esc(d.referanse ?? "—"), d.referanse !== null],
  ], c);
  return { subject, html: epostSkall({ pre: "Timen er avbestilt.", title: "Timen er avbestilt", body,
    button: ["Book ny time", d.lenker.bookNy],
    secondary: d.mottaker === "app" ? [["Åpne PlayerHQ", d.lenker.playerhq]] : [], dark: opts.mork,
  }) };
}

export function formaterKr(ore: number): string { return kr(ore / 100); }

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
