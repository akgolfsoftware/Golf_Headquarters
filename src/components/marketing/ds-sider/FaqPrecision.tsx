import { Akkordeon, Knapp } from "@/components/marketing/ak";
import { PLAYERHQ_PRIS_AAR_ORE, PLAYERHQ_PRIS_MND_ORE } from "@/lib/domain/abonnement";

import { SeksjonsHode, Seksjon, SideHode, kroner } from "./felles";

/**
 * Spørsmål og svar (/faq) i «AK Golf Precision Athletics».
 * Svarene følger BUSINESS-RULES §Abonnement og §Booking og beslutninger.md
 * (prøveuke, 24-timersfristen, kort og Apple Pay). Rettet fra forrige versjon:
 * «én time er 50 minutter» (Flex er 20, 50 eller 90), «leieutstyr for
 * nybegynnere» (motsa coachingsiden) og «AI-coach» (heter Caddie).
 */

const MND = kroner(PLAYERHQ_PRIS_MND_ORE);
const AAR = kroner(PLAYERHQ_PRIS_AAR_ORE);

const GRUPPER = [
  {
    navn: "Coaching",
    poster: [
      {
        tittel: "Hva er forskjellen på en enkelttime og fast oppfølging?",
        innhold:
          "En enkelttime (Flex) er én time på 20, 50 eller 90 minutter. Fast oppfølging er en coaching-pakke: Performance gir to timer i måneden, Performance Pro fire, med plan i PlayerHQ mellom timene.",
      },
      {
        tittel: "Hvem passer AK Golf Academy for?",
        innhold:
          "Spillere som vil ha struktur og fremgang, fra nybegynner til turneringsspiller. Vi tar imot juniorer og voksne.",
      },
      {
        tittel: "Må jeg ha egne køller?",
        innhold:
          "Ta med baggen din til timene. I juniorgruppene til og med U12 har vi køller til lån.",
      },
    ],
  },
  {
    navn: "Booking",
    poster: [
      {
        tittel: "Hvordan booker jeg?",
        innhold:
          "På bookingsiden eller i PlayerHQ. Du velger tjeneste, dag og tid. Bookingen bekreftes når betalingen er gjennomført, og bekreftelsen kommer på e-post.",
      },
      {
        tittel: "Hvordan betaler jeg?",
        innhold: "Med kort eller Apple Pay. Har du en coaching-pakke, trekker timen ett klipp fra pakken.",
      },
      {
        tittel: "Kan jeg avbestille eller flytte?",
        innhold:
          "Ja, fram til 24 timer før timen. Da får du pengene eller klippet tilbake, og du kan flytte timen selv til en ledig tid. Senere enn det refunderes ikke. Avlyser coachen, får du alltid alt tilbake.",
      },
    ],
  },
  {
    navn: "PlayerHQ",
    poster: [
      {
        tittel: "Hva er PlayerHQ?",
        innhold:
          "Appen der plan, økter, runder, tester og statistikk ligger samlet. Fanene heter I dag, Plan, Stats og Meg. Caddie er AI-hjelperen i appen.",
      },
      {
        tittel: "Hva koster PlayerHQ?",
        innhold: `Gratis gir testbatteriet, runderegistrering og booking, uten utløpsdato og uten kort. Full koster ${MND} i måneden eller ${AAR} i året. Første gang du velger Full, får du én uke før første trekk.`,
      },
      {
        tittel: "Når er Full inkludert?",
        innhold:
          "Når du har coaching-pakken Performance eller Performance Pro, eller trener i en gruppe gjennom AK Golf.",
      },
    ],
  },
];

export function FaqPrecision() {
  return (
    <>
      <SideHode
        etikett="Før du starter"
        tittel="Spørsmål og svar."
        ingress="Korte svar på det folk lurer på før de starter hos oss."
        knapper={
          <>
            <Knapp href="/booking" storrelse="lg">
              Book time
            </Knapp>
            <Knapp href="/kontakt" variant="sekundaer" storrelse="lg">
              Skriv til oss
            </Knapp>
          </>
        }
      />
      {GRUPPER.map((g, i) => (
        <Seksjon key={g.navn} id={g.navn.toLowerCase()} senk={i % 2 === 0}>
          <div style={{ maxWidth: "72ch" }}>
            <SeksjonsHode etikett={String(i + 1).padStart(2, "0")} tittel={g.navn} />
            <Akkordeon poster={g.poster} style={{ marginTop: "var(--ak-r-5)" }} />
          </div>
        </Seksjon>
      ))}
      <Seksjon id="mer">
        <SeksjonsHode
          etikett="Fant du ikke svaret?"
          tittel="Skriv til oss"
          ingress="post@akgolf.no, eller bruk skjemaet på kontaktsiden."
        />
        <div className="mt-ak-5 flex flex-wrap gap-ak-3">
          <Knapp href="/kontakt">Skriv til oss</Knapp>
          <Knapp href="/priser" variant="sekundaer">
            Se priser
          </Knapp>
        </div>
      </Seksjon>
    </>
  );
}
