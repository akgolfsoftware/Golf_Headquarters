import { Knapp } from "@/components/marketing/ak";
import { PLAYERHQ_PRIS_AAR_ORE, PLAYERHQ_PRIS_MND_ORE } from "@/lib/domain/abonnement";

import { Foto, SeksjonsHode, Seksjon, SideHode, Tekstkort, kroner } from "./felles";

/**
 * PlayerHQ (/playerhq) i «AK Golf Precision Athletics». Mønster fra forsiden.
 * Produktnavnet er PlayerHQ (ordboka §2). Fanene er I dag · Plan · Stats · Meg
 * (beslutninger.md 28.09). Prisen leses fra abonnementsdomenet.
 * Rettet fra forrige versjon: «Første måned er alltid gratis» (det er én
 * prøveuke) og «gratis med coaching» (Full følger med coaching-pakken).
 */

const MND = kroner(PLAYERHQ_PRIS_MND_ORE);
const AAR = kroner(PLAYERHQ_PRIS_AAR_ORE);

const FANER = [
  { tittel: "I dag", tekst: "Dagens økter øverst, klare til å starte." },
  { tittel: "Plan", tekst: "År, periode, måned og uke. Hver økt vet hvorfor den finnes." },
  { tittel: "Stats", tekst: "Snittscore, Strokes Gained, trening og tester." },
  { tittel: "Meg", tekst: "Profil, målsetninger, abonnement og personvern." },
];

const FUNKSJONER = [
  {
    tittel: "Workbench",
    tekst: "Bygg økter selv, eller følg planen coachen har lagt inn.",
  },
  {
    tittel: "Live-økt",
    tekst: "Gjennomfør økta med øvelser, klokke og tellere, på rangen, banen eller i simulatoren.",
  },
  {
    tittel: "Tester",
    tekst: "Standardiserte tester som viser fremgangen i tall.",
  },
  {
    tittel: "TrackMan",
    tekst: "Slagdata kobles på treningen, så du ser hva som faktisk endrer seg.",
  },
  {
    tittel: "Runder",
    tekst: "Registrer runden slag for slag. Strokes Gained og brutto score rett etterpå.",
  },
  {
    tittel: "Coach",
    tekst: "Coachen ser det samme som deg og justerer planen mellom timene.",
  },
];

export function PlayerHQPrecision() {
  return (
    <>
      <SideHode
        etikett="PlayerHQ"
        tittel="Hele treningen din. Ett sted."
        ingress="PlayerHQ er appen bak coachingen: plan, økter, tester, runder og TrackMan-tall, samlet og fulgt opp."
        knapper={
          <>
            <Knapp href="/auth/signup" storrelse="lg">
              Lag gratis konto
            </Knapp>
            <Knapp href="/booking" variant="sekundaer" storrelse="lg">
              Book time
            </Knapp>
          </>
        }
        bilde={{ src: "/brand/heroes/hq-hero-16x9.webp", alt: "PlayerHQ i bruk i coachingstudioet" }}
      />

      <Seksjon id="faner" senk>
        <SeksjonsHode etikett="Fire faner" tittel="I dag · Plan · Stats · Meg" />
        <div className="mt-ak-5 grid gap-ak-4 sm:grid-cols-2 lg:grid-cols-4">
          {FANER.map((f) => (
            <Tekstkort key={f.tittel} tittel={f.tittel} tekst={f.tekst} />
          ))}
        </div>
      </Seksjon>

      <Seksjon id="funksjoner">
        <SeksjonsHode etikett="Funksjoner" tittel="Det treningen trenger" />
        <div className="mt-ak-5 grid gap-ak-4 sm:grid-cols-2 lg:grid-cols-3">
          {FUNKSJONER.map((f) => (
            <Tekstkort key={f.tittel} tittel={f.tittel} tekst={f.tekst} />
          ))}
        </div>
      </Seksjon>

      <Seksjon id="banen" senk>
        <div className="grid gap-ak-6 md:grid-cols-2 md:items-center">
          <Foto src="/brand/mockups/mockup-iphone.webp" alt="PlayerHQ på mobil" />
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode
              etikett="På banen"
              tittel="Planen ligger i lomma"
              ingress="Logg runder, følg økter og se tallene dine der treningen faktisk skjer."
            />
          </div>
        </div>
      </Seksjon>

      <Seksjon id="pris">
        <SeksjonsHode
          etikett="Pris"
          tittel="Gratis og Full"
          ingress={`Gratis gir testbatteriet, runderegistrering og booking, uten utløpsdato. Full koster ${MND} i måneden eller ${AAR} i året, uten binding. Første gang du velger Full, får du én uke før første trekk. Har du coaching-pakken Performance eller Performance Pro, er Full inkludert.`}
        />
        <div className="mt-ak-5 flex flex-wrap gap-ak-3">
          <Knapp href="/auth/signup">Lag gratis konto</Knapp>
          <Knapp href="/priser" variant="sekundaer">
            Se alle priser
          </Knapp>
          <Knapp href="/auth/login" variant="tekst">
            Logg inn
          </Knapp>
        </div>
      </Seksjon>
    </>
  );
}
