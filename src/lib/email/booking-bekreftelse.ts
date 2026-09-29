/**
 * EP-01 Bookingbekreftelse (gjest og appbruker). Fasit: Claude Design 7d7c2994,
 * ui_kits/epost/emails.js, mal «EP-01». Ren modul uten Prisma.
 *
 * Datoer er lagret som Oslo-veggklokke i UTC-feltene (se lib/booking/policy.ts),
 * derfor formateres de med timeZone "UTC".
 */
import { avsnitt, boks, epostSkall, esc, kr, kvTabell, type KvRad } from "./precision-mal";

export type BekreftelseInput = {
  type: "gjest" | "app";
  fornavn: string | null;
  tjeneste: string;
  varighetMin: number;
  /** Oslo-veggklokke i UTC-feltene. */
  start: Date;
  slutt: Date;
  sted: string;
  coach: string | null;
  /** Ferdig frist som Oslo-veggklokke i UTC-feltene. */
  frist: Date;
  /** Null for klippbooking. */
  prisOre: number | null;
  betalingsref: string | null;
  referanse: string;
  kalenderUrl: string;
  bookingUrl: string;
  endreUrl: string;
  opprettKontoUrl: string | null;
  spillerhqTilbud: { tekst: string; manedNok: number | null; arNok: number | null } | null;
  natt?: boolean;
};

const DATO = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const KLOKKE = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });

function stor(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export function datoTekst(d: Date): string {
  return stor(DATO.format(d).replace(/\./g, ".").replace(",", ""));
}
export function klokkeTekst(d: Date): string {
  return KLOKKE.format(d).replace(".", ":");
}

/** Google Calendar-lenke i Oslo-veggklokke. */
export function googleKalenderUrl(i: { tjeneste: string; start: Date; slutt: Date; sted: string; referanse: string }): string {
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").slice(0, 15);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `AK Golf: ${i.tjeneste}`,
    dates: `${f(i.start)}/${f(i.slutt)}`,
    ctz: "Europe/Oslo",
    details: `Referanse: ${i.referanse}`,
    location: i.sted,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function byggBekreftelse(i: BekreftelseInput): { subject: string; html: string } {
  const dag = datoTekst(i.start);
  const tid = `${klokkeTekst(i.start)}–${klokkeTekst(i.slutt)}`;
  const rader: KvRad[] = [
    { label: "Tjeneste", html: esc(`${i.tjeneste} ${i.varighetMin} min`) },
    { label: "Tid", html: esc(`${dag} kl. ${tid}`) },
    { label: "Sted", html: esc(i.sted) },
    { label: "Coach", html: i.coach ? esc(i.coach) : "—" },
    { label: "Pris", html: i.prisOre === null ? "Inkludert i abonnement" : esc(kr(i.prisOre / 100)) },
  ];
  if (i.prisOre === null) rader.push({ label: "Betaling", html: "1 klipp" });
  else if (i.betalingsref) rader.push({ label: "Betaling", html: esc(i.betalingsref), mono: true });
  rader.push({ label: "Referanse", html: esc(i.referanse), mono: true });

  const frist = `${datoTekst(i.frist).toLowerCase()} kl. ${klokkeTekst(i.frist)}`;
  const sekundaere =
    i.type === "app"
      ? [
          { tekst: "Se bookingen i PlayerHQ", href: i.bookingUrl },
          { tekst: "Endre eller avbestill", href: i.endreUrl },
        ]
      : [{ tekst: "Endre eller avbestill", href: i.endreUrl }];

  return {
    subject: `Bekreftet: ${i.tjeneste.toLowerCase()} ${dag.toLowerCase()} kl. ${klokkeTekst(i.start)}`,
    html: epostSkall({
      natt: i.natt,
      tittel: "Timen er bekreftet",
      forhandsvisning: "Timen er bekreftet. Legg den i kalenderen.",
      innhold: (c) =>
        avsnitt(c, `Hei${i.fornavn ? ` ${esc(i.fornavn)}` : ""}. Vi gleder oss til å se deg.`) +
        kvTabell(c, rader) +
        (i.prisOre === null
          ? avsnitt(c, `Kan du ikke komme? Avbestill senest <b>${esc(frist)}</b>, så legges klippet tilbake.`)
          : avsnitt(c, `Gratis avbestilling til <b>${esc(frist)}</b>. Etter det belastes full pris.`)) +
        (i.type === "gjest" && i.spillerhqTilbud
          ? boks(
              c,
              "Fortsett i PlayerHQ",
              `Med konto får du ${esc(i.spillerhqTilbud.tekst)}. ` +
                (i.spillerhqTilbud.manedNok !== null && i.spillerhqTilbud.arNok !== null
                  ? `Kostnad: ${esc(kr(i.spillerhqTilbud.manedNok))} per måned eller ${esc(kr(i.spillerhqTilbud.arNok))} per år. `
                  : "") +
                (i.opprettKontoUrl
                  ? `<a href="${esc(i.opprettKontoUrl)}" style="color:${c.link};text-decoration:underline">Opprett konto</a><br><span style="font-size:14px">Bookingene dine følger med inn i kontoen.</span>`
                  : ""),
            )
          : ""),
      knapp: { tekst: "Legg i kalender", href: i.kalenderUrl },
      sekundaere,
    }),
  };
}
