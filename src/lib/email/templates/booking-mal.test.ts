import { describe, expect, it } from "vitest";
import { byggBookingEpost, formaterKr, type BookingEpostData } from "./booking-mal";

const lenker: BookingEpostData["lenker"] = {
  kalender: "https://k.test/", bookingIApp: "https://a.test/b", endre: "https://a.test/e",
  veibeskrivelse: "https://m.test/", nyBooking: "https://a.test/booking", playerhq: "https://a.test/portal",
  opprettKonto: "https://a.test/auth/signup",
};
const basis: BookingEpostData = {
  type: "bekreftelse", mottaker: "gjest", fornavn: "Mari", tjeneste: "Privattime 60 min",
  dag: "Tirsdag 29. september 2026", klokke: "17:00–18:00", sted: "Studio 1", coach: "Anders Kristiansen",
  pris: "950 kr", betaling: { tekst: "pi_123", mono: true }, referanse: "b1",
  frist: "mandag 28. september 2026 kl. 17:00", lenker,
};

describe("bookinge-postene EP-01 til EP-04", () => {
  it("bruker Precision-fargene, ikke de gamle", () => {
    const { html } = byggBookingEpost(basis);
    expect(html).toContain("#e6e3dd");
    expect(html).toContain("#141413");
    expect(html).toContain("border-radius:8px");
    for (const gammel of ["#0A1F17", "#E5E3DD", "system-ui", "#FAFAF7", "border-radius:16px", "9999px"]) {
      expect(html).not.toContain(gammel);
    }
  });

  it("mørk mal bruker mørke tokens og har media-spørring for begge", () => {
    expect(byggBookingEpost(basis, { mork: true }).html).toContain("background:#0c0d0c");
    expect(byggBookingEpost(basis).html).toContain("prefers-color-scheme:dark");
  });

  it("EP-01: gjest får PlayerHQ-tilbud, appbruker får lenke til bookingen", () => {
    const g = byggBookingEpost(basis);
    expect(g.subject).toBe("Bekreftet: privattime tirsdag 29. september 2026 kl. 17:00");
    expect(g.html).toContain("Fortsett i PlayerHQ");
    expect(g.html).toContain("Legg i kalender");
    const a = byggBookingEpost({ ...basis, mottaker: "app" });
    expect(a.html).not.toContain("Fortsett i PlayerHQ");
    expect(a.html).toContain("Se bookingen i PlayerHQ");
  });

  it("EP-02: viser gammel tid overstrøket og ny tid", () => {
    const { html, subject } = byggBookingEpost({
      ...basis, type: "endret", dag: "Torsdag 1. oktober 2026", klokke: "16:00–17:00",
      gammelTid: { dag: "Tirsdag 29. september 2026", klokke: "17:00–18:00" },
    });
    expect(subject).toContain("Endret: ny tid");
    expect(html).toContain("<s ");
    expect(html).toContain("Tirsdag 29. september 2026 kl. 17:00–18:00");
    expect(html).toContain("<b>Torsdag 1. oktober 2026 kl. 16:00–17:00</b>");
  });

  it("EP-03: fristtekst avhenger av om fristen er passert", () => {
    const p = { ...basis, type: "paaminnelse" as const };
    expect(byggBookingEpost({ ...p, fristPassert: true }).html).toContain("ikke lenger mulig");
    expect(byggBookingEpost({ ...p, fristPassert: false }).html).toContain("Gratis avbestilling til");
    expect(byggBookingEpost(p).subject).toBe("I morgen kl. 17:00: privattime med Anders");
  });

  it("EP-04: refusjon og avbestilt-tidspunkt vises, manglende verdi er tankestrek", () => {
    const { html } = byggBookingEpost({ ...basis, type: "avbestilt", refusjon: "Klippet er lagt tilbake" });
    expect(html).toContain("Klippet er lagt tilbake");
    expect(html).toContain("Book ny time");
    expect(html).toMatch(/Avbestilt<\/td><td[^>]*>—<\/td>/);
  });

  it("manglende coach og betaling vises som «—», aldri gjetning", () => {
    const { html } = byggBookingEpost({ ...basis, coach: null, betaling: { tekst: null, mono: true } });
    expect(html.match(/>—</g)?.length).toBe(2);
  });

  it("escaper HTML i navn og verdier", () => {
    const { html } = byggBookingEpost({ ...basis, fornavn: "<script>x</script>", sted: 'A "B" & C' });
    expect(html).not.toContain("<script>x");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("A &quot;B&quot; &amp; C");
  });

  it("formaterer kroner med hardt mellomrom", () => {
    expect(formaterKr(95000)).toBe("950 kr");
    expect(formaterKr(269000)).toBe("2 690 kr");
  });
});
