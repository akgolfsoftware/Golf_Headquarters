/**
 * EP-01 Bookingbekreftelse (gjest og appbruker). Fasit: Claude Design 7d7c2994,
 * ui_kits/epost/emails.js, mal «EP-01». Ren modul uten Prisma.
 *
 * Datoer er lagret som Oslo-veggklokke i UTC-feltene (se lib/booking/policy.ts),
 * derfor formateres de med timeZone "UTC".
 */
import { avsnitt, boks, epostSkall, esc, kr, faktaRader, kortDag, EPOST_LYS, EPOST_MORK, type FaktaRad } from "./precision-epost";

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
  introHtml?: string;
  /** Duo: deltaker 2 betalte ikke. Navnet på den som booket og betalte, i stedet for pris og betaling. */
  betaltAv?: string | null;
  /** Tekst på endre-lenken. Deltaker 2 i duo kan bare melde seg av. */
  endreEtikett?: string;
  /** Stripe-betalingslenke (kort og Apple Pay) når coachen har booket og kunden ikke har betalt. */
  betalingsUrl?: string | null;
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
  const c = i.natt ? EPOST_MORK : EPOST_LYS;
  const dag = datoTekst(i.start);
  const tid = `${klokkeTekst(i.start)}–${klokkeTekst(i.slutt)}`;
  const rader: FaktaRad[] = [
    ["Tjeneste", esc(`${i.tjeneste} ${i.varighetMin} min`)],
    ["Tid", esc(`${dag} kl. ${tid}`)],
    ["Sted", esc(i.sted)],
    ["Coach", i.coach ? esc(i.coach) : "—"],
  ];
  if (i.betaltAv) rader.push(["Betaling", esc(`Betalt av ${i.betaltAv}`)]);
  else {
    rader.push(["Pris", i.prisOre === null ? "Inkludert i abonnement" : esc(kr(i.prisOre / 100))]);
    if (i.prisOre === null) rader.push(["Betaling", "1 klipp"]);
    else if (i.betalingsref) rader.push(["Betaling", esc(i.betalingsref), true]);
  }
  rader.push(["Referanse", esc(i.referanse), true]);

  const frist = `${datoTekst(i.frist).toLowerCase()} kl. ${klokkeTekst(i.frist)}`;
  const sekundaere: [string, string][] =
    i.type === "app"
      ? [
          ["Se bookingen i PlayerHQ", i.bookingUrl],
          [i.endreEtikett ?? "Endre eller avbestill", i.endreUrl],
        ]
      : [[i.endreEtikett ?? "Endre eller avbestill", i.endreUrl]];

  const skalBetale = !!i.betalingsUrl;
  return {
    subject: `Bekreftet: ${i.tjeneste.toLowerCase()} ${dag.toLowerCase()} kl. ${klokkeTekst(i.start)}`,
    html: epostSkall({
      dark: i.natt,
      title: "Timen er bekreftet",
      merke: skalBetale ? "Bekreftet, venter på betaling" : i.prisOre && !i.betaltAv ? "Bekreftet og betalt" : "Bekreftet",
      tidskort: {
        dag: kortDag(i.start, "utc"),
        tid,
        linjer: [`${i.tjeneste} ${i.varighetMin} min${i.coach ? ` med ${i.coach}` : ""}`, i.sted],
      },
      pre: "Timen er bekreftet. Legg den i kalenderen.",
      body:
        (i.introHtml ?? avsnitt(`Hei${i.fornavn ? ` ${esc(i.fornavn)}` : ""}. Vi gleder oss til å se deg.`, c)) +
        faktaRader(rader, c) +
        (i.prisOre === null
          ? avsnitt(`Kan du ikke komme? Avbestill før <b>${esc(frist)}</b>, så legges klippet tilbake.`, c)
          : avsnitt(i.prisOre === 0 ? "Timen er gratis. Gi beskjed hvis du ikke kan komme." : `Gratis avbestilling før <b>${esc(frist)}</b>. Etter det refunderes ikke betalingen.`, c)) +
        (i.type === "gjest" && i.spillerhqTilbud
          ? boks(
              "Fortsett i PlayerHQ",
              `Med konto får du ${esc(i.spillerhqTilbud.tekst)}. ` +
                (i.spillerhqTilbud.manedNok !== null && i.spillerhqTilbud.arNok !== null
                  ? `Kostnad: ${esc(kr(i.spillerhqTilbud.manedNok))} per måned eller ${esc(kr(i.spillerhqTilbud.arNok))} per år. `
                  : "") +
                (i.opprettKontoUrl
                  ? `<a class="lnk" href="${esc(i.opprettKontoUrl)}" style="display:inline-block;padding:14px 6px;color:${c.link};text-decoration:underline">Opprett konto</a>`
                  : ""),
              c,
            )
          : ""),
      button: skalBetale ? ["Betal med kort eller Apple Pay", i.betalingsUrl as string] : ["Legg i kalender", i.kalenderUrl],
      secondary: skalBetale ? [["Legg i kalender", i.kalenderUrl], ...sekundaere] : sekundaere,
    }),
  };
}
