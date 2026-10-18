import { Akkordeon, Knapp } from "@/components/marketing/ak";

import {
  LISTE,
  Rad,
  SeksjonsHode,
  Seksjon,
  SideHode,
  Tekstkort,
  hentTjenester,
} from "./felles";

/**
 * Coaching (/coaching) i «AK Golf Precision Athletics». Mønster fra forsiden.
 * Laveste pris leses fra `ServiceType.priceOre`; resten av prisene står på /priser.
 * Utelatt fra forrige versjon: «Mest valgt» (ikke målt) og tittelen ved Markus
 * på denne siden (titlene står på /coacher).
 */

const FORMER = [
  {
    navn: "Flex",
    hvor: "20, 50 eller 90 min",
    tekst: "Én time uten abonnement. Én konkret sak, eller en lengre økt.",
  },
  {
    navn: "Flex Duo",
    hvor: "To spillere",
    tekst: "Samme time for to. Én betaler.",
  },
  {
    navn: "Performance",
    hvor: "2 timer / mnd",
    tekst: "Fast oppfølging med plan i PlayerHQ. Full er inkludert.",
  },
  {
    navn: "Performance Pro",
    hvor: "4 timer / mnd",
    tekst: "Dobbel frekvens, med TrackMan og video. Full er inkludert.",
  },
  {
    navn: "Gruppe-økt",
    hvor: "Fast gruppe",
    tekst: "Trening i gruppe med coach, tilpasset nivået i gruppa.",
  },
];

const STEG = [
  { tittel: "Ankomst", tekst: "Kort prat om form og hva timen skal handle om." },
  { tittel: "Måling", tekst: "TrackMan, video eller tester. Tall før mening." },
  { tittel: "Arbeid", tekst: "Trening på det som koster flest slag." },
  { tittel: "Plan", tekst: "Neste steg legges i PlayerHQ før du drar." },
];

const SPORSMAL = [
  {
    tittel: "Trenger jeg egne køller?",
    innhold: "Ja, ta med baggen din. Si fra på forhånd hvis du trenger tilpasning.",
  },
  {
    tittel: "Hva hvis jeg må avbestille?",
    innhold:
      "Avbestiller du mer enn 24 timer før, er det gratis. Du kan også flytte timen selv til en ledig tid innenfor samme frist.",
  },
  {
    tittel: "Passer dette for nybegynnere?",
    innhold: "Ja. Tempo og språk tilpasses. En Flex-time er en vanlig start.",
  },
  {
    tittel: "Hvor foregår timene?",
    innhold:
      "Ute på Gamle Fredrikstad GK i sesongen, og inne i studio med TrackMan hele året. Stedet står i bookingen.",
  },
];

export async function CoachingPrecision() {
  const tjenester = await hentTjenester();
  const fraPris = tjenester?.timer[0]?.pris ?? null;
  return (
    <>
      <SideHode
        etikett="Coaching"
        tittel="En coach som følger deg over tid."
        ingress="Ikke bare én time på rangen. Måling, plan og timer henger sammen, og alt ligger i PlayerHQ etterpå."
        knapper={
          <>
            <Knapp href="/booking" storrelse="lg">
              {fraPris ? `Book time · fra ${fraPris}` : "Book time"}
            </Knapp>
            <Knapp href="/priser" variant="sekundaer" storrelse="lg">
              Se priser
            </Knapp>
          </>
        }
        bilde={{ src: "/images/akademy/coach-observerer.jpg", alt: "Coach følger en spiller på rangen" }}
      />

      <Seksjon id="former" senk>
        <div className="grid gap-ak-6 md:grid-cols-[0.8fr_1.2fr]">
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode
              etikett="Former"
              tittel="Fem måter å ha coaching på"
              ingress="Performance og Performance Pro er coaching-pakker: antall timer i måneden, ikke nivåer i appen."
            />
          </div>
          <ul style={LISTE}>
            {FORMER.map((f, i) => (
              <Rad
                key={f.navn}
                nr={String(i + 1).padStart(2, "0")}
                navn={
                  <>
                    {f.navn}
                    <span style={{ display: "block", color: "var(--ak-dempet)", fontWeight: 400 }}>
                      {f.tekst}
                    </span>
                  </>
                }
                hvor={f.hvor}
              />
            ))}
          </ul>
        </div>
      </Seksjon>

      <Seksjon id="timen">
        <SeksjonsHode etikett="Slik går en time" tittel="Fra ankomst til plan" />
        <div className="mt-ak-5 grid gap-ak-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEG.map((s, i) => (
            <Tekstkort
              key={s.tittel}
              etikett={String(i + 1).padStart(2, "0")}
              tittel={s.tittel}
              tekst={s.tekst}
            />
          ))}
        </div>
      </Seksjon>

      <Seksjon id="sporsmal" senk>
        <div style={{ maxWidth: "72ch" }}>
          <SeksjonsHode etikett="Før du booker" tittel="Spørsmål som går igjen" />
          <Akkordeon poster={SPORSMAL} style={{ marginTop: "var(--ak-r-5)" }} />
        </div>
      </Seksjon>

      <Seksjon id="book">
        <SeksjonsHode
          etikett="Kom i gang"
          tittel="Én time forteller mer enn ti tips."
          ingress="Book en time, så finner vi ut hva som er riktig vei videre for spillet ditt."
        />
        <div className="mt-ak-5 flex flex-wrap gap-ak-3">
          <Knapp href="/booking">Book time</Knapp>
          <Knapp href="/coacher" variant="sekundaer">
            Møt coachene
          </Knapp>
        </div>
      </Seksjon>
    </>
  );
}
