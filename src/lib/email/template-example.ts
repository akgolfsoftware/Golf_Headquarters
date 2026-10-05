import { avsnitt, esc, epostSkall } from "./precision-epost";

/** Kun syntetiske eksempeldata. Brukes av editoren og den eksplisitte testsendingen. */
export const TEMPLATE_EXAMPLE: Record<string, string> = {
  name: "Test Spiller", spillerNavn: "Test Spiller", spillerFornavn: "Test",
  coachNavn: "Test Coach", klubbNavn: "Eksempelklubb", serviceTypeName: "Coachingtime",
  okt_navn: "Coachingtime", date: "Torsdag 12.11.2026", okt_dato: "Torsdag 12.11.2026",
  time: "16:30", okt_tid: "16:30", location: "Eksempelanlegg", okt_lokasjon: "Eksempelanlegg",
  priceFormatted: "950,50 kr", pris: "950,50 kr", paymentRef: "TEST-BETALING",
  cancelDeadline: "Onsdag 11.11.2026 kl. 16:30", bookingId: "TEST-BOOKING",
  oldDate: "Onsdag 11.11.2026", oldTime: "15:00", refundLine: "Refusjon venter på behandling.",
  appUrl: "https://eksempel.invalid", link: "https://eksempel.invalid",
  plan_navn: "Eksempelplan", plan_lengde: "4 uker", hcp: "—",
};
export const TEMPLATE_TOKEN = /\{\{\s*(\w+)\s*\}\}/g;
const BOOKING_FIELDS = ["spillerNavn", "spillerFornavn", "coachNavn", "okt_navn", "okt_dato", "okt_tid", "okt_lokasjon", "pris", "link",
  "name", "serviceTypeName", "date", "time", "location", "priceFormatted", "paymentRef", "cancelDeadline", "bookingId", "appUrl"];
export function templateExample(template: { subject: string; body: string; slug?: string }) {
  const booking = ["booking-bekreftelse", "oekt-paaminnelse", "booking-flyttet", "booking-avbestilt"].includes(template.slug ?? "");
  const fields = booking ? [...BOOKING_FIELDS,
    ...(template.slug === "booking-flyttet" ? ["oldDate", "oldTime"] : []),
    ...(template.slug === "booking-avbestilt" ? ["refundLine"] : []),
  ] : Object.keys(TEMPLATE_EXAMPLE);
  const allowed = new Set(fields);
  const substitute = (value: string) => value.replace(TEMPLATE_TOKEN, (_, key: string) =>
    allowed.has(key) ? TEMPLATE_EXAMPLE[key] : "");
  const subject = substitute(template.subject).replace(/[\r\n]+/g, " ");
  const text = substitute(template.body);
  const body = text.split(/\n\n+/).map(p => avsnitt(esc(p.trim())
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />"))).join("");
  const unknown = [...new Set([...`${template.subject}\n${template.body}`.matchAll(TEMPLATE_TOKEN)]
    .map(m => m[1]).filter(key => !allowed.has(key)))];
  return { subject, text, unknown, fields, html: epostSkall({
    title: "Test av maltekst", pre: "Syntetisk eksempel – ingen booking er opprettet eller endret.",
    body: avsnitt("Dette er en test av emnet og den redigerbare teksten. Bookinge-poster får i tillegg faktarader og knapper fra den faktiske bookingen.") + body,
  }) };
}
