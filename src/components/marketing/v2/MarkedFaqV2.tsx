/* AK Golf HQ — MARKEDSSIDE: Ofte stilte spørsmål (/faq).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §pris (spørsmålslista `.qa`) + §prosa-kolonnen. Skallet er PkShell
   (variant «side»). Ingen inline-stiler, ingen egne farger.

   Trekkspillet er native <details>, som i fasiten — ingen klient-state,
   og spørsmålene er lenkbare/søkbare uten JavaScript.
   COPY: uendret fra forrige versjon (kilde mlegacy/faq). */

import Link from "next/link";
import { PkShell } from "./paper/PkShell";

type Sporsmal = { q: string; a: string };

const FAQ: { kategori: string; punkter: Sporsmal[] }[] = [
  {
    kategori: "Coaching",
    punkter: [
      {
        q: "Hva er forskjellen på en vanlig time og et coachingforløp?",
        a: "En vanlig time er én økt på 50 minutter. Et coachingforløp er et personlig opplegg med treningsplan, oppfølging mellom timer, og tilgang til PlayerHQ. Forløp er bygd for spillere som vil ha målbar fremgang over tid.",
      },
      {
        q: "Hvem passer Academy for?",
        a: "Spillere som er klare for tett oppfølging, uansett handicap, fra nybegynner til elite. Vi tar imot juniorer, voksne mosjonister og turneringsspillere. Felles for alle er at de vil ha struktur og fremgang.",
      },
      {
        q: "Hvor mange timer trenger jeg?",
        a: "De fleste begynner med 4–8 timer over en sesong. Vi tilpasser frekvens etter mål, tilgjengelig tid og treningsvilje. Vil du ha fast oppfølging, velger du en coaching-pakke: Performance gir 2 økter per måned, Performance Pro gir 4.",
      },
    ],
  },
  {
    kategori: "Booking",
    punkter: [
      {
        q: "Hvordan booker jeg time?",
        a: "På bookingsiden (akgolf.no/booking) eller direkte fra PlayerHQ-profilen din. Du velger coach, tjeneste, dato og tid. Bekreftelse kommer på e-post umiddelbart.",
      },
      {
        q: "Kan jeg avbestille?",
        a: "Ja. Avbestilling senest 24 timer før oppmøte gir full refusjon eller credit-tilbakeføring. Senere avbestilling kan flyttes etter avtale, men refunderes ikke.",
      },
      {
        q: "Betaler jeg per time eller med abonnement?",
        a: "Begge deler er mulig. Enkelttimer betales via Stripe ved booking. Med en coaching-pakke (Performance eller Performance Pro) er øktene inkludert, 2 eller 4 per måned, og bookes innenfor pakken.",
      },
    ],
  },
  {
    kategori: "PlayerHQ",
    punkter: [
      {
        q: "Hva er PlayerHQ?",
        a: "Din digitale spillerportal. Her finner du treningsplaner, runder, tester, AI-coach og fremdriftsdata. Appen er gratis med aktiv coaching-pakke (Performance eller Performance Pro), i prøveuka, eller om du trener i gruppe gjennom AK Golf. Ellers koster den 299 kr/mnd.",
      },
      {
        q: "Trenger jeg å være kunde for å bruke PlayerHQ?",
        a: "Nei. Alle kan opprette konto og prøve PlayerHQ gratis i én uke uten å være Academy-kunde. Etter prøveuka er appen gratis så lenge du har en aktiv coaching-pakke eller trener i gruppe gjennom AK Golf. Ellers 299 kr/mnd.",
      },
    ],
  },
  {
    kategori: "Praktisk",
    punkter: [
      {
        q: "Hvor er dere lokalisert?",
        a: "Vi holder til på Mulligan Indoor Golf i Fredrikstad (Produksjonsveien 21) og Sarpsborg (Bjørnstadveien 12), samt Gamle Fredrikstad Golfklubb (Torsnesveien 16) fra mai til oktober. Alle anlegg er fullt utstyrt for coaching.",
      },
      {
        q: "Hva med utstyr, må jeg ha eget?",
        a: "Vi har leieutstyr tilgjengelig for nybegynnere. For coachingforløp anbefaler vi at du etter hvert investerer i tilpassede køller, og vi hjelper deg med valget når tiden er moden.",
      },
    ],
  },
];

export function MarkedFaqV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-faq">
      <div className="pk-sek">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Før du starter</span>
          <h1 className="pk-hero">Ofte stilte spørsmål.</h1>
          <p className="pk-ing">
            Korte, ærlige svar på det folk lurer på før de starter hos oss.
          </p>

          {FAQ.map((kat) => (
            <section key={kat.kategori} className="pk-qa-gruppe">
              <h2 className="pk-sekt pk-sekt-liten">{kat.kategori}</h2>
              {kat.punkter.map((p) => (
                <details className="pk-qa" key={p.q}>
                  <summary>{p.q}</summary>
                  <p>{p.a}</p>
                </details>
              ))}
            </section>
          ))}
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">Fortsatt usikker?</span>
          <h2 className="pk-sekt">Fant du ikke svar?</h2>
          <p className="pk-ing">Skriv til oss, så svarer vi som regel samme dag.</p>
          <div className="pk-knapperad pk-knapperad-midt">
            <a className="pk-btn pk-btn-ink" href="mailto:post@akgolf.no">
              post@akgolf.no
            </a>
            <Link className="pk-btn" href="/kontakt">
              Kontaktskjema
            </Link>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
